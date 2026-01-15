'use client'
import { create } from 'zustand'
import { createBatchAPI, createContestAPI, deleteBatchAPI, deleteContestAPI, getAllContestsAPI, getBatchesAPI, getLiveContestsAPI, getUpcomingContestsAPI, updateBatchAPI, updateContestAPI } from './api'


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
    getContests: () => Promise<void>,
    createContest: (title: string, isOpenAll: boolean, startTime: string, batchIds: string[]) => Promise<any>,
    updateContest: (contestId: string, title: string, isOpenAll: boolean, startTime: string, batchIds: string[]) => Promise<any>,
    deleteContest: (contestId: string) => Promise<any>,
    getContestById: (contestId: string) => any
    getLiveContests: () => Promise<void>,
    getUpcomingContests: () => Promise<void>,
    getAllContests: () => Promise<void>,
}
export const useAuthStore = create<AuthState>((set) => ({
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
}))
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
    getContests: async () => {
        const res = await getAllContestsAPI()
        set({ contests: res.data })
    },
    createContest: async (title: string, isOpenAll: boolean, startTime: string, batchIds: string[]) => {
        const res = await createContestAPI(title, isOpenAll, startTime, batchIds)
        if (res.success) {
            set((state) => ({ contests: [...state.contests, res.data] }))
        }
        return res
    },
    updateContest: async (contestId: string, title: string, isOpenAll: boolean, startTime: string, batchIds: string[]) => {
        const res = await updateContestAPI(contestId, title, isOpenAll, startTime, batchIds)
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
    getContestById: (contestId: string) => {
        return get().contests.find((contest: any) => contest.id === contestId)
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
    }
}))