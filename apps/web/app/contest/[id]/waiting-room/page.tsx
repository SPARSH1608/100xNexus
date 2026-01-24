'use client'
import { useParams, useRouter } from "next/navigation";
import ImageSphere from "../../../../components/ImageSphere";
import Sidebar from "../../../components/layout/sidebar";
import { useEffect, useState } from "react";
import { getContestByIdAPI, joinContestAPI } from "../../../api";

// Generate dummy avatars
// Generate dummy avatars using Vercel avatars for better stability/CORS
const AVATARS = Array.from({ length: 20 }).map((_, i) =>
    `https://avatar.vercel.sh/contest-user-${i}`
);

export default function ContestPage() {
    const { id } = useParams();
    const router = useRouter();
    const [contest, setContest] = useState<any>(null);
    const [timeLeft, setTimeLeft] = useState<string>("00:00:00");
    const [participants, setParticipants] = useState(0);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchContest = async () => {
            try {
                // Try to join the contest first
                try {
                    await joinContestAPI(id as string);
                } catch (e) {
                    // Ignore already joined errors, but log others
                    console.error("Join warning:", e);
                }

                try {
                    const data = await getContestByIdAPI(id as string);
                    setContest(data.data);
                    if (data.data._count?.participants) {
                        setParticipants(data.data._count.participants);
                    }
                    if (data.data.status === 'LIVE') {
                        router.push(`/contest/${id}/play`);
                    }
                } catch (e: any) {
                    console.error("Fetch contest error:", e);
                    setError(e.message || "Failed to load contest details");
                }
            } catch (e: any) {
                console.error("General error:", e);
                setError(e.message || "An unexpected error occurred");
            }
        };

        fetchContest();

        // Poll for status updates every 5 seconds
        const pollInterval = setInterval(async () => {
            try {
                const data = await getContestByIdAPI(id as string);
                if (data.data._count?.participants) {
                    setParticipants(data.data._count.participants);
                }
                if (data.data.status === 'LIVE') {
                    router.push(`/contest/${id}/play`);
                }
            } catch (e) {
                console.error(e);
            }
        }, 5000);

        return () => clearInterval(pollInterval);
    }, [id, router]);

    useEffect(() => {
        if (!contest) return;

        const timer = setInterval(() => {
            const now = new Date().getTime();
            const start = new Date(contest.startTime).getTime();
            const distance = start - now;

            if (distance < 0) {
                setTimeLeft("Starting...");
                return;
            }

            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
        }, 1000);

        return () => clearInterval(timer);
    }, [contest]);

    return (
        <div className="min-h-screen bg-black text-white font-sans overflow-hidden relative">
            <Sidebar />

            {/* Background Sphere */}
            <div className="absolute inset-0 z-0">
                <ImageSphere images={AVATARS} />
            </div>

            {/* Overlay Content */}
            <div className="relative z-10 container mx-auto px-4 h-full min-h-screen flex flex-col justify-center items-center pointer-events-none md:pl-24">
                <div className="glass-card p-8 md:p-12 rounded-[2rem] text-center max-w-2xl w-full border border-white/10 backdrop-blur-md bg-black/40 pointer-events-auto">
                    <div className="mb-4">
                        <span className="inline-block w-3 h-3 rounded-full bg-green-500 animate-pulse mr-2"></span>
                        <span className="text-sm font-mono uppercase tracking-widest text-slate-400">Waiting Room</span>
                    </div>

                    <h1 className="text-4xl md:text-6xl font-clean font-bold mb-6">
                        {contest ? (
                            <>
                                Contest <span className="text-brand-red font-cursive">#{contest.title}</span>
                            </>
                        ) : error ? (
                            <span className="text-red-500 text-3xl">{error}</span>
                        ) : (
                            <span className="animate-pulse">Loading Contest...</span>
                        )}
                    </h1>

                    <p className="font-clean text-xl text-slate-300 mb-8 max-w-lg mx-auto leading-relaxed">
                        The arena is preparing. Gladiators are gathering. Prepare your algorithms for the ultimate showdown.
                    </p>

                    <div className="flex justify-center gap-4 mb-8">
                        <div className="flex flex-col items-center">
                            <span className="text-3xl font-bold text-white">{participants}</span>
                            <span className="text-xs uppercase text-slate-500 tracking-wider">Players Ready</span>
                        </div>
                        <div className="w-px h-12 bg-white/10"></div>
                        <div className="flex flex-col items-center">
                            <span className="text-3xl font-bold text-white font-mono">{timeLeft}</span>
                            <span className="text-xs uppercase text-slate-500 tracking-wider">Time to Start</span>
                        </div>
                    </div>

                    <button disabled className="bg-brand-red/50 cursor-not-allowed text-white px-8 py-3 rounded-full font-bold transition-all shadow-lg border border-white/10">
                        Waiting for Host
                    </button>
                </div>
            </div>

            <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black to-transparent pointer-events-none" />
        </div>
    );
}