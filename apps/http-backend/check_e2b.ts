import { Sandbox } from "@e2b/code-interpreter";
import dotenv from "dotenv";
dotenv.config();

async function check() {
    try {
        const sandbox = await Sandbox.create();
        console.log("Sandbox created:", sandbox.sandboxId);

        const pty = await (sandbox as any).pty.create({
            onData: (data: Uint8Array) => console.log("PTY Output:", new TextDecoder().decode(data))
        });

        const pid = (pty as any).pid;
        console.log("PTY PID:", pid);

        // Try sendInput with Uint8Array and PID
        console.log("Trying sandbox.pty.sendInput(pid, Uint8Array)...");
        try {
            await (sandbox as any).pty.sendInput(pid, new TextEncoder().encode("ls\n"));
            console.log("sendInput succeeded with PID and Uint8Array");
        } catch (e: any) {
            console.log("sendInput failed:", e.message);
        }

        // Try resize
        console.log("Trying sandbox.pty.resize(pid, 80, 24)...");
        try {
            await (sandbox as any).pty.resize(pid, 80, 24);
            console.log("resize succeeded");
        } catch (e: any) {
            console.log("resize failed:", e.message);
        }

        // Check files.watch
        console.log("Testing sandbox.files.watch('/')...");
        try {
            const watcher = await sandbox.files.watch("/", (event: any) => {
                console.log("File Event:", event);
            });
            console.log("Watcher created");

            // Trigger an event
            console.log("Creating a file to trigger watcher...");
            await sandbox.files.write("test.txt", "hello");

            // Wait a bit for event
            await new Promise(r => setTimeout(r, 2000));
            // await watcher.stop(); // If it exists
        } catch (e: any) {
            console.log("files.watch failed:", e.message);
        }

        await sandbox.kill();
    } catch (e: any) {
        console.error("Error:", e.message);
    }
}

check();
