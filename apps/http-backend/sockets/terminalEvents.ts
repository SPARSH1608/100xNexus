import { Socket } from "socket.io";
import { prisma } from "@repo/db";
import { getSandbox, getTerminal, setTerminal, removeTerminal, trackSocket, untrackSocket, getInterviewForSocket, getTerminalSession } from "./sandboxManager.js";

export function handleTerminalEvents(socket: Socket) {
    socket.on("terminal:join", async ({ interviewId }: { interviewId: string }) => {
        console.log(`[${socket.id}] User joining interview ${interviewId} (Room: terminal-${interviewId})`);
        trackSocket(socket.id, interviewId);
        socket.join(`terminal-${interviewId}`);

        const sandbox = await getSandbox(interviewId);
        if (!sandbox) {
            socket.emit("terminal:error", "Failed to connect to sandbox");
            return;
        }

        try {
            console.log(`[Interview: ${interviewId}] Setting up terminal session (Socket: ${socket.id})...`);

            const WORK_DIR = "/home/user";
            let lastSyncTime = 0;
            const SYNC_COOLDOWN = 1000;

            const syncFiles = async (force = false) => {
                const now = Date.now();
                if (!force && now - lastSyncTime < SYNC_COOLDOWN) return;
                lastSyncTime = now;

                try {
                    console.log(`[Interview: ${interviewId}] Syncing files via 'find' in ${WORK_DIR}...`);

                    const findCmd = `find . -maxdepth 4 -not -path '*/.*' -printf "%p|%y\\n"`;
                    const result = await sandbox.commands.run(findCmd, { cwd: WORK_DIR });

                    if (result.exitCode !== 0) {
                        console.error(`[Interview: ${interviewId}] Find failed: ${result.stderr}`);
                        throw new Error(`Find failed with exit code ${result.exitCode}`);
                    }

                    const rawOutput = result.stdout.trim();
                    console.log(`[Interview: ${interviewId}] Raw find output (first 100 chars): ${rawOutput.substring(0, 100)}...`);

                    const lines = rawOutput ? rawOutput.split("\n") : [];
                    console.log(`[Interview: ${interviewId}] find output lines: ${lines.length}`);

                    const mappedFiles = lines
                        .filter(line => line !== "." && line.includes("|"))
                        .map(line => {
                            const parts = line.split("|");
                            if (parts.length < 2) return null;
                            const relPath = parts[0]!;
                            const typeChar = parts[1]!;

                            const cleanRelPath = relPath.startsWith("./") ? relPath.substring(2) : (relPath.startsWith(".") ? relPath.substring(1) : relPath);
                            const path = cleanRelPath.startsWith("/") ? cleanRelPath : "/" + cleanRelPath;
                            const name = path.split("/").pop() || "";

                            if (path.startsWith("/node_modules/")) return null;

                            return {
                                id: WORK_DIR + (path.startsWith("/") ? path : "/" + path),
                                name: name,
                                type: typeChar === 'd' ? 'folder' : 'file',
                                path: path
                            };
                        })
                        .filter((f): f is Exclude<typeof f, null> => f !== null);

                    console.log(`[Interview: ${interviewId}] Emitting ${mappedFiles.length} files to socket ${socket.id}`);
                    socket.emit("file:sync", mappedFiles);
                } catch (e) {
                    console.error("Shell-based sync failed, falling back to SDK list:", e);
                    try {
                        const files = await sandbox.files.list(WORK_DIR);
                        const mappedFiles = files
                            .filter((f: any) => !f.name?.startsWith('.'))
                            .map((f: any) => {
                                let relativePath = f.path.startsWith(WORK_DIR)
                                    ? f.path.substring(WORK_DIR.length)
                                    : f.path;
                                if (!relativePath.startsWith("/")) relativePath = "/" + relativePath;

                                return {
                                    id: f.path,
                                    name: f.name || f.path.split('/').pop() || '',
                                    type: f.isDir || (f as any).type === 'dir' ? 'folder' : 'file',
                                    path: relativePath
                                };
                            });
                        socket.emit("file:sync", mappedFiles);
                    } catch (e2) {
                        console.error("Fallback sync failed:", e2);
                    }
                }
            };

            const ensureTerminal = async () => {
                let session = getTerminalSession(interviewId);

                if (!session || !session.terminal) {
                    console.log(`[Interview: ${interviewId}] Creating new session...`);
                    // @ts-ignore
                    const terminal = await sandbox.pty.create({
                        cwd: WORK_DIR,
                        onData: (data: Uint8Array) => {
                            const output = new TextDecoder().decode(data);
                            // Broadcast to room
                            socket.nsp.to(`terminal-${interviewId}`).emit("terminal:output", output);
                        }
                    });
                    setTerminal(interviewId, terminal);
                } else {
                    const terminal = session.terminal;
                    console.log(`[Interview: ${interviewId}] Reconnecting to existing terminal ${terminal.pid}`);

                }
                return getTerminal(interviewId);
            };

            const terminal = await ensureTerminal();
            let commandBuffer = "";

            socket.on("terminal:input", async ({ input }) => {
                const currentTerminal = await ensureTerminal();
                if (currentTerminal) {
                    try {
                        // @ts-ignore
                        await sandbox.pty.sendInput(currentTerminal.pid, new TextEncoder().encode(input));

                        if (input === "\r" || input === "\n") {
                            if (commandBuffer.trim()) {
                                try {
                                    await prisma.interviewEvent.create({
                                        data: {
                                            interviewId: interviewId,
                                            type: 'terminal_command',
                                            content: commandBuffer.trim(),
                                            metadata: { socketId: socket.id }
                                        }
                                    });
                                } catch (e) { console.error("Event log failed:", e); }
                                commandBuffer = "";
                            }
                            setTimeout(syncFiles, 1500);
                            setTimeout(syncFiles, 5000);
                        } else if (input === "\x7f" || input === "\b") {
                            commandBuffer = commandBuffer.slice(0, -1);
                        } else if (input.length === 1) {
                            commandBuffer += input;
                        }
                    } catch (err: any) {
                        if (err.message.includes("not found")) {
                            removeTerminal(interviewId);
                            const newTerminal = await ensureTerminal();
                            // @ts-ignore
                            await sandbox.pty.sendInput(newTerminal.pid, new TextEncoder().encode(input));
                        }
                    }
                }
            });

            socket.on("terminal:resize", async ({ cols, rows }) => {
                const currentTerminal = getTerminal(interviewId);
                if (currentTerminal) {
                    try {
                        // @ts-ignore
                        await sandbox.pty.resize(currentTerminal.pid, { size: { cols, rows } });
                    } catch (e) {
                        try {
                            // @ts-ignore
                            await sandbox.pty.resize(currentTerminal.pid, cols, rows);
                        } catch (e2) { console.error("Resize failed:", e2); }
                    }
                }
            });

            socket.on("file:sync", () => syncFiles(true));
            socket.on("file:sync:request", () => syncFiles(true));

            socket.on("port:get_url", async ({ port }) => {
                const sandbox = await getSandbox(interviewId);
                if (sandbox) {
                    try {
                        const check = await sandbox.commands.run(`lsof -i :${port}`);
                        if (check.exitCode === 0 && check.stdout.trim().length > 0) {
                            const url = sandbox.getHost(port);
                            socket.emit("port:url", { port, url: `https://${url}` });
                        } else {
                            socket.emit("port:error", { message: `Port ${port} is not active. Please start your server (e.g., 'node index.js').` });
                        }
                    } catch (e) {
                        console.error("Port check failed:", e);
                        const url = sandbox.getHost(port);
                        socket.emit("port:url", { port, url: `https://${url}` });
                    }
                }
            });

            await syncFiles(true);
            setTimeout(() => syncFiles(true), 1500);
            setTimeout(() => syncFiles(true), 5000);

            // @ts-ignore
            await sandbox.pty.sendInput(terminal.pid, new TextEncoder().encode("clear\necho 'Welcome to the Interview Sandbox!'\n"));

        } catch (err) {
            console.error("Error creating pty:", err);
            socket.emit("terminal:error", "Failed to create terminal session");
        }
    });

    socket.on("disconnect", async () => {
        const interviewId = getInterviewForSocket(socket.id);
        if (interviewId) {
            console.log(`[${socket.id}] Socket disconnected from ${interviewId}. Persistence maintained.`);
            untrackSocket(socket.id);
        }
    });
}
