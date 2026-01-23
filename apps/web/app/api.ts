'use client'
import axios from 'axios'
import { useAuthStore } from './store'
type ErrorResponse = {
    success: boolean,
    error: string
}
type SuccessResponse = {
    success: boolean,
    data: any,
    message: string
}
type Response = SuccessResponse | ErrorResponse
const BASE_URL = 'http://localhost:3001'

axios.interceptors.response.use(
    (response) => {
        return response
    },
    (error) => {
        if (error.response && error.response.status === 403) {
            useAuthStore.getState().logout()
            window.location.href = '/'
        }
        return Promise.reject(error)
    }
)

// -------------------------------------AUTH-------------------------------------
export const SignupAPI = async (name: string, email: string, password: string) => {
    console.log('name', name)
    console.log('email', email)
    console.log('password', password)
    const response = await axios.post(
        `${BASE_URL}/auth/signup`,
        {
            name,
            email,
            password,
        },
        {
            headers: {
                "Content-Type": "application/json",
            },
        }
    )

    if (!response.data.success) {
        throw new Error(response.data.error)
    }
    return response.data
}

export const LoginAPI = async (email: string, password: string) => {
    const response = await axios.post(
        `${BASE_URL}/auth/login`,
        {
            email,
            password,
        },
        {
            headers: {
                "Content-Type": "application/json",
            },
        }
    )

    if (!response.data.success) {
        throw new Error(response.data.error)
    }
    return response.data
}


// -------------------------------------BATCH-------------------------------------
export const createBatchAPI = async (name: string) => {
    const token = useAuthStore.getState().token
    console.log('token', token, name)
    const response = await axios.post(
        `${BASE_URL}/batch`,
        {
            name,
        },
        {
            headers: {
                "Content-Type": "application/json",
                "authorization": `Bearer ${token}`
            },
        }
    )

    if (!response.data.success) {
        throw new Error(response.data.error)
    }
    return response.data
}
export const getBatchesAPI = async () => {
    const token = useAuthStore.getState().token
    const response = await axios.get(
        `${BASE_URL}/batch`,
        {
            headers: {
                "Content-Type": "application/json",
                "authorization": `Bearer ${token}`
            },
        }
    )

    if (!response.data.success) {
        throw new Error(response.data.error)
    }
    return response.data
}
export const updateBatchAPI = async (batchId: string, name: string) => {
    const token = useAuthStore.getState().token
    const response = await axios.patch(
        `${BASE_URL}/batch/${batchId}`,
        {
            name,
        },
        {
            headers: {
                "Content-Type": "application/json",
                "authorization": `Bearer ${token}`
            },
        }
    )

    if (!response.data.success) {
        throw new Error(response.data.error)
    }
    return response.data
}

export const deleteBatchAPI = async (batchId: string) => {
    const token = useAuthStore.getState().token
    console.log('token', token)
    console.log('batchId', batchId)
    const response = await axios.delete(
        `${BASE_URL}/batch/${batchId}`,
        {
            headers: {
                "Content-Type": "application/json",
                "authorization": `Bearer ${token}`
            },
        }
    )
    console.log('response', response)
    if (!response.data.success) {
        throw new Error(response.data.error)
    }
    return response.data
}


// -------------------------------------CONTEST-------------------------------------

export const createContestAPI = async (title: string, isOpenAll: boolean, startTime: string, batchIds: string[]) => {
    const token = useAuthStore.getState().token
    console.log('token', token, title)
    let newStartTime = new Date(startTime).getTime() + 5 * 60 * 1000;
    const response = await axios.post(
        `${BASE_URL}/contest`,
        {
            title, isOpenAll, startTime: new Date(newStartTime).toISOString(), batchIds
        },
        {
            headers: {
                "Content-Type": "application/json",
                "authorization": `Bearer ${token}`
            },
        }
    )

    if (!response.data.success) {
        throw new Error(response.data.error)
    }
    return response.data
}

export const updateContestAPI = async (contestId: string, title: string, isOpenAll: boolean, startTime: string, batchIds: string[]) => {
    const token = useAuthStore.getState().token
    console.log('token', token, title)
    const response = await axios.patch(
        `${BASE_URL}/contest/${contestId}`,
        {
            title, isOpenAll, startTime, batchIds
        },
        {
            headers: {
                "Content-Type": "application/json",
                "authorization": `Bearer ${token}`
            },
        }
    )

    if (!response.data.success) {
        throw new Error(response.data.error)
    }
    return response.data
}

export const getMyContestsAPI = async () => {
    const token = useAuthStore.getState().token
    const response = await axios.get(
        `${BASE_URL}/contest/my-contests`,
        {
            headers: {
                "Content-Type": "application/json",
                "authorization": `Bearer ${token}`
            },
        }
    )

    if (!response.data.success) {
        throw new Error(response.data.error)
    }
    return response.data
}

export const deleteContestAPI = async (contestId: string) => {
    const token = useAuthStore.getState().token
    console.log('token', token)
    console.log('contestId', contestId)
    const response = await axios.delete(
        `${BASE_URL}/contest/${contestId}`,
        {
            headers: {
                "Content-Type": "application/json",
                "authorization": `Bearer ${token}`
            },
        }
    )
    console.log('response', response)
    if (!response.data.success) {
        throw new Error(response.data.error)
    }
    return response.data
}

export const changeContestStatusAPI = async (contestId: string, status: string) => {
    const token = useAuthStore.getState().token
    const response = await axios.post(
        `${BASE_URL}/contest/${contestId}/status`,
        {
            status
        },
        {
            headers: {
                "Content-Type": "application/json",
                "authorization": `Bearer ${token}`
            },
        }
    )

    if (!response.data.success) {
        throw new Error(response.data.error)
    }
    return response.data
}

export const joinContestAPI = async (contestId: string) => {
    const token = useAuthStore.getState().token
    const response = await axios.post(
        `${BASE_URL}/contest/${contestId}/join`,
        {},
        {
            headers: {
                "Content-Type": "application/json",
                "authorization": `Bearer ${token}`
            },
        }
    )

    if (!response.data.success) {
        throw new Error(response.data.error)
    }
    return response.data
}

export const getContestByIdAPI = async (contestId: string) => {
    const token = useAuthStore.getState().token
    const response = await axios.get(
        `${BASE_URL}/contest/${contestId}`,
        {
            headers: {
                "Content-Type": "application/json",
                "authorization": `Bearer ${token}`
            },
        }
    )

    if (!response.data.success) {
        throw new Error(response.data.error)
    }
    return response.data
}


export const getAllContestsAPI = async () => {
    const token = useAuthStore.getState().token
    const response = await axios.get(
        `${BASE_URL}/contest/all`,
        {
            headers: {
                "Content-Type": "application/json",
                "authorization": `Bearer ${token}`
            },
        }
    )

    if (!response.data.success) {
        throw new Error(response.data.error)
    }
    return response.data
}


export const getLiveContestsAPI = async () => {
    const token = useAuthStore.getState().token
    const response = await axios.get(
        `${BASE_URL}/contest/live`,
        {
            headers: {
                "Content-Type": "application/json",
                "authorization": `Bearer ${token}`
            },
        }
    )

    if (!response.data.success) {
        throw new Error(response.data.error)
    }
    return response.data
}

export const getUpcomingContestsAPI = async () => {
    const token = useAuthStore.getState().token
    const response = await axios.get(
        `${BASE_URL}/contest/upcoming`,
        {
            headers: {
                "Content-Type": "application/json",
                "authorization": `Bearer ${token}`
            },
        }
    )

    if (!response.data.success) {
        throw new Error(response.data.error)
    }
    return response.data
}
// -------------------------------------QUESTION-------------------------------------

export const createQuestionAPI = async (contestId: string, title: string, description: string, score: number, options: any[], timeLimit: number) => {
    const token = useAuthStore.getState().token
    const response = await axios.post(
        `${BASE_URL}/question`,
        {
            contestId, title, description, score, options, timeLimit
        },
        {
            headers: {
                "Content-Type": "application/json",
                "authorization": `Bearer ${token}`
            },
        }
    )

    if (!response.data.success) {
        throw new Error(response.data.error)
    }
    return response.data
}

export const updateQuestionAPI = async (questionId: string, title?: string, description?: string, score?: number, options?: any[], timeLimit?: number) => {
    const token = useAuthStore.getState().token
    const response = await axios.patch(
        `${BASE_URL}/question/${questionId}`,
        {
            title, description, score, options, timeLimit
        },
        {
            headers: {
                "Content-Type": "application/json",
                "authorization": `Bearer ${token}`
            },
        }
    )

    if (!response.data.success) {
        throw new Error(response.data.error)
    }
    return response.data
}

export const deleteQuestionAPI = async (questionId: string) => {
    const token = useAuthStore.getState().token
    const response = await axios.delete(
        `${BASE_URL}/question/${questionId}`,
        {
            headers: {
                "Content-Type": "application/json",
                "authorization": `Bearer ${token}`
            },
        }
    )

    if (!response.data.success) {
        throw new Error(response.data.error)
    }
    return response.data
}

// -------------------------------------USER-------------------------------------

export const getAllUsersAPI = async () => {
    const token = useAuthStore.getState().token
    const response = await axios.get(
        `${BASE_URL}/user`,
        {
            headers: {
                "Content-Type": "application/json",
                "authorization": `Bearer ${token}`
            },
        }
    )

    if (!response.data.success) {
        throw new Error(response.data.error)
    }
    return response.data
}

export const updateUserBatchesAPI = async (userId: string, batchIds: string[]) => {
    const token = useAuthStore.getState().token
    const response = await axios.patch(
        `${BASE_URL}/user/${userId}/batches`,
        {
            batchIds
        },
        {
            headers: {
                "Content-Type": "application/json",
                "authorization": `Bearer ${token}`
            },
        }
    )

    if (!response.data.success) {
        throw new Error(response.data.error)
    }
    return response.data
}

export const submitAnswerAPI = async (contestId: string, questionId: string, optionIds: string[]) => {
    const token = useAuthStore.getState().token
    const response = await axios.post(
        `${BASE_URL}/contest/${contestId}/submit`,
        {
            questionId, optionIds
        },
        {
            headers: {
                "Content-Type": "application/json",
                "authorization": `Bearer ${token}`
            },
        }
    )

    if (!response.data.success) {
        throw new Error(response.data.error)
    }
    return response.data
}

export const getLeaderboardAPI = async (contestId: string) => {
    const token = useAuthStore.getState().token
    const response = await axios.get(
        `${BASE_URL}/contest/${contestId}/leaderboard`,
        {
            headers: {
                "Content-Type": "application/json",
                "authorization": `Bearer ${token}`
            },
        }
    )

    if (!response.data.success) {
        throw new Error(response.data.error)
    }
    return response.data
}
