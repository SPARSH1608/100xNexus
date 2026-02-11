
import { Socket } from "socket.io";

export function handleTerminalEvents(socket: Socket) {
    socket.on("run:command", (cmd) => {
        console.log("RUN_COMMAND:", cmd);
        // We'll add execution logic here in Phase 3
    });

    socket.on("terminal:command", (data) => {
        console.log(`[${socket.id}] Terminal Command:`, data);
    });

    socket.on("terminal:resize", (data) => {
        console.log(`[${socket.id}] Terminal Resize:`, data);
    });

    socket.on("terminal:tab:created", (data) => {
        console.log(`[${socket.id}] Terminal Tab Created:`, data);
    });

    socket.on("terminal:tab:closed", (data) => {
        console.log(`[${socket.id}] Terminal Tab Closed:`, data);
    });
}
