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

            const payload = this.computeCurrentQuestion(quizStartTime, contest.questions)
            if (!payload) {
                res.write(`data: ${JSON.stringify({ type: 'END' })}\n\n`)
                return
            }
            if (payload.waiting) {
                res.write(`data: ${JSON.stringify({ type: 'WAITING' })}\n\n`)
                if (isStreamActive) setTimeout(tick, 2000);
                return;
            }
            res.write(`data: ${JSON.stringify({ type: 'QUESTION', payload })}\n\n`)

            // Stream Leaderboard
            const leaderboard = await this.redis.zrevrange(this.leaderboardKey(contestId), 0, 19, 'withscores')
            const userIds = leaderboard.map((entry: any) => entry[0]);

            const users = await this.prisma.user.findMany({
                where: { id: { in: userIds } },
                select: { id: true, name: true }
            })
            const userMap = new Map(users.map(u => [u.id, u.name]))

            const leaderboardData = leaderboard.map((entry: any, index: number) => ({
                userId: entry[0],
                name: userMap.get(entry[0]) || 'Anonymous',
                score: Number(entry[1]),
                rank: index + 1
            }))
            res.write(`data: ${JSON.stringify({ type: 'LEADERBOARD', payload: leaderboardData })}\n\n`)

            if (isStreamActive) setTimeout(tick, 2000)
        }

        tick()
    }
    private computeCurrentQuestion(quizStartTime: number, questions: any[]) {
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
        }

        this.finishContest(questions[0].contestId)
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
        console.log('get leaderboard', leaderboard)
        const userIds: string[] = []
        for (let i = 0; i < leaderboard.length; i++) {
            const entry = leaderboard[i] as any;
            if (Array.isArray(entry)) {
                if (entry[0]) userIds.push(entry[0]);
            } else {
                // Fallback if flat? (unlikely)
                // If flat, i should skip 2.
            }
        }
        const users = await this.prisma.user.findMany({
            where: { id: { in: userIds } },
            select: { id: true, name: true }
        })
        const userMap = new Map(users.map(u => [u.id, u.name]))

        const result = []
        for (let i = 0; i < leaderboard.length; i++) {
            // Handle Bun Redis format which might be [[val, score], [val, score]]
            // OR confirm if it is flat. The generic fix checking for type is safer,
            // but based on error logs it is nested.
            // However, to be safe for both (if swapped later), we can check types.
            // But strictly following the error pattern: nested.
            const entry = leaderboard[i] as any;
            let userId, score;
            if (Array.isArray(entry)) {
                userId = entry[0];
                score = entry[1];
            } else {
                // Fallback if it is flat and we are iterating incorrectly?
                // No, if it is flat, i should increment by 2.
                // Assuming nested based on error log.
                userId = entry;
                // this branch would fail if it is actually flat.
                // Let us stick to the finding: it is nested.
                // Wait, if it is nested, we loop i++ (which we are doing here).
                // In the original code i+=2 which implies flat.
                // So we change loop to i++ and access entry[0], entry[1].
                score = 0; // Default? It should be in the entry.
            }

            if (userId) {
                result.push({
                    userId: userId,
                    name: userMap.get(userId) || 'Anonymous',
                    score: Number(score),
                    rank: i + 1
                })
            }
        }
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
        console.log('leaderboard after finish', leaderboard)
        const result = []
        for (let i = 0; i < leaderboard.length; i++) {
            const entry = leaderboard[i] as any;
            let userId, score;
            if (Array.isArray(entry)) {
                userId = entry[0];
                score = entry[1];
            } else {
                // Should not happen based on logs, but if so:
                continue;
            }

            if (userId) {
                result.push({
                    contestId,
                    userId,
                    finalScore: Number(score),
                    rank: i + 1
                })
            }
        }
        console.log(result, 'result')
        if (result.length > 0) {
            await prisma.quizResult.createMany({
                data: result
            })
        }
        await this.redis.del(this.leaderboardKey(contestId))
    }
}