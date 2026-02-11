
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

    const currentPathRef = useRef<string>("/");
    const userInputRef = useRef<string>("");

    const resolvePath = (path: string): FileSystemItem[] | null => {
        if (path === "/") return files;

        const parts = path.split("/").filter(p => p);
        let current: FileSystemItem[] | undefined = files;

        for (const part of parts) {
            const found: FileSystemItem | undefined = current?.find(item => item.name === part && item.type === 'folder');
            if (found) {
                current = found.children;
            } else {
                return null;
            }
        }
        return current || null;
    };

    const handleCommand = (cmd: string, term: XTerm) => {
        if (socket && cmd.trim()) {
            socket.emit("terminal:command", {
                command: cmd,
                path: currentPathRef.current
            });
        }

        const parts = cmd.trim().split(/\s+/);
        const command = parts[0];
        const args = parts.slice(1);

        switch (command) {
            case "ls":
                const items = resolvePath(currentPathRef.current);
                if (items) {
                    const output = items.map(item => {
                        return item.type === 'folder' ? `\x1b[1;34m${item.name}\x1b[0m` : item.name;
                    }).join("  ");
                    term.writeln(output);
                } else {
                    term.writeln(`Error access path: ${currentPathRef.current}`);
                }
                break;
            case "pwd":
                term.writeln(currentPathRef.current);
                break;
            case "cd":
                const target = args[0];
                if (!target || target === "/") {
                    currentPathRef.current = "/";
                } else if (target === "..") {
                    const pathParts = currentPathRef.current.split("/").filter(p => p);
                    pathParts.pop();
                    currentPathRef.current = "/" + pathParts.join("/");
                    if (currentPathRef.current === "") currentPathRef.current = "/";
                } else {
                    const potentialPath = currentPathRef.current === "/"
                        ? `/${target}`
                        : `${currentPathRef.current}/${target}`;

                    const resolved = resolvePath(potentialPath);
                    if (resolved) {
                        currentPathRef.current = potentialPath;
                    } else {
                        term.writeln(`cd: no such file or directory: ${target}`);
                    }
                }
                break;
            case "mkdir":
                const dirName = args[0];
                if (dirName && setFiles) {
                    if (currentPathRef.current === "/") {
                        const newItem: FileSystemItem = {
                            id: Math.random().toString(36).substr(2, 9),
                            name: dirName,
                            type: 'folder',
                            children: [],
                            isOpen: true
                        };
                        setFiles([...files, newItem]);
                    } else {
                        term.writeln("mkdir: currently only supported at root level in this demo");
                    }
                }
                break;
            case "":
                break;
            default:
                if (socket) {
                    socket.emit("run:command", cmd);
                } else {
                    term.writeln(`command not found: ${command}`);
                }
                break;
        }
        term.write(`\n${currentPathRef.current === '/' ? '~' : currentPathRef.current} $ `);
    };

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
            rows: 10,
        });

        const fitAddon = new FitAddon();
        term.loadAddon(fitAddon);
        term.open(terminalRef.current);
        fitAddon.fit();

        term.writeln('Welcome to the Interview Terminal');
        term.write('~ $ ');

        term.onData((data: string) => {
            const code = data.charCodeAt(0);
            if (code === 13) { // Enter
                term.write('\r\n');
                handleCommand(userInputRef.current, term);
                userInputRef.current = "";
            } else if (code === 127) { // Backspace
                if (userInputRef.current.length > 0) {
                    userInputRef.current = userInputRef.current.slice(0, -1);
                    term.write('\b \b');
                }
            } else {
                userInputRef.current += data;
                term.write(data);
            }
        });

        if (socket) {
            socket.on("terminal:output", (data: string) => {
                term.write(data);
            });
        }

        xtermRef.current = term;

        const handleResize = () => {
            fitAddon.fit();
            if (socket) {
                const dims = fitAddon.proposeDimensions();
                if (dims) {
                    socket.emit("terminal:resize", dims);
                }
            }
        };
        window.addEventListener('resize', handleResize);
        setTimeout(handleResize, 100);

        return () => {
            term.dispose();
            window.removeEventListener('resize', handleResize);
            if (socket) {
                socket.off("terminal:output");
            }
        };
    }, [files]);

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
