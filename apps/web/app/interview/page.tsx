"use client";

import { useEffect, useState, useRef } from "react";
import InterviewEditor from "../../components/InterviewEditor";
import FileTree, { FileSystemItem } from "../../components/FileTree";
import TerminalComponent from "../../components/TerminalComponent";
import { io, Socket } from "socket.io-client";
import { useDebouncedCallback } from "../../hooks/useDebounce";

const initialFileStructure: FileSystemItem[] = [
    {
        id: 'root',
        name: 'project',
        type: 'folder',
        isOpen: true,
        children: [
            {
                id: '1',
                name: 'index.js',
                type: 'file',
                content: '// Write your code here\nconsole.log("Hello World");'
            }
        ]
    }
];

export default function InterviewPage() {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [files, setFiles] = useState<FileSystemItem[]>(initialFileStructure);
    const [selectedFile, setSelectedFile] = useState<FileSystemItem | null>(null);
    const [terminalHeight, setTerminalHeight] = useState(200);
    const [activeSidebar, setActiveSidebar] = useState<'files' | 'search' | 'git'>('files');

    useEffect(() => {
        const newSocket = io("http://localhost:3001");
        setSocket(newSocket);

        newSocket.on("connect", () => {
            console.log("Connected to socket server");
        });

        if (files[0] && files[0].children && files[0].children.length > 0) {
            const firstChild = files[0].children[0];
            if (firstChild) {
                setSelectedFile(firstChild);
            }
        }

        return () => {
            newSocket.disconnect();
        };
    }, []);

    const handleFileSelect = (item: FileSystemItem) => {
        if (item.type === 'file') {
            setSelectedFile(item);
            if (socket) {
                socket.emit("file:read", { id: item.id, path: item.name });
            }
        }
    };

    const debouncedSocketUpdate = useDebouncedCallback((file: FileSystemItem, content: string) => {
        if (socket) {
            socket.emit("editor:event", {
                type: "FILE_UPDATE",
                path: file.name,
                content: content,
                timestamp: Date.now()
            });
        }
    }, 500);

    const handleCodeChange = (value: string | undefined) => {
        if (!selectedFile || value === undefined) return;

        const updateFileContent = (items: FileSystemItem[]): FileSystemItem[] => {
            return items.map(item => {
                if (item.id === selectedFile.id) {
                    return { ...item, content: value };
                }
                if (item.children) {
                    return { ...item, children: updateFileContent(item.children) };
                }
                return item;
            });
        };

        const newFiles = updateFileContent(files);
        setFiles(newFiles);

        setSelectedFile(prev => prev ? ({ ...prev, content: value }) : null);

        debouncedSocketUpdate(selectedFile, value);
    };




    const [explorerWidth, setExplorerWidth] = useState(256);
    const [aiPanelWidth, setAiPanelWidth] = useState(320);

    return (
        <div className="flex h-screen bg-[#1e1e1e] text-[#cccccc] font-sans overflow-hidden">
            <div style={{ width: `${explorerWidth}px` }} className={`bg-[#252526] border-r border-[#1e1e1e] flex flex-col shrink-0 ${activeSidebar === 'files' ? 'block' : 'hidden'}`}>
                <div className="h-9 px-4 flex items-center text-[11px] font-bold tracking-wider text-[#bbbbbb] bg-[#252526]">
                    EXPLORER
                </div>
                <div className="flex-1 overflow-y-auto">
                    <FileTree
                        items={files}
                        onSelect={handleFileSelect}
                        onUpdate={setFiles}
                        socket={socket}
                    />
                </div>
            </div>

            <div
                className={`w-1 hover:bg-[#007acc] cursor-col-resize transition-colors z-10 ${activeSidebar === 'files' ? 'block' : 'hidden'}`}
                onMouseDown={(e) => {
                    e.preventDefault();
                    const startX = e.clientX;
                    const startWidth = explorerWidth;
                    const handleMouseMove = (e: MouseEvent) => {
                        const delta = e.clientX - startX;
                        const newWidth = Math.min(Math.max(startWidth + delta, 150), 600);
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

            <div className="flex-1 flex flex-col min-w-0 bg-[#1e1e1e]">
                <div className="h-9 bg-[#2d2d2d] flex items-center border-b border-[#252526] overflow-x-auto no-scrollbar">
                    {selectedFile ? (
                        <div className="bg-[#1e1e1e] text-white px-3 h-full flex items-center border-t-2 border-[#007acc] text-sm min-w-[120px]">
                            <span className="mr-2 text-yellow-400">JS</span>
                            <span className="truncate">{selectedFile.name}</span>
                            <button className="ml-auto text-gray-400 hover:text-white px-1">×</button>
                        </div>
                    ) : (
                        <div className="px-3 text-gray-500 text-sm italic">Welcome</div>
                    )}
                </div>

                <div className="flex-1 relative min-h-0">
                    {selectedFile ? (
                        <InterviewEditor
                            code={selectedFile.content || ""}
                            onChange={handleCodeChange}
                            language={selectedFile.name.endsWith('.js') ? 'javascript' : 'plaintext'}
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-[#3e3e42]">
                            <svg className="w-32 h-32 mb-4 opacity-20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" /></svg>
                            <p className="text-lg">Select a file to start coding</p>
                        </div>
                    )}
                </div>

                <div
                    className="h-1 bg-[#2d2d2d] hover:bg-[#007acc] cursor-row-resize transition-colors z-10"
                    onMouseDown={(e) => {
                        e.preventDefault();
                        const startY = e.clientY;
                        const startHeight = terminalHeight;
                        const handleMouseMove = (e: MouseEvent) => {
                            const delta = startY - e.clientY;
                            const newHeight = Math.min(Math.max(startHeight + delta, 100), 800);
                            setTerminalHeight(newHeight);
                        };
                        const handleMouseUp = () => {
                            document.removeEventListener('mousemove', handleMouseMove);
                            document.removeEventListener('mouseup', handleMouseUp);
                        };
                        document.addEventListener('mousemove', handleMouseMove);
                        document.addEventListener('mouseup', handleMouseUp);
                    }}
                />

                <div style={{ height: `${terminalHeight}px` }} className="shrink-0 bg-[#1e1e1e] border-t border-[#3e3e42]">
                    <TerminalComponent
                        socket={socket}
                        files={files}
                        setFiles={setFiles}
                    />
                </div>
            </div>

            <div
                className="w-1 hover:bg-[#007acc] cursor-col-resize transition-colors z-10"
                onMouseDown={(e) => {
                    e.preventDefault();
                    const startX = e.clientX;
                    const startWidth = aiPanelWidth;
                    const handleMouseMove = (e: MouseEvent) => {
                        const delta = startX - e.clientX; // Negative because dragging left increases width
                        const newWidth = Math.min(Math.max(startWidth + delta, 200), 600);
                        setAiPanelWidth(newWidth);
                    };
                    const handleMouseUp = () => {
                        document.removeEventListener('mousemove', handleMouseMove);
                        document.removeEventListener('mouseup', handleMouseUp);
                    };
                    document.addEventListener('mousemove', handleMouseMove);
                    document.addEventListener('mouseup', handleMouseUp);
                }}
            />

            <div style={{ width: `${aiPanelWidth}px` }} className="bg-[#252526] border-l border-[#1e1e1e] flex flex-col shrink-0">
                <div className="h-9 px-4 flex items-center text-[11px] font-bold tracking-wider text-[#bbbbbb] bg-[#252526] border-b border-[#1e1e1e]">
                    AI INTERVIEWER
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                    <div className="text-gray-400 text-sm">
                        AI waiting for execution...
                    </div>
                </div>
                <div className="p-4 border-t border-[#1e1e1e]">
                    <div className="p-2 border border-[#3e3e42] rounded text-center text-gray-500 text-sm bg-[#1e1e1e]">
                        AI Status: Idle
                    </div>
                </div>
            </div>

            <div className="fixed bottom-0 w-full h-6 bg-[#007acc] text-white flex items-center px-4 text-xs z-50 justify-between select-none font-sans">
                <div className="flex items-center gap-4">
                    <span className="font-semibold cursor-pointer hover:bg-white/20 px-1 rounded">main*</span>
                    <span className="cursor-pointer hover:bg-white/20 px-1 rounded flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-white"></span>
                        0 Errors
                    </span>
                </div>
                <div className="flex items-center gap-4">
                    <span className="cursor-pointer hover:bg-white/20 px-1 rounded">Ln 1, Col 1</span>
                    <span className="cursor-pointer hover:bg-white/20 px-1 rounded">UTF-8</span>
                    <span className="cursor-pointer hover:bg-white/20 px-1 rounded">JavaScript</span>
                    <span className="cursor-pointer hover:bg-white/20 px-1 rounded">Prettier</span>
                </div>
            </div>
        </div>
    );
}
