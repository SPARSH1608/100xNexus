import { type Response, type Request } from "express"
import { prisma } from "@repo/db"
import crypto from 'crypto'
import { recalculateEndTime } from "../utils/contest.js"
declare global {
    namespace Express {
        interface Request {
            userId: string
        }
    }
}
export const createContest = async (req: Request, res: Response) => {
    try {
        let { title, isOpenAll, startTime, batchIds } = req.body;
        console.log('create contest', req.body)
        const userId = req.userId

        const existingContest = await prisma.contest.findFirst({
            where: {
                title
            }
        })
        const normalized = title
            .replace(/[^a-zA-Z]/g, "")
            .toUpperCase()
        const front = normalized.slice(0, 2)
        const back = normalized.slice(-2)
        const entropySource = `${new Date(startTime).getTime()}-${userId}`

        const hash = crypto
            .createHash("sha256")
            .update(entropySource)
            .digest("base64url")
            .slice(0, 4)

        let code = `${front}${back}${hash}`
        if (!isOpenAll && (!batchIds || batchIds.length === 0)) {

            return res.status(500).json({
                success: false,
                error: "Restricted contests must have at least one batch"
            })
        }

        if (isOpenAll && batchIds?.length > 0) {
            return res.status(500).json({
                success: false,
                error: "Open contests cannot have batch restrictions"
            })
            return
        }

        if (existingContest) {
            res.status(409).json({
                success: false,
                error: 'A contest already exists with this title'
            })
            return
        }
        const contest = await prisma.contest.create({
            data: {
                title,
                userId,
                isOpenAll,
                startTime,
                joinCode: code,
                batches: isOpenAll ? undefined :
                    { connect: batchIds.map((id: string) => ({ id })) },
                status: 'DRAFT'

            }
        })
        res.status(200).json({
            success: true,
            data: contest,
            message: 'Contest created successfully'
        })
    } catch (error) {
        console.log('error while creating contest', error)
        res.status(500).json({
            success: false,
            error: error
        })
    }
}
export const updateContest = async (req: Request, res: Response) => {
    try {
        const contestId = req.params.id;
        if (!contestId) {
            res.status(409).json({
                success: false,
                error: 'A contest with this contestId does not exist'
            })
            return;
        }
        console.log("update contest payload", req.body);

        const existingContest = await prisma.contest.findFirst({
            where: {
                id: contestId
            }, include: {
                questions: true
            }
        })
        if (!existingContest) {
            res.status(409).json({
                success: false,
                error: 'A contest with this contestId does not exist'
            })
            return;
        }

        const { title, isOpenAll, startTime, batchIds } = req.body;
        console.log("update contest payload", req.body);
        const updateData: any = {};
        if (title !== undefined) updateData.title = title;
        if (startTime !== undefined) updateData.startTime = new Date(startTime);
        if (isOpenAll !== undefined) updateData.isOpenAll = isOpenAll;

        if (isOpenAll === true) {
            updateData.batches = { set: [] };
        } else if (isOpenAll === false || (isOpenAll === undefined && !existingContest.isOpenAll)) {
            if (batchIds && Array.isArray(batchIds)) {
                updateData.batches = {
                    set: batchIds.map((id: string) => ({ id }))
                };
            }
        }
        if (startTime !== undefined) {
            updateData.endTime = new Date(new Date(startTime).getTime() + existingContest.questions.reduce((sum, q) => {
                return q.timeLimit + sum
            }, 0) * 1000)
        }

        const contest = await prisma.contest.update({
            where: {
                id: contestId
            },
            data: updateData
        })

        if (startTime !== undefined) {
            await recalculateEndTime(contestId)
        }

        return res.status(200).json({
            success: true,
            data: contest,
            message: 'Contest updated successfully'
        })
    } catch (error) {
        console.log('error while updating contest', error)
        return res.status(500).json({
            success: false,
            error: error
        })
    }
}
export const deleteContest = async (req: Request, res: Response) => {
    try {
        let contestId = req.params.id
        await prisma.contest.delete({
            where: { id: contestId },

        })
        res.status(200).json({
            success: true,
            data: {},
            message: 'Contest deleted successfully'
        })
        return

    } catch (error) {
        console.log('error while creating contest', error)
        res.status(500).json({
            success: false,
            error: error
        })
    }
}

export const getContest = async (req: Request, res: Response) => {
    try {
        const contestId = req.params.id;
        const existingContest = await prisma.contest.findFirst({
            where: {
                id: contestId
            },
            include: {
                batches: true,
                questions: {
                    include: {
                        options: true
                    }
                }
            }
        })
        if (!existingContest) {
            res.status(409).json({
                success: false,
                error: 'A contest does not  exists with this contestId'
            })
            return
        }
        res.status(200).json({
            success: true,
            data: existingContest,
            message: 'Contest fetched successfully'
        })
        return
    } catch (error) {
        console.log('error while creating contest', error)
        res.status(500).json({
            success: false,
            error: error
        })
        return
    }
}
export const getAllContest = async (req: Request, res: Response) => {
    try {
        let contests = await prisma.contest.findMany({
            include: {
                _count: {
                    select: {
                        questions: true
                    }
                }
            }
        })
        res.status(200).json({
            success: true,
            data: contests,
            message: 'Contests fetched successfully'
        })

    } catch (error) {
        console.log('error while creating contest', error)
        res.status(500).json({
            success: false,
            error: error
        })
    }
}
export const getLiveContests = async (req: Request, res: Response) => {
    try {
        let contest = await prisma.contest.findMany({
            where: {
                status: 'LIVE'
            }
        })

    } catch (error) {
        console.log('error while creating contest', error)
        res.status(500).json({
            success: false,
            error: error
        })
    }
}
export const getUpcomingContest = async (req: Request, res: Response) => {
    try {
        const currentTime = new Date()
        console.log('currentTime', currentTime)
        let contest = await prisma.contest.findMany({
            where: {
                OR: [
                    {
                        status: 'LIVE'
                    },
                    {
                        status: 'PUBLISHED'
                    }
                ],
                AND: [
                    {
                        startTime: {
                            gte: currentTime
                        }
                    }

                ]
            }
        })
        res.status(200).json({
            success: true,
            data: contest,
            message: 'Upcoming contests fetched successfully'
        })

    } catch (error) {
        console.log('error while creating contest', error)
        res.status(500).json({
            success: false,
            error: error
        })
    }
}

export const changeContestStatus = async (req: Request, res: Response) => {
    try {
        const contestId = req.params.id;
        const { status } = req.body;
        if (!contestId) {
            res.status(409).json({
                success: false,
                error: 'A contest with this contestId does not exist'
            })
            return;
        }
        let contest = await prisma.contest.findFirst({
            where: {
                id: contestId
            }
        })
        if (!contest) {
            res.status(409).json({
                success: false,
                error: 'A contest with this contestId does not exist'
            })
            return;
        }
        if (contest.status === status) {
            res.status(409).json({
                success: false,
                error: 'Contest status is already ' + status
            })
            return;
        }
        if (status === 'LIVE' || contest.status === 'WAITING' || contest.status === 'FINISHED') {
            res.status(409).json({
                success: false,
                error: 'Can not change the status of this contest'
            })
            return;
        }
        contest = await prisma.contest.update({
            where: {
                id: contestId
            },
            data: {
                status: status
            }
        })
        res.status(200).json({
            success: true,
            data: contest,
            message: 'Contest status changed successfully'
        })
    } catch (error) {
        console.log('error while changing contest status', error)
        res.status(500).json({
            success: false,
            error: error
        })
    }
}

export const getMyContests = async (req: Request, res: Response) => {
    try {
        const userId = req.userId
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { batches: true }
        })

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            })
        }

        const userBatchIds = user.batches.map(b => b.id)

        const contests = await prisma.contest.findMany({
            where: {
                OR: [
                    { isOpenAll: true },
                    {
                        batches: {
                            some: {
                                id: { in: userBatchIds }
                            }
                        }
                    }
                ],
                status: {
                    in: ['PUBLISHED', 'LIVE', 'FINISHED']
                }
            },
            include: {
                _count: {
                    select: { questions: true }
                }
            },
            orderBy: {
                startTime: 'asc'
            }
        })

        res.status(200).json({
            success: true,
            data: contests,
            message: 'Eligible contests fetched successfully'
        })
    } catch (error) {
        console.log('error while fetching my contests', error)
        res.status(500).json({
            success: false,
            error: error
        })
    }
}

export const joinContest = async (req: Request, res: Response) => {
    try {
        const contestId = req.params.id;
        if (!contestId) {
            return res.status(400).json({
                success: false,
                error: 'Contest ID is required'
            })
        }
        const userId = req.userId
        const contest = await prisma.contest.findUnique({
            where: {
                id: contestId
            },
            include: {
                batches: true
            }
        })
        if (!contest) {
            return res.status(404).json({
                success: false,
                error: 'Contest not found'
            })
        }
        if (contest.status !== 'LIVE') {
            return res.status(400).json({
                success: false,
                error: 'Contest is not live'
            })
        }
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { batches: true }
        })
        if (!user || !user.id) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            })
        }
        const userBatchIds = user.batches.map(b => b.id)
        const isEligible = contest.isOpenAll || userBatchIds.some(id => contest.batches.map(b => b.id).includes(id))
        if (!isEligible) {
            return res.status(403).json({
                success: false,
                error: 'User is not eligible for this contest'
            })
        }
        const existingParticipation = await prisma.quizParticipant.findFirst({
            where: {
                userId: userId,
                contestId: contestId
            }
        })
        if (existingParticipation) {
            return res.status(400).json({
                success: false,
                error: 'User has already joined this contest'
            })
        }

        const participation = await prisma.quizParticipant.create({
            data: {
                userId: user.id,
                contestId: contestId
            }
        })
        res.status(200).json({
            success: true,
            data: participation,
            message: 'Contest joined successfully'
        })
    } catch (error) {
        console.log('error while joining contest', error)
        res.status(500).json({
            success: false,
            error: error
        })
    }
}