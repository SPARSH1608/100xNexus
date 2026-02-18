import { type Request, type Response } from "express";
import { prisma } from "@repo/db";

// Create an interview (Admin only)
export const createInterview = async (req: Request, res: Response) => {
    try {
        const { studentId, topic, description, startTime } = req.body;
        console.log("Creating interview:", { studentId, topic, startTime });

        if (!studentId || !topic || !startTime) {
            res.status(400).json({ message: "Missing required fields" });
            return;
        }

        const interview = await prisma.interview.create({
            data: {
                studentId,
                topic,
                description,
                startTime: new Date(startTime),
                status: "SCHEDULED"
            }
        });

        console.log("Interview created:", interview.id);
        res.status(201).json({ message: "Interview scheduled", interview });
    } catch (error) {
        console.error("Error creating interview:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Get all interviews (Admin only) - NEW
export const getAllInterviews = async (req: Request, res: Response) => {
    try {
        const interviews = await prisma.interview.findMany({
            include: {
                user: {
                    select: {
                        name: true,
                        email: true
                    }
                }
            },
            orderBy: { startTime: 'desc' }
        });
        res.json({ interviews });
    } catch (error) {
        console.error("Error fetching all interviews:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Get interview by ID
export const getInterviewById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const interview = await prisma.interview.findUnique({
            where: { id },
            include: { user: { select: { name: true, email: true } } }
        });

        if (!interview) {
            res.status(404).json({ message: "Interview not found" });
            return;
        }

        // Fetch latest code from events
        const latestCodeEvent = await prisma.interviewEvent.findFirst({
            where: {
                interviewId: id,
                type: 'editor_update'
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json({
            interview,
            latestCode: latestCodeEvent?.content || null
        });
    } catch (error) {
        console.error("Error fetching interview:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Get interviews for a student
export const getStudentInterviews = async (req: Request, res: Response) => {
    try {
        const { studentId } = req.params;
        const requesterId = req.userId;

        if (requesterId !== studentId) {
            // Check if requester is admin
            const requester = await prisma.user.findUnique({
                where: { id: requesterId },
                select: { role: true }
            });

            if (!requester || requester.role !== "ADMIN") {
                res.status(403).json({ message: "Unauthorized" });
                return;
            }
        }

        const interviews = await prisma.interview.findMany({
            where: { studentId },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true
                    }
                }
            },
            orderBy: { startTime: 'asc' }
        });

        res.json({ interviews });
    } catch (error) {
        console.error("Error fetching student interviews:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Get my interviews
export const getMyInterviews = async (req: Request, res: Response) => {
    try {
        const studentId = req.userId;

        if (!studentId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        const interviews = await prisma.interview.findMany({
            where: { studentId },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true
                    }
                }
            },
            orderBy: { startTime: 'asc' }
        });

        res.json({ interviews });
    } catch (error) {
        console.error("Error fetching my interviews:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Update interview (Admin only)
export const updateInterview = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { topic, description, startTime, status, studentId } = req.body;

        const interview = await prisma.interview.update({
            where: { id },
            data: {
                studentId,
                topic,
                description,
                startTime: startTime ? new Date(startTime) : undefined,
                status
            }
        });

        res.json({ message: "Interview updated", interview });
    } catch (error) {
        console.error("Error updating interview:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
