import { type Response, type Request } from "express"
import { prisma } from "@repo/db"

export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const users = await prisma.user.findMany({
            where: {
                role: 'CANDIDATE'
            },
            include: {
                batches: true
            }
        })
        res.status(200).json({
            success: true,
            data: users,
            message: 'Users fetched successfully'
        })
    } catch (error) {
        console.log('error while fetching users', error)
        res.status(500).json({
            success: false,
            error: error
        })
    }
}

export const updateUserBatches = async (req: Request, res: Response) => {
    try {
        const userId = req.params.id
        const { batchIds } = req.body

        const user = await prisma.user.update({
            where: {
                id: userId
            },
            data: {
                batches: {
                    set: batchIds.map((id: string) => ({ id }))
                }
            },
            include: {
                batches: true
            }
        })
        res.status(200).json({
            success: true,
            data: user,
            message: 'User batches updated successfully'
        })
    } catch (error) {
        console.log('error while updating user batches', error)
        res.status(500).json({
            success: false,
            error: error
        })
    }
}
