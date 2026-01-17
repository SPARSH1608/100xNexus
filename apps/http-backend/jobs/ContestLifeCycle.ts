import cron from "node-cron"
import { prisma } from "@repo/db"

export const startContestLifeCycle = async () => {
    console.log("Contest Life Cycle Started")
    const contestLiveCount = await prisma.contest.count({
        where: {
            status: "PUBLISHED"
        }
    })
    console.log("Contest Live Count", contestLiveCount)
    cron.schedule("*/30 * * * * *", async () => {
        const now = new Date()

        await prisma.contest.updateMany({
            where: {
                status: "PUBLISHED",
                startTime: {
                    lte: new Date(now.getTime() + 5 * 60 * 1000),

                }
            },
            data: {
                status: "WAITING"
            }
        })

        await prisma.contest.updateMany({
            where: {
                status: 'WAITING',
                startTime: {
                    lte: now
                },
                endTime: {
                    gt: now
                }
            },
            data: {
                status: "LIVE"
            }
        })

        await prisma.contest.updateMany({
            where: {
                status: "LIVE",
                endTime: {
                    lte: now
                }
            },
            data: {
                status: "FINISHED"
            }
        })

        console.log("Contest Life Cycle Updated")
    })
}
