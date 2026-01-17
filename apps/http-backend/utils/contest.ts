import { prisma } from "@repo/db"

export const recalculateEndTime = async (contestId: string) => {
    try {
        console.log('recalculating endTime', contestId)
        const contest = await prisma.contest.findFirst({
            where: {
                id: contestId
            },
            include: {
                questions: true
            }
        })
        if (!contest) {
            throw new Error('Contest not found')
        }
        const totalTime = contest.questions.reduce((sum, q) => {
            return q.timeLimit + sum
        }, 0)
        const endTime = new Date(
            contest.startTime.getTime() + totalTime * 1000
        )
        await prisma.contest.update({
            where: { id: contestId },
            data: { endTime }
        })
    } catch (error) {
        console.log('something went wrong while calculating endtime', error)
        throw error
    }
}
