import cron from "node-cron"
import { prisma } from "@repo/db"
import { ContestManager } from "../managers/ContestManager.js"

const contestManager = new ContestManager()

export const startContestLifeCycle = async () => {
    console.log("Contest Life Cycle Started")
    const contestLiveCount = await prisma.contest.count({
        where: {
            status: "PUBLISHED"
        }
    })
    console.log("Contest Live Count", contestLiveCount)
    // Run every 10 seconds to avoid overloading the DB
    cron.schedule("*/10 * * * * *", async () => {
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

        const endedContests = await prisma.contest.findMany({
            where: {
                status: 'LIVE',
                endTime: {
                    lt: now
                }
            }
        })

        for (const contest of endedContests) {
            await contestManager.finishContest(contest.id)
        }
    })

    console.log("Contest Life Cycle Updated")
}
