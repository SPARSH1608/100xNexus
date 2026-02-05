'use client'
import { create } from 'zustand'
import { createBatchAPI, createContestAPI, deleteBatchAPI, deleteContestAPI, getAllContestsAPI, getBatchesAPI, getContestByIdAPI, getLiveContestsAPI, getUpcomingContestsAPI, updateBatchAPI, updateContestAPI, createQuestionAPI, updateQuestionAPI, deleteQuestionAPI, changeContestStatusAPI, getAllUsersAPI, updateUserBatchesAPI, getMyContestsAPI, getAllQuestionsAPI, getQuizSubmissionsAPI } from './api'


type AuthState = {
    token: string | null
    role: string | null
    isAuthenticated: boolean
    login: (token: string, role: string) => void
    logout: () => void
    signin: (token: string, role: string) => void
}

type BatchState = {
    batches: any[],
    getBatches: () => Promise<void>,
    createBatch: (name: string) => Promise<any>,
    updateBatch: (batchId: string, name: string) => Promise<any>,
    deleteBatch: (batchId: string) => Promise<any>
    getBatchById: (batchId: string) => any
}

type ContestState = {
    contests: any[],
    contest: any,
    getContests: () => Promise<void>,
    createContest: (title: string, isOpenAll: boolean, startTime: string, batchIds: string[], showResults: boolean) => Promise<any>,
    updateContest: (contestId: string, title: string, isOpenAll: boolean, startTime: string, batchIds: string[], showResults: boolean) => Promise<any>,
    deleteContest: (contestId: string) => Promise<any>,
    getContestById: (contestId: string) => any
    getLiveContests: () => Promise<void>,
    getUpcomingContests: () => Promise<void>,
    getAllContests: () => Promise<void>,
    createQuestion: (contestId: string, title: string, description: string, score: number, options: any[], timeLimit: number) => Promise<any>,
    updateQuestion: (questionId: string, title?: string, description?: string, score?: number, options?: any[], timeLimit?: number) => Promise<any>,
    deleteQuestion: (questionId: string) => Promise<any>
    changeContestStatus: (contestId: string, status: string) => Promise<any>
    myContests: any[]
    getMyContests: () => Promise<void>
    allQuestions: any[]
    getAllQuestions: () => Promise<void>
    submissions: any[]
    getQuizSubmissions: () => Promise<void>
}
import { persist } from 'zustand/middleware'

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            role: null,
            token: null,
            isAuthenticated: false,
            login: (token, role) => {
                set({ token, role, isAuthenticated: true })
            },
            logout: () => {
                set({ token: null, role: null, isAuthenticated: false })
            },
            signin: (token, role) => {
                set({ token, role, isAuthenticated: true })
            }
        }),
        {
            name: 'auth-storage',
        }
    )
)
export const useBatchStore = create<BatchState>((set, get) => ({
    batches: [],
    getBatches: async () => {
        const res = await getBatchesAPI()
        set({ batches: res.data })
    },
    createBatch: async (name: string) => {
        const res = await createBatchAPI(name)
        if (res.success) {
            set((state) => ({ batches: [...state.batches, res.data] }))
        }
        return res
    },
    updateBatch: async (batchId: string, name: string) => {
        const res = await updateBatchAPI(batchId, name)
        if (res.success) {
            set((state) => ({
                batches: state.batches.map((b) => b.id === batchId ? res.data : b)
            }))
        }
        return res
    },
    deleteBatch: async (batchId: string) => {
        const res = await deleteBatchAPI(batchId)
        if (res.success) {
            set((state) => ({
                batches: state.batches.filter((b) => b.id !== batchId)
            }))
        }
        return res
    },
    getBatchById: (batchId: string) => {
        return get().batches.find((batch: any) => batch.id === batchId)
    }
}))


export const useContestStore = create<ContestState>((set, get) => ({
    contests: [],
    contest: null,
    getContests: async () => {
        const res = await getAllContestsAPI()
        set({ contests: res.data })
    },
    createContest: async (title: string, isOpenAll: boolean, startTime: string, batchIds: string[], showResults: boolean) => {
        const res = await createContestAPI(title, isOpenAll, startTime, batchIds, showResults)
        if (res.success) {
            set((state) => ({ contests: [...state.contests, res.data] }))
        }
        return res
    },
    updateContest: async (contestId: string, title: string, isOpenAll: boolean, startTime: string, batchIds: string[], showResults: boolean) => {
        const res = await updateContestAPI(contestId, title, isOpenAll, startTime, batchIds, showResults)
        if (res.success) {
            set((state) => ({
                contests: state.contests.map((c) => c.id === contestId ? res.data : c)
            }))
        }
        return res
    },
    deleteContest: async (contestId: string) => {
        const res = await deleteContestAPI(contestId)
        if (res.success) {
            set((state) => ({
                contests: state.contests.filter((c) => c.id !== contestId)
            }))
        }
        return res
    },
    getContestById: async (contestId: string) => {
        const res = await getContestByIdAPI(contestId)
        console.log(res)
        set({ contest: res.data })
        return res.data
    },
    getLiveContests: async () => {
        const res = await getLiveContestsAPI()
        set({ contests: res.data })
    },
    getUpcomingContests: async () => {
        const res = await getUpcomingContestsAPI()
        set({ contests: res.data })
    },
    getAllContests: async () => {
        const res = await getAllContestsAPI()
        set({ contests: res.data })
    },
    createQuestion: async (contestId, title, description, score, options, timeLimit) => {
        const res = await createQuestionAPI(contestId, title, description, score, options, timeLimit)
        if (res.success) {
            const contest = get().contest;
            if (contest && contest.id === contestId) {
                set({ contest: { ...contest, questions: [...(contest.questions || []), res.data] } })
            }
        }
        return res
    },
    updateQuestion: async (questionId, title, description, score, options, timeLimit) => {
        const res = await updateQuestionAPI(questionId, title, description, score, options, timeLimit)
        if (res.success) {
            const contest = get().contest;
            if (contest) {
                set({ contest: { ...contest, questions: contest.questions.map((q: any) => q.id === questionId ? res.data : q) } })
            }
        }
        return res
    },
    deleteQuestion: async (questionId) => {
        const res = await deleteQuestionAPI(questionId)
        if (res.success) {
            const contest = get().contest;
            if (contest) {
                set({ contest: { ...contest, questions: contest.questions.filter((q: any) => q.id !== questionId) } })
            }
        }
        return res
    },
    myContests: [],
    getMyContests: async () => {
        const res = await getMyContestsAPI()
        if (res.success) {
            set({ myContests: res.data })
        }
    },
    changeContestStatus: async (contestId, status) => {
        const res = await changeContestStatusAPI(contestId, status)
        if (res.success) {
            set((state) => ({
                contests: state.contests.map((c) => c.id === contestId ? { ...c, status } : c),
                contest: state.contest && state.contest.id === contestId ? { ...state.contest, status } : state.contest
            }))
        }
        return res
    },
    allQuestions: [],
    getAllQuestions: async () => {
        const res = await getAllQuestionsAPI()
        if (res.success) {
            set({ allQuestions: res.data })
        }
    },
    submissions: [],
    getQuizSubmissions: async () => {
        const res = await getQuizSubmissionsAPI()
        if (res.success) {
            set({ submissions: res.data })
        }
    }
}))

type UserState = {
    users: any[],
    getUsers: () => Promise<void>,
    updateUserBatches: (userId: string, batchIds: string[]) => Promise<any>
}

export const useUserStore = create<UserState>((set, get) => ({
    users: [],
    getUsers: async () => {
        const res = await getAllUsersAPI()
        set({ users: res.data })
    },
    updateUserBatches: async (userId: string, batchIds: string[]) => {
        const res = await updateUserBatchesAPI(userId, batchIds)
        if (res.success) {
            set((state) => ({
                users: state.users.map((u) => u.id === userId ? res.data : u)
            }))
        }
        return res
    }
}))