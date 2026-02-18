
"use client";

import { useEffect, useRef, useState } from "react";
import { Terminal as XTerm } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import "xterm/css/xterm.css";
import { Socket } from "socket.io-client";
import { Trash2, Plus, Terminal as TerminalIcon } from "lucide-react";
import { FileSystemItem } from "./FileTree";

interface TerminalComponentProps {
    socket: Socket | null;
    files?: FileSystemItem[];
    setFiles?: (files: FileSystemItem[]) => void;
}

export default function TerminalComponent({ socket, files = [], setFiles }: TerminalComponentProps) {
    const terminalRef = useRef<HTMLDivElement>(null);
    const xtermRef = useRef<XTerm | null>(null);
    const [tabs, setTabs] = useState([{ id: '1', name: 'Terminal 1' }]);
    const [activeTabId, setActiveTabId] = useState('1');

    const userInputRef = useRef<string>("");

    useEffect(() => {
        if (!terminalRef.current) return;

        const term = new XTerm({
            cursorBlink: true,
            theme: {
                background: '#0f0f11',
                foreground: '#cccccc',
            },
            fontSize: 14,
            fontFamily: 'monospace',
            rows: 24,
        });

        const fitAddon = new FitAddon();
        term.loadAddon(fitAddon);

        // Ensure term is opened before fit
        term.open(terminalRef.current);

        // Small delay to ensure container is rendered
        const initialFitTimeout = setTimeout(() => {
            try {
                fitAddon.fit();
            } catch (e) {
                console.warn("Initial fit failed:", e);
            }
        }, 50);

        term.onData((data: string) => {
            if (socket) {
                // Send raw data to the backend PTY
                socket.emit("terminal:input", { input: data });
            }
        });

        if (socket) {
            // Remove any existing listener before adding a new one
            socket.off("terminal:output");
            socket.on("terminal:output", (data: string) => {
                if (xtermRef.current) {
                    xtermRef.current.write(data);
                }
            });
        }

        xtermRef.current = term;

        const handleResize = () => {
            if (!xtermRef.current) return;
            try {
                fitAddon.fit();
                if (socket) {
                    const dims = fitAddon.proposeDimensions();
                    if (dims) {
                        socket.emit("terminal:resize", dims);
                    }
                }
            } catch (err) {
                console.warn("Fit failed:", err);
            }
        };

        window.addEventListener('resize', handleResize);

        return () => {
            clearTimeout(initialFitTimeout);
            term.dispose();
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    // Separate effect for socket listeners to avoid re-initializing terminal on socket change
    useEffect(() => {
        if (!socket || !xtermRef.current) return;

        const handleTerminalOutput = (data: string) => {
            xtermRef.current?.write(data);
        };

        socket.off("terminal:output");
        socket.on("terminal:output", handleTerminalOutput);

        return () => {
            socket.off("terminal:output", handleTerminalOutput);
        };
    }, [socket]);

    useEffect(() => {
        setTimeout(() => { }, 100);
    }, [activeTabId]);


    const addTab = () => {
        const newId = (tabs.length + 1).toString();
        setTabs([...tabs, { id: newId, name: `Terminal ${newId}` }]);
        setActiveTabId(newId);
        if (xtermRef.current) xtermRef.current.writeln(`\nSwitched to Terminal ${newId}\n$ `);

        if (socket) {
            socket.emit("terminal:tab:created", { id: newId });
        }
    };

    const removeTab = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (tabs.length === 1) return;
        const newTabs = tabs.filter(t => t.id !== id);
        setTabs(newTabs);
        if (activeTabId === id && newTabs[0]) {
            setActiveTabId(newTabs[0].id);
        }

        if (socket) {
            socket.emit("terminal:tab:closed", { id });
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#1e1e1e] border-t border-[#3e3e42]">
            <div className="flex items-center bg-[#252526] border-b border-[#252526] px-2">
                <div className="flex items-center text-[11px] uppercase tracking-wide text-[#bbbbbb] px-2 font-bold cursor-pointer h-full border-b-2 border-[#007acc] mr-2">
                    TERMINAL
                </div>
                <div className="flex-1 flex overflow-x-auto no-scrollbar">
                    {tabs.map(tab => (
                        <div
                            key={tab.id}
                            className={`
                                flex items-center px-3 py-1.5 text-xs cursor-pointer select-none border-r border-[#2d2d2d] min-w-[100px] rounded-t-sm mx-[1px]
                                ${activeTabId === tab.id ? 'bg-[#1e1e1e] text-white border-t border-l border-r border-[#3e3e42]' : 'bg-[#2d2d2d] text-[#969696] hover:bg-[#3e3e42]'}
                            `}
                            onClick={() => setActiveTabId(tab.id)}
                        >
                            <TerminalIcon size={12} className="mr-2 shrink-0" />
                            <span className="truncate flex-1">{tab.name}</span>
                            {tabs.length > 1 && (
                                <button className="ml-2 hover:text-red-400 shrink-0" onClick={(e) => removeTab(e, tab.id)}>
                                    <Trash2 size={12} />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
                <button
                    onClick={addTab}
                    className="p-1.5 hover:bg-[#3e3e42] text-[#cccccc] hover:text-white transition-colors ml-2 rounded shrink-0"
                    title="New Terminal"
                >
                    <Plus size={16} />
                </button>
            </div>

            <div className="flex-1 p-2 min-h-0">
                <div ref={terminalRef} className="h-full w-full" />
            </div>
        </div>
    );
}
