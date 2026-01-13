import { type Response, type Request } from "express"
import { prisma } from "@repo/db"
import crypto from 'crypto'
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

        let existingContest = await prisma.contest.findFirst({
            where: {
                id: contestId
            }
        })
        if (!existingContest) {
            res.status(409).json({
                success: false,
                error: 'A contest with this contestId does not exist'
            })
        }
        let updateData = Object.fromEntries(Object.entries(req.body).filter((_, value) => value != undefined))
        console.log('data to update', updateData)
        const contest = await prisma.contest.update({
            where: {
                id: contestId
            }, data: updateData
        })
        res.status(200).json({
            success: true,
            data: updateData,
            message: 'Contest updated successfully'
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
            }
        })
        if (!existingContest) {
            res.status(409).json({
                success: false,
                error: 'A contest does not  exists with this contestId'
            })
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
        let contests = await prisma.contest.findMany({}) || []
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
        const currentTime = Date.now().toLocaleString()
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