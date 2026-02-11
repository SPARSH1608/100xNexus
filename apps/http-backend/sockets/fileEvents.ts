import { Socket } from "socket.io";

export function handleFileEvents(socket: Socket) {
    socket.on("file:created", (data) => {
        console.log(`[${socket.id}] File Created:`, data);
    });

    socket.on("folder:created", (data) => {
        console.log(`[${socket.id}] Folder Created:`, data);
    });

    socket.on("file:deleted", (data) => {
        console.log(`[${socket.id}] File Deleted:`, data);
    });

    socket.on("file:moved", (data) => {
        console.log(`[${socket.id}] File Moved:`, data);
    });

    socket.on("file:renamed", (data) => {
        console.log(`[${socket.id}] File Renamed:`, data);
    });

    socket.on("file:read", (data) => {
        console.log(`[${socket.id}] File Read:`, data);
    });

    socket.on("folder:expanded", (data) => {
        console.log(`[${socket.id}] Folder Expanded:`, data);
    });

    socket.on("folder:collapsed", (data) => {
        console.log(`[${socket.id}] Folder Collapsed:`, data);
    });
}
