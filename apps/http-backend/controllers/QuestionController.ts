import { type Response as ExpressResponse, type Request as ExpressRequest } from "express"
import { prisma } from "@repo/db"
import { recalculateEndTime } from "../utils/contest.js"
export const createQuestion = async (req: ExpressRequest, res: ExpressResponse) => {
    try {

        let { contestId, title, description, score, options, timeLimit } = req.body
        if (!contestId) {
            res.status(404).json({
                success: false,
                error: 'contestId not provided'
            })
            return;
        }
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
            return
        }
        if (existingContest.status == 'LIVE' || existingContest.status == 'FINISHED') {
            return res.status(403).json({
                success: false,
                error: 'Cannot add questions to a live or finished contest'
            })
        }
        description = description == null ? "" : description;
        const q = await prisma.$transaction(async (tx) => {
            let last = await tx.question.aggregate({
                where: { contestId },
                _max: { orderIndex: true }
            })
            const nextOrderIndex = (last._max.orderIndex ?? 0) + 1;
            const question = await tx.question.create({
                data: {
                    title,
                    description,
                    score,
                    contestId,
                    timeLimit,
                    orderIndex: nextOrderIndex,
                    options: {
                        create: options.map((opt: { title: string, isCorrect: boolean }) => ({
                            title: opt.title,
                            isCorrect: opt.isCorrect
                        }))
                    }
                },
                include: {
                    options: true
                }
            })
            return question
        })
        await recalculateEndTime(contestId)
        res.status(201).json({
            data: q,
            message: 'question created successfully',
            success: true
        })
        return
    } catch (error) {
        console.log('error while creating questions', error)
        res.status(500).json({
            success: false,
            error,
        })
        return
    }
}
export const updateQuestion = async (req: ExpressRequest, res: ExpressResponse) => {
    try {
        const questionId = req.params.id
        let { options, ...questionFields } = req.body
        console.log('req', req.body)
        if (!questionId) {
            res.status(400).json({
                success: false,
                error: 'questionId not provided'
            })
            return;
        }
        const existingQuestion = await prisma.question.findFirst({
            where: {
                id: questionId
            }, include: {
                contest: true
            }
        })
        if (!existingQuestion) {
            return res.status(404).json({
                error: "Question not found",
                success: false
            })
        }
        if (
            existingQuestion.contest.status === "LIVE" ||
            existingQuestion.contest.status === "FINISHED"
        ) {
            return res.status(403).json({
                success: false,
                error: "Cannot update question in a live or finished contest",
            })
        }

        const questionData = Object.fromEntries(Object.entries(questionFields).filter((_, value) => value !== undefined))
        const updatedQuestion = await prisma.$transaction(async (tx) => {
            const q = await tx.question.update({
                where: { id: questionId },
                data: {
                    ...questionData,
                    options: Array.isArray(options) ? {
                        deleteMany: {},
                        create: options.map((opt: { title: string, isCorrect: boolean }) => ({
                            title: opt.title,
                            isCorrect: opt.isCorrect
                        }))
                    } : undefined
                },
                select: {
                    options: true
                }
            })
            return q;
        })
        await recalculateEndTime(existingQuestion.contest.id)
        res.status(200).json({
            success: true,
            data: updatedQuestion,
            message: 'question updated successfully'
        })

    } catch (error) {
        console.log('error while updating questions', error)
        res.status(500).json({
            success: false,
            error,
        })
        return
    }
}
export const DeleteQuestion = async (req: ExpressRequest, res: ExpressResponse) => {
    try {
        const questionId = req.params.id;
        if (!questionId) {
            res.status(404).json({
                success: false,
                error: 'questionId not provided'
            })
            return;
        }
        const existingQuestion = await prisma.question.findUnique({
            where: { id: questionId },
            select: {
                orderIndex: true,
                contestId: true,

            }
        });

        if (!existingQuestion) {
            return res.status(404).json({
                success: false,
                error: "Question not found",
            });
        }
        const contest = await prisma.contest.findUnique({
            where: {
                id: existingQuestion.contestId
            }
        })

        if (!contest) {
            return res.status(404).json({
                success: false,
                error: "Contest not found",
            })
        }

        if (contest.status === "LIVE" || contest.status === "FINISHED") {
            return res.status(403).json({
                success: false,
                error: "Cannot delete question from live or finished contest",
            })
        }
        await prisma.$transaction(async (tx) => {
            await tx.option.deleteMany({
                where: {
                    questionId
                }
            })
            await tx.question.delete({
                where: {
                    id: questionId
                }
            })
            await tx.question.updateMany({
                where: {
                    contestId: existingQuestion.contestId,
                    orderIndex: {
                        gt: existingQuestion.orderIndex
                    },
                },
                data: {
                    orderIndex: {
                        decrement: 1
                    }
                }
            }
            )
        })
        await recalculateEndTime(contest.id)
        res.status(200).json({
            success: true,
            message: "Question deleted successfully",
        });

    } catch (error) {
        console.log('error while deleting questions', error)
        res.status(500).json({
            success: false,
            error,
        })
        return
    }
}
export const getAllQuestions = async (req: ExpressRequest, res: ExpressResponse) => {
    try {
        let questions = await prisma.question.findMany({
            include: {
                options: true
            }
        });
        res.status(200).json({
            success: true,
            data: questions,
            message: 'All questions fetched successfully'
        })
    } catch (error) {
        console.log('error while fetching all questions ', error)
        res.status(500).json({
            success: false,
            error,
        })
        return
    }
}
export const getQuestionsByContestId = async (req: ExpressRequest, res: ExpressResponse) => {
    try {
        let contestId = req.params.id;
        if (!contestId) {
            res.status(404).json({
                success: false,
                error: 'contestId not provided'
            })
            return;
        }
        let questions = await prisma.question.findMany({
            where: {
                contestId
            },
            include: {
                options: true
            }
        })
        res.status(200).json({
            data: questions,
            success: true,
            message: 'Questions fetched successfully'
        })
    } catch (error) {
        console.log('error while fetching questions for a contest', error)
        res.status(500).json({
            success: false,
            error,
        })
        return
    }
}

export const updateQuestionIndexing = async (req: ExpressRequest, res: ExpressResponse) => {
    try {
        const contestId = req.params.id
        if (!contestId) {
            res.status(404).json({
                success: false,
                error: 'contestId not provided'
            })
            return;
        }
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
            return
        }
        if (existingContest.status == 'LIVE' || existingContest.status == 'FINISHED') {
            return res.status(403).json({
                success: false,
                error: 'Cannot re arrange questions in a live or finished contest'
            })
        }

        const { questionIds } = req.body;
        console.log('questionIds', questionIds)
        if (!Array.isArray(questionIds) || questionIds.length === 0) {
            return res.status(400).json({
                success: false,
                error: "questionIds must be a non-empty array",
            })
        }

        const questions = await prisma.question.findMany({
            where: { contestId },
            select: { id: true }
        })

        const questionIdSet = new Set(questions.map(q => q.id))

        if (
            questionIds.length !== questions.length ||
            !questionIds.every((id: string) => questionIdSet.has(id))
        ) {
            return res.status(400).json({
                success: false,
                error: "Invalid questionIds array",
            })
        }

        await prisma.$transaction(async (tx) => {
            await tx.question.updateMany({
                where: {
                    contestId

                },
                data: { orderIndex: -1 }
            })
            await Promise.all(
                questionIds.map((id: string, index: number) =>
                    tx.question.update({
                        where: { id },
                        data: { orderIndex: index + 1 }
                    })
                )
            )
        })


        return res.status(200).json({
            success: true,
            data: [],
            message: 'Ordering changed successfully'
        })
    } catch (error) {
        console.log('Something went wrong while ordering questions', error)
        return res.status(500).json({
            success: false,
            error
        })
    }
}