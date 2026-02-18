import { Socket } from "socket.io";
import { prisma } from "@repo/db";
import { getSandbox } from "./sandboxManager.js";

const WORK_DIR = "/home/user";
const writeDebounceMap = new Map<string, NodeJS.Timeout>();

export function handleEditorEvents(socket: Socket) {
    socket.on("editor:event", async ({ interviewId, value, path }) => {
        try {
            await prisma.interviewEvent.create({
                data: {
                    interviewId,
                    type: 'editor_update',
                    content: typeof value === 'string' ? value : JSON.stringify(value),
                    metadata: { socketId: socket.id, path }
                }
            });

            if (path) {
                const fullPath = path.startsWith(WORK_DIR) ? path : `${WORK_DIR}${path}`;
                const key = `${interviewId}:${fullPath}`;

                if (writeDebounceMap.has(key)) {
                    clearTimeout(writeDebounceMap.get(key));
                }

                const timeout = setTimeout(async () => {
                    try {
                        const sandbox = await getSandbox(interviewId);
                        if (sandbox) {
                            await sandbox.files.write(fullPath, value);
                        }
                    } catch (e) {
                        console.error(`[Interview: ${interviewId}] Failed to write ${fullPath}:`, e);
                    } finally {
                        writeDebounceMap.delete(key);
                    }
                }, 1000);

                writeDebounceMap.set(key, timeout);
            }
        } catch (e) {
            console.error("Editor persistence failed:", e);
        }
    });
}
