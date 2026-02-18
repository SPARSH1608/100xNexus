import { Sandbox } from "@e2b/code-interpreter";
import { prisma } from "@repo/db";

const sandboxes = new Map<string, Sandbox>();
interface TerminalSession {
    terminal: any;
    unsubscribe?: () => void;
}
const terminals = new Map<string, TerminalSession>(); //  interviewId -> terminal session
const socketToInterview = new Map<string, string>(); //  socket.id -> interviewId

export async function getSandbox(interviewId: string): Promise<Sandbox | null> {
    let sandbox = sandboxes.get(interviewId);

    if (!sandbox) {
        const interview = await prisma.interview.findUnique({
            where: { id: interviewId },
            select: { sandboxId: true }
        });

        if (interview?.sandboxId) {
            console.log(`[Manager] [Interview: ${interviewId}] Found existing sandboxId ${interview.sandboxId} in DB. Attempting reconnect...`);
            try {
                // @ts-ignore
                sandbox = await Sandbox.connect(interview.sandboxId);
                await sandbox.setTimeout(30 * 60 * 1000);
                sandboxes.set(interviewId, sandbox);
                console.log(`[Manager] [Interview: ${interviewId}] Successfully reconnected to ${interview.sandboxId}`);
            } catch (reconnectError) {
                console.log(`[Manager] [Interview: ${interviewId}] Reconnection to ${interview.sandboxId} failed (sandbox probably expired).`);
            }
        }

        if (!sandbox) {
            console.log(`[Manager] [Interview: ${interviewId}] Creating fresh new sandbox...`);
            sandbox = await Sandbox.create({
                timeoutMs: 30 * 60 * 1000
            });
            sandboxes.set(interviewId, sandbox);

            await prisma.interview.update({
                where: { id: interviewId },
                data: { sandboxId: sandbox.sandboxId }
            });
            console.log(`[Manager] [Interview: ${interviewId}] Created new sandbox ${sandbox.sandboxId} and persisted to DB.`);
        }
    } else {
        console.log(`[Manager] [Interview: ${interviewId}] Using cached sandbox instance ${sandbox.sandboxId}`);
    }
    return sandbox;
}

export function setTerminal(interviewId: string, terminal: any, unsubscribe?: () => void) {
    terminals.set(interviewId, { terminal, unsubscribe });
}

export function getTerminal(interviewId: string) {
    return terminals.get(interviewId)?.terminal;
}

export function getTerminalSession(interviewId: string) {
    return terminals.get(interviewId);
}

export function removeTerminal(interviewId: string) {
    const session = terminals.get(interviewId);
    if (session?.unsubscribe) {
        session.unsubscribe();
    }
    terminals.delete(interviewId);
}

export function trackSocket(socketId: string, interviewId: string) {
    socketToInterview.set(socketId, interviewId);
}

export function getInterviewForSocket(socketId: string) {
    return socketToInterview.get(socketId);
}

export function untrackSocket(socketId: string) {
    socketToInterview.delete(socketId);
}
