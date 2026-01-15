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
    const response = await axios.post(
        `${BASE_URL}/contest`,
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