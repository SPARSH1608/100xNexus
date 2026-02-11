'use client'
import { useParams, useRouter } from "next/navigation";
import ImageSphere from "../../../../components/ImageSphere";
import Sidebar from "../../../components/layout/sidebar";
import { useEffect, useState } from "react";
import { getContestByIdAPI, joinContestAPI } from "../../../api";
import { Code2, Clock, Users, Zap } from "lucide-react";

// Use local avatar images for better reliability
const AVATARS = Array.from({ length: 20 }).map((_, i) =>
    `/avatars/avatar-${i + 1}.svg`
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
                try {
                    await joinContestAPI(id as string);
                } catch (e) {
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
        <div className="min-h-screen bg-black text-white font-sans overflow-hidden relative selection:bg-brand-red/30">
            <Sidebar />

            <div className="absolute inset-0 z-0 opacity-20 pointer-events-none grayscale">
                <ImageSphere images={AVATARS} />
            </div>

            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-black/80 via-black/50 to-black pointer-events-none z-0" />


            <div className="relative z-10 w-full min-h-screen flex flex-col items-center justify-center p-6">
                <div className="max-w-xl w-full text-center">

                    <div className="w-20 h-20 mx-auto mb-8 bg-gradient-to-tr from-white/10 to-white/5 rounded-3xl flex items-center justify-center border border-white/10 shadow-2xl backdrop-blur-md animate-in zoom-in duration-700">
                        <Code2 size={40} className="text-white opacity-90" />
                    </div>

                    <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-white mb-6 animate-in slide-in-from-bottom-4 duration-700 delay-100">
                        {contest ? (
                            <span>{contest.title}</span>
                        ) : (
                            <span className="animate-pulse opacity-50">Loading...</span>
                        )}
                    </h1>

                    <p className="text-slate-400 text-lg mb-12 font-medium tracking-wide animate-in slide-in-from-bottom-4 duration-700 delay-200">
                        The session will begin shortly.
                    </p>

                    <div className="grid grid-cols-2 gap-4 mb-12 animate-in slide-in-from-bottom-4 duration-700 delay-300">
                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-2xl flex flex-col items-center">
                            <div className="flex items-center gap-2 text-slate-400 mb-2 uppercase tracking-widest text-xs font-bold">
                                <Users size={14} />
                                <span>Participants</span>
                            </div>
                            <div className="text-3xl font-bold text-white tabular-nums">
                                {participants}
                            </div>
                        </div>

                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-2xl flex flex-col items-center">
                            <div className="flex items-center gap-2 text-slate-400 mb-2 uppercase tracking-widest text-xs font-bold">
                                <Clock size={14} />
                                <span>Starts In</span>
                            </div>
                            <div className="text-3xl font-bold text-white tabular-nums font-mono">
                                {timeLeft}
                            </div>
                        </div>
                    </div>

                    <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 text-slate-300 text-sm font-medium animate-in fade-in duration-1000 delay-500">
                        <div className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                        </div>
                        Waiting for host to start session
                    </div>

                    {error && (
                        <div className="mt-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                            {error}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}