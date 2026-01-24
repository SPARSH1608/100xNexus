
'use client'
import { redirect, useRouter } from "next/navigation"
import AdminDashboard from "../components/dashbaord/AdminDashboard"
import CandidateDashboard from "../components/dashbaord/CandidateDashboard"
import { useAuthStore } from "../store"

import { useEffect } from "react"
export default function Dashboard() {
    const { isAuthenticated, role } = useAuthStore((state) => state)
    const router = useRouter()

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/signin')
        }
    }, [isAuthenticated, router])

    if (!isAuthenticated) {
        return null
    }

    if (role === 'ADMIN') {
        return <AdminDashboard />
    }
    return <CandidateDashboard />
}