'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import dynamic from 'next/dynamic';
const TerminalComponent = dynamic(() => import('../../../components/TerminalComponent'), { ssr: false });
import FileTree, { FileSystemItem } from '../../../components/FileTree';
import Sidebar from '../../components/layout/sidebar';
import { useAuthStore } from '../../store';
import Link from 'next/link';
import Editor from "@monaco-editor/react";
import { MessageSquare, FolderTree, RefreshCw, Globe } from 'lucide-react';

export default function InterviewRoomPage() {
    const { id } = useParams();
    const [socket, setSocket] = useState<Socket | null>(null);
    const token = useAuthStore((state: any) => state.token);
    const [code, setCode] = useState('// Write your solution here...');
    const [interview, setInterview] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [messages, setMessages] = useState<any[]>([]);
    const [input, setInput] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);
    const [files, setFiles] = useState<FileSystemItem[]>([
        {
            id: 'root',
            name: 'project',
            type: 'folder',
            isOpen: true,
            children: [
                { id: '1', name: 'index.js', type: 'file', content: '// Write your code here' }
            ]
        }
    ]);
    const [explorerWidth, setExplorerWidth] = useState(250);
    const [activeFile, setActiveFile] = useState<FileSystemItem | null>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    useEffect(() => {
        if (!id || !token) return;

        const fetchInterview = async () => {
            try {
                const res = await fetch(`http://localhost:3001/interview/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await res.json();
                if (data.interview) {
                    setInterview(data.interview);
                }
                if (data.latestCode) {
                    setCode(data.latestCode);
                }
            } catch (e) {
                console.error("Failed to fetch interview", e);
            } finally {
                setLoading(false);
            }
        };

        fetchInterview();

        const newSocket = io('http://localhost:3001', {
            query: { token },
            transports: ['websocket']
        });

        newSocket.on('connect', () => {
            console.log('Connected to socket');
            newSocket.emit('terminal:join', { interviewId: id });
            newSocket.emit('chat:join', { interviewId: id });
            newSocket.emit('file:sync');
        });

        newSocket.on('file:sync', (remoteFiles: any[]) => {
            console.log("Received remote files:", remoteFiles);

            setFiles(currentFiles => {
                const openPaths = new Set<string>();
                const getOpenPaths = (items: FileSystemItem[]) => {
                    items.forEach(item => {
                        if (item.type === 'folder' && item.isOpen && item.path) {
                            openPaths.add(item.path);
                            if (item.children) getOpenPaths(item.children);
                        }
                    });
                };
                getOpenPaths(currentFiles);

                const buildTree = (files: any[]) => {
                    const root: FileSystemItem = {
                        id: 'root',
                        name: 'project',
                        type: 'folder',
                        path: '/',
                        isOpen: true,
                        children: []
                    };

                    const pathMap: Record<string, FileSystemItem> = { '/': root };

                    const sortedFiles = [...files].sort((a, b) => {
                        const depthA = a.path.split('/').length;
                        const depthB = b.path.split('/').length;
                        return depthA - depthB;
                    });

                    sortedFiles.forEach(file => {
                        if (file.path === '/') return;
                        pathMap[file.path] = {
                            id: file.id,
                            name: file.name,
                            type: file.type,
                            path: file.path,
                            isOpen: openPaths.has(file.path),
                            children: file.type === 'folder' ? [] : undefined,
                            content: ''
                        };
                    });

                    sortedFiles.forEach(file => {
                        if (file.path === '/') return;
                        const parts = file.path.split('/').filter((p: string) => p);
                        parts.pop();
                        const parentPath = '/' + parts.join('/');
                        const parent = pathMap[parentPath];

                        if (parent && parent.children) {
                            const item = pathMap[file.path];
                            if (item) parent.children.push(item);
                        } else {
                            const item = pathMap[file.path];
                            if (item) root.children?.push(item);
                        }
                    });

                    return root;
                };

                const rootNode = buildTree(remoteFiles);
                return [rootNode];
            });
        });

        newSocket.on('file:content', ({ path, content }: { path: string, content: string }) => {
            console.log(`Received content for ${path}`);
            setCode(content);
        });

        newSocket.on('chat:history', (history) => {
            setMessages(history);
        });

        newSocket.on('chat:message', (message) => {
            setMessages(prev => [...prev, message]);
        });

        newSocket.on('port:url', ({ port, url }: { port: number, url: string }) => {
            console.log(`Port ${port} is available at ${url}`);
            const open = confirm(`App is running on port ${port}!\n\nURL: ${url}\n\nDo you want to open it?`);
            if (open) window.open(url, '_blank');
        });

        newSocket.on('terminal:error', (error) => {
            console.error('Terminal error:', error);
            alert(`Error: ${error}`);
        });


        newSocket.on('port:error', ({ message }) => {
            alert(message);
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, [id, token]);

    const handleFileSelect = (item: FileSystemItem) => {
        if (item.type === 'file') {
            console.log(`Selecting file: ${item.path || item.id}`);
            setActiveFile(item);
            if (socket) {
                socket.emit("file:read", { interviewId: id, path: item.path || item.id });
            }
        }
    };

    const handleSendMessage = () => {
        if (!input.trim() || !socket) return;
        socket.emit("chat:message", { interviewId: id, content: input });
        setInput('');
    };

    const requestPortUrl = (port: number) => {
        if (socket) {
            socket.emit("port:get_url", { port });
        }
    };

    const initialMessage = interview
        ? `This is an AI interview. Please don't copy paste; it is to check your hands-on experience only. The topic is ${interview.topic}. ${interview.description || ''}`
        : "Loading interview details...";

    return (
        <div className="flex h-screen bg-[#0f0f11] text-white overflow-hidden">
            <Sidebar />
            <div className="flex-1 flex flex-col ml-0 md:ml-0 md:pl-20 transition-all duration-300">
                <div className="h-14 border-b border-white/5 flex items-center justify-between px-6 bg-[#1a1a1c]">
                    <div className="flex items-center gap-4">
                        <span className="font-bold text-lg">Technical Interview</span>
                        {loading ? (
                            <span className="px-2 py-0.5 rounded text-xs font-mono bg-white/5 text-slate-500 animate-pulse">Loading...</span>
                        ) : (
                            <span className="px-2 py-0.5 rounded text-xs font-mono bg-brand-red/10 text-brand-red border border-brand-red/20">
                                {interview?.topic || id}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => requestPortUrl(3000)}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 text-sm font-medium hover:bg-emerald-500/20 transition-colors border border-emerald-500/20"
                        >
                            <Globe size={14} />
                            Preview App
                        </button>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-500 text-sm font-medium animate-pulse">
                            <div className="w-2 h-2 rounded-full bg-red-500" />
                            Recording
                        </div>
                    </div>
                </div>

                <div className="flex-1 flex overflow-hidden">
                    <div style={{ width: `${explorerWidth}px` }} className="border-r border-white/5 bg-[#141415] flex flex-col shrink-0">
                        <div className="p-4 border-b border-white/5 font-bold text-slate-300 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <FolderTree size={16} className="text-brand-red" />
                                <span>Files</span>
                            </div>
                            <button
                                onClick={() => socket?.emit('file:sync')}
                                className="p-1 hover:bg-white/10 rounded transition-colors text-slate-400 hover:text-white"
                                title="Refresh Files"
                            >
                                <RefreshCw size={14} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            <FileTree
                                items={files}
                                onSelect={handleFileSelect}
                                onUpdate={setFiles}
                                socket={socket}
                                interviewId={id as string}
                            />
                        </div>
                    </div>

                    <div
                        className="w-1 hover:bg-brand-red/50 cursor-col-resize transition-colors z-10"
                        onMouseDown={(e) => {
                            e.preventDefault();
                            const startX = e.clientX;
                            const startWidth = explorerWidth;
                            const handleMouseMove = (e: MouseEvent) => {
                                const newWidth = Math.min(Math.max(startWidth + (e.clientX - startX), 150), 400);
                                setExplorerWidth(newWidth);
                            };
                            const handleMouseUp = () => {
                                document.removeEventListener('mousemove', handleMouseMove);
                                document.removeEventListener('mouseup', handleMouseUp);
                            };
                            document.addEventListener('mousemove', handleMouseMove);
                            document.addEventListener('mouseup', handleMouseUp);
                        }}
                    />

                    <div className="w-80 border-r border-white/5 bg-[#141415] flex flex-col">
                        <div className="p-4 border-b border-white/5 font-bold text-slate-300 flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-red to-purple-600 flex items-center justify-center">
                                <span className="text-white text-xs">AI</span>
                            </div>
                            Interviewer
                        </div>
                        <div className="flex-1 p-4 flex flex-col gap-4 overflow-hidden">
                            <div ref={scrollRef} className="flex-1 bg-black/20 rounded-xl border border-white/5 p-3 space-y-3 overflow-y-auto custom-scrollbar">
                                <div className="flex gap-3">
                                    <div className="w-6 h-6 rounded-full bg-brand-red/20 flex-shrink-0 flex items-center justify-center text-[10px] text-brand-red">AI</div>
                                    <div className="text-sm text-slate-300 bg-white/5 p-2 rounded-r-lg rounded-bl-lg">
                                        {initialMessage}
                                    </div>
                                </div>

                                {messages.map((msg, i) => (
                                    <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                        <div className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] ${msg.role === 'user' ? 'bg-blue-500/20 text-blue-500' : 'bg-brand-red/20 text-brand-red'}`}>
                                            {msg.role === 'user' ? 'U' : 'AI'}
                                        </div>
                                        <div className={`text-sm p-2 rounded-lg ${msg.role === 'user' ? 'bg-blue-500/10 text-slate-200 rounded-l-lg rounded-br-lg' : 'bg-white/5 text-slate-300 rounded-r-lg rounded-bl-lg'}`}>
                                            {msg.content}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                    placeholder="Type a message..."
                                    className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-red/50"
                                />
                                <button
                                    onClick={handleSendMessage}
                                    className="p-2 bg-brand-red text-white rounded-lg hover:bg-red-600 transition-colors"
                                >
                                    <MessageSquare size={16} />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col min-w-0 border-r border-white/5 bg-[#1e1e1e]">
                        <Editor
                            height="100%"
                            defaultLanguage="javascript"
                            defaultValue="// Write your solution here..."
                            theme="vs-dark"
                            value={code}
                            onChange={(value) => {
                                const newCode = value || '';
                                setCode(newCode);
                                if (socket) {
                                    socket.emit("editor:event", {
                                        interviewId: id,
                                        value: newCode,
                                        path: activeFile?.path
                                    });
                                }
                            }}
                            options={{
                                minimap: { enabled: false },
                                fontSize: 14,
                                padding: { top: 20 },
                                scrollBeyondLastLine: false,
                                automaticLayout: true,
                            }}
                        />
                    </div>

                    <div className="flex-1 flex flex-col bg-[#0f0f11] min-w-0">
                        <div className="h-full">
                            <TerminalComponent socket={socket} files={files} setFiles={setFiles} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
