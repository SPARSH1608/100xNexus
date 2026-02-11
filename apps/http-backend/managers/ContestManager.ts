import { prisma } from "@repo/db"
import { PrismaClient } from "../../../packages/db/generated/prisma/client.js"
import { RedisClient } from "bun"
import { Response } from "express"
import { redis } from "../redis.js"

export class ContestManager {
    private prisma: PrismaClient
    private redis: RedisClient
    constructor() {
        this.prisma = prisma
        this.redis = redis
    }
    private leaderboardKey(contestId: string) {
        return `contest:${contestId}:leaderboard`
    }

    async cleanLeaderboard(contestId: string) {
        await this.redis.del(this.leaderboardKey(contestId))
    }

    async joinContest(contestId: string, userId: string) {
        if (!contestId) {
            throw new Error('ContestId is not provided')
        }
        let contest = await prisma.contest.findUnique({
            where: { id: contestId }
        })
        if (!contest) {
            throw new Error('Contest does not exist')
        }
        await prisma.quizParticipant.upsert({
            where: { contestId_userId: { contestId, userId } },
            create: { contestId, userId },
            update: {}
        })
        await this.redis.zadd(this.leaderboardKey(contestId), 0, userId)
    }

    async streamQuestions(contestId: string, res: Response) {
        res.header('Content-Type', 'text/event-stream')
        res.header('Cache-Control', 'no-cache')
        res.header('Connection', 'keep-alive')

        if (!contestId) {
            res.status(400).json({
                success: false,
                error: 'ContestId is not provided'
            })
            res.end()
            return
        }
        let contest = await prisma.contest.findUnique({
            where: { id: contestId },
            include: {
                questions: {
                    orderBy: { orderIndex: 'asc' },
                    include: { options: true }
                }
            }
        })
        if (!contest || (contest.status !== 'LIVE' && contest.status !== 'WAITING')) {
            res.status(404).json({
                success: false,
                error: 'Contest does not exist'
            })
            res.end()
            return
        }
        const quizStartTime = contest.startTime.getTime()
        let isStreamActive = true;

        res.on('close', () => {
            isStreamActive = false;
        })

        const tick = async () => {
            if (!isStreamActive) return;

            const payload = await this.computeCurrentQuestion(quizStartTime, contest.questions, contest.showResults || false)
            if (!payload) {
                res.write(`data: ${JSON.stringify({ type: 'END' })}\n\n`)
                return
            }
            if (payload.waiting) {
                res.write(`data: ${JSON.stringify({ type: 'WAITING' })}\n\n`)
                if (isStreamActive) setTimeout(tick, 2000);
                return;
            }
            if (payload.results) {
                const stats = await this.getQuestionStats(contestId, payload.question.id)
                res.write(`data: ${JSON.stringify({ type: 'RESULTS', payload: { ...payload, stats } })}\n\n`)
            } else {
                res.write(`data: ${JSON.stringify({ type: 'QUESTION', payload })}\n\n`)
            }

            const leaderboard = await this.redis.zrevrange(this.leaderboardKey(contestId), 0, 19, 'withscores')

            const leaderboardData: { userId: string, score: number, rank: number, name: string }[] = []
            const userIds: string[] = []

            for (let i = 0; i < leaderboard.length; i += 2) {
                const userId = leaderboard[i] as string;
                const score = Number(leaderboard[i + 1]);
                userIds.push(userId);
                leaderboardData.push({
                    userId,
                    score,
                    rank: (i / 2) + 1,
                    name: 'Anonymous' 
                })
            }

            const users = await this.prisma.user.findMany({
                where: { id: { in: userIds } },
                select: { id: true, name: true }
            })
            const userMap = new Map(users.map(u => [u.id, u.name]))

            leaderboardData.forEach(entry => {
                entry.name = userMap.get(entry.userId) || 'Anonymous'
            })

            res.write(`data: ${JSON.stringify({ type: 'LEADERBOARD', payload: leaderboardData })}\n\n`)

            if (isStreamActive) setTimeout(tick, 2000)
        }

        tick()
    }

    private async getQuestionStats(contestId: string, questionId: string) {
        const submissions = await this.prisma.quizSubmission.findMany({
            where: {
                contestId,
                questionId
            },
            include: {
                user: {
                    select: {
                        name: true
                    }
                }
            }
        })

        const stats: Record<string, { count: number, users: { name: string }[] }> = {}

        submissions.forEach(sub => {
            const answers = sub.answer as string[] // Assuming array of optionIds
            if (Array.isArray(answers)) {
                answers.forEach(optionId => {
                    if (!stats[optionId]) {
                        stats[optionId] = { count: 0, users: [] }
                    }
                    stats[optionId].count++
                    stats[optionId].users.push({ name: sub.user.name })
                })
            }
        })
        return stats
    }

    private async computeCurrentQuestion(quizStartTime: number, questions: any[], showResults: boolean = false) {
        const now = Date.now()
        const elapsed = (now - quizStartTime) / 1000

        if (elapsed < 0) {
            return {
                waiting: true
            }
        }

        let cumulativeTime = 0

        for (let i = 0; i < questions.length; i++) {
            const question = questions[i]
            const timeLimit = question.timeLimit || 20

            if (elapsed < cumulativeTime + timeLimit) {
                return {
                    question: question,
                    remainingTime: (cumulativeTime + timeLimit - elapsed) * 1000,
                    serverTime: Date.now()
                }
            }

            cumulativeTime += timeLimit

            if (showResults) {
                if (elapsed < cumulativeTime + 10) {
                    return {
                        results: true,
                        question: question,
                        remainingTime: (cumulativeTime + 10 - elapsed) * 1000,
                        serverTime: Date.now()
                    }
                }
                cumulativeTime += 10
            }
        }

        await this.finishContest(questions[0].contestId)
        return null
    }
    async submitAnswer(contestId: string, userId: string, questionId: string, optionIds: string[]) {
        try {


            if (optionIds.length == 0) {
                await this.prisma.quizSubmission.create({
                    data: {
                        contestId,
                        userId,
                        questionId,
                        answer: optionIds,
                        score: 0
                    }
                })
                return
            }
            const question = await prisma.question.findUnique({
                where: { id: questionId },
                include: {
                    options: {
                        select: {
                            isCorrect: true,
                            id: true
                        }
                    }
                }

            })
            if (!question) {
                throw new Error('Question does not exist')
            }
            const exists = await this.prisma.quizSubmission.findUnique({
                where: { userId_questionId: { userId, questionId } }
            })
            if (exists) {
                throw new Error('Answer already submitted')
            }
            const correctOptionIds = question.options.filter((option) => option.isCorrect).map((option) => option.id)
            const correctSet = new Set(correctOptionIds)
            let score = -1;
            let correctOptionsCount = 0
            for (const optionId of optionIds) {
                if (!correctSet.has(optionId)) {
                    score = 0;
                    await this.prisma.quizSubmission.create({
                        data: {
                            contestId,
                            userId,
                            questionId,
                            answer: optionIds,
                            score: 0
                        }
                    })
                    // Add to leaderboard even if score is 0
                    await this.redis.zincrby(this.leaderboardKey(contestId), 0, userId)
                    return
                }
                else {

                    correctOptionsCount++
                }

            }
            if (score == -1) {
                score = Math.floor((correctOptionsCount / correctOptionIds.length) * question.score)
            }
            console.log('scored', contestId, score, userId)
            await this.redis.zincrby(this.leaderboardKey(contestId), score, userId)

            await prisma.quizSubmission.create({
                data: {
                    contestId,
                    userId,
                    questionId,
                    answer: optionIds,
                    score
                }
            })
        } catch (error) {
            console.log(error)
        }
    }
    async getLeaderboard(contestId: string) {
        const leaderboard = await this.redis.zrevrange(this.leaderboardKey(contestId), 0, -1, 'withscores')
        // console.log('get leaderboard raw', leaderboard)

        const result = []
        const userIds: string[] = []

        // Handle flat array response from Redis (user, score, user, score...)
        for (let i = 0; i < leaderboard.length; i += 2) {
            const userId = leaderboard[i] as string;
            const score = Number(leaderboard[i + 1]);
            userIds.push(userId);
            result.push({
                userId,
                score,
                rank: (i / 2) + 1,
                name: 'Anonymous'
            })
        }

        const users = await this.prisma.user.findMany({
            where: { id: { in: userIds } },
            select: { id: true, name: true }
        })
        const userMap = new Map(users.map(u => [u.id, u.name]))

        result.forEach(entry => {
            entry.name = userMap.get(entry.userId) || 'Anonymous'
        })

        return result;
    }

    async finishContest(contestId: string) {
        // Atomic check to prevent race conditions
        const updateResult = await prisma.contest.updateMany({
            where: { id: contestId, status: { not: 'FINISHED' } },
            data: { status: 'FINISHED' }
        });

        if (updateResult.count === 0) {
            return; // Already finished by another process
        }

        const leaderboard = await this.redis.zrevrange(this.leaderboardKey(contestId), 0, -1, 'withscores')
        // console.log('leaderboard after finish', leaderboard)
        const result = []

        // Handle flat array response from Redis (user, score, user, score...)
        for (let i = 0; i < leaderboard.length; i += 2) {
            const userId = leaderboard[i] as string;
            const score = Number(leaderboard[i + 1]);

            if (userId) {
                result.push({
                    contestId,
                    userId,
                    finalScore: score,
                    rank: (i / 2) + 1
                })
            }
        }
        console.log(result, 'result')
        if (result.length > 0) {
            // Use upsert to avoid unique constraint errors if contest finishes multiple times
            for (const entry of result) {
                await prisma.quizResult.upsert({
                    where: {
                        contestId_userId: {
                            contestId: entry.contestId,
                            userId: entry.userId
                        }
                    },
                    create: entry,
                    update: {
                        finalScore: entry.finalScore,
                        rank: entry.rank
                    }
                })
            }
        }
        await this.redis.del(this.leaderboardKey(contestId))
    }
}