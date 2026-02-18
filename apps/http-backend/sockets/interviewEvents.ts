import { Socket } from "socket.io";
import { prisma } from "@repo/db";
import OpenAI from "openai";

const openai = process.env.OPENAI_API_KEY
    ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    : null;

if (!openai) {
    console.warn("WARNING: OPENAI_API_KEY is not set. AI chat responses will be disabled.");
}

export function handleInterviewEvents(socket: Socket) {
    socket.on("chat:join", async ({ interviewId }: { interviewId: string }) => {
        console.log(`[${socket.id}] User joining chat for interview ${interviewId}`);
        socket.join(`interview:${interviewId}`);

        const messages = await prisma.interviewMessage.findMany({
            where: { interviewId },
            orderBy: { createdAt: 'asc' }
        });

        socket.emit("chat:history", messages);
    });

    socket.on("chat:message", async ({ interviewId, content }: { interviewId: string, content: string }) => {
        console.log(`[Interview: ${interviewId}] Chat Message: ${content}`);

        try {
            const userMessage = await prisma.interviewMessage.create({
                data: {
                    interviewId,
                    role: 'user',
                    content
                }
            });

            socket.to(`interview:${interviewId}`).emit("chat:message", userMessage);
            socket.emit("chat:message", userMessage);

            const recentEvents = await prisma.interviewEvent.findMany({
                where: { interviewId },
                orderBy: { createdAt: 'desc' },
                take: 50
            });

            const eventContext = recentEvents.reverse().map(e => {
                return `[${e.type}] ${e.content} ${e.metadata ? JSON.stringify(e.metadata) : ''}`;
            }).join('\n');

            console.log("Generating OpenAI response for context length:", eventContext.length);

            let aiResponseContent = "";
            try {
                if (!openai) {
                    throw new Error("OPENAI_API_KEY_MISSING");
                }
                const response = await openai.chat.completions.create({
                    model: "gpt-4o",
                    messages: [
                        {
                            role: "system",
                            content: `You are a world-class technical interviewer. 
                            Your goal is to assess the candidate's coding skills, problem-solving, and communication.
                            You have access to the candidate's terminal history, file changes, and current code state via the context below.
                            
                            CONTEXT:
                            ${eventContext}
                            
                            Respond naturally to their last message. If they are stuck, give subtle hints. If they are doing well, ask follow-up questions about their approach or complexity.
                            Be professional but encouraging.`
                        },
                        {
                            role: "user",
                            content: content
                        }
                    ]
                });

                aiResponseContent = response.choices[0]?.message?.content || "I'm sorry, I'm having trouble processing that right now.";
            } catch (openaiError) {
                console.error("OpenAI Error:", openaiError);
                aiResponseContent = "I'm having a technical issue connecting to my brain. Please try again or wait a moment!";
            }

            const aiMessage = await prisma.interviewMessage.create({
                data: {
                    interviewId,
                    role: 'ai',
                    content: aiResponseContent
                }
            });

            socket.to(`interview:${interviewId}`).emit("chat:message", aiMessage);
            socket.emit("chat:message", aiMessage);

        } catch (error) {
            console.error("Error handling chat message:", error);
            socket.emit("chat:error", "Failed to process message");
        }
    });
}
