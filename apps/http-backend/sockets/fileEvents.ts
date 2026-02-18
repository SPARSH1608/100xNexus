import { Socket } from "socket.io";
import { prisma } from "@repo/db";
import { getSandbox } from "./sandboxManager.js";

const WORK_DIR = "/home/user";

export function handleFileEvents(socket: Socket) {
    socket.on("file:created", async ({ interviewId, parentId, name, path }) => {
        console.log(`[Interview: ${interviewId}] Creating file: ${path}`);
        const sandbox = await getSandbox(interviewId);
        if (!sandbox) return;

        try {
            const fullPath = `${WORK_DIR}${path}`;
            await sandbox.files.write(fullPath, "");

            await prisma.interviewEvent.create({
                data: {
                    interviewId,
                    type: 'file_create',
                    content: name || path,
                    metadata: { path, parentId }
                }
            });
            socket.emit("file:sync:request");
        } catch (e) { console.error("File creation failed:", e); }
    });

    socket.on("folder:created", async ({ interviewId, parentId, name, path }) => {
        console.log(`[Interview: ${interviewId}] Creating folder: ${path}`);
        const sandbox = await getSandbox(interviewId);
        if (!sandbox) return;

        try {
            const fullPath = `${WORK_DIR}${path}`;
            await sandbox.files.makeDir(fullPath);

            await prisma.interviewEvent.create({
                data: {
                    interviewId,
                    type: 'file_create',
                    content: name || path,
                    metadata: { path, parentId, isFolder: true }
                }
            });
            socket.emit("file:sync:request");
        } catch (e) { console.error("Folder creation failed:", e); }
    });

    socket.on("file:deleted", async ({ interviewId, id, path }) => {
        console.log(`[Interview: ${interviewId}] Deleting file: ${path || id}`);
        const sandbox = await getSandbox(interviewId);
        if (!sandbox) return;

        try {
            const targetPath = path || id;
            const fullPath = targetPath.startsWith(WORK_DIR) ? targetPath : `${WORK_DIR}${targetPath}`;

            await sandbox.files.remove(fullPath);

            await prisma.interviewEvent.create({
                data: {
                    interviewId,
                    type: 'file_delete',
                    content: fullPath,
                }
            });
            socket.emit("file:sync:request");
        } catch (e) { console.error("File deletion failed:", e); }
    });

    socket.on("file:read", async ({ interviewId, path }) => {
        console.log(`[Interview: ${interviewId}] Reading file: ${path}`);
        const sandbox = await getSandbox(interviewId);
        if (!sandbox) return;

        try {
            const fullPath = path.startsWith(WORK_DIR) ? path : `${WORK_DIR}${path}`;
            const content = await sandbox.files.read(fullPath);
            socket.emit("file:content", { path, content });
        } catch (e) {
            console.error("File read failed:", e);
            socket.emit("file:error", `Could not read file ${path}`);
        }
    });

    socket.on("file:renamed", async ({ interviewId, id, path, newName }) => {
        console.log(`[Interview: ${interviewId}] Renaming: ${path} to ${newName}`);
        const sandbox = await getSandbox(interviewId);
        if (!sandbox) return;

        try {
            const oldPath = path.startsWith(WORK_DIR) ? path : `${WORK_DIR}${path}`;
            const pathParts = path.split('/');
            pathParts[pathParts.length - 1] = newName;
            const newPath = pathParts.join('/');
            const fullNewPath = newPath.startsWith(WORK_DIR) ? newPath : `${WORK_DIR}${newPath}`;

            await sandbox.files.move(oldPath, fullNewPath);

            await prisma.interviewEvent.create({
                data: {
                    interviewId,
                    type: 'file_rename',
                    content: `${path} -> ${newName}`,
                    metadata: { oldPath, newPath }
                }
            });
            socket.emit("file:sync:request");
        } catch (e) { console.error("Rename failed:", e); }
    });
}
