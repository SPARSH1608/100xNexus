
import { Socket } from "socket.io";

export function handleEditorEvents(socket: Socket) {
    socket.on("editor:event", (data) => {
        console.log("EDITOR_EVENT:", data);
    });
}
