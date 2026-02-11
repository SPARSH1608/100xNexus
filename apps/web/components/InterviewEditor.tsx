
"use client";

import { useEffect, useState, useRef } from "react";
import Editor, { OnMount } from "@monaco-editor/react";
import { io, Socket } from "socket.io-client";

interface InterviewEditorProps {
    code: string;
    onChange: (value: string | undefined) => void;
    language?: string;
}

export default function InterviewEditor({ code, onChange, language = "javascript" }: InterviewEditorProps) {
    const editorRef = useRef<any>(null);

    const handleMount: OnMount = (editor) => {
        editorRef.current = editor;
    };

    return (
        <div className="h-full w-full">
            <Editor
                height="100%"
                language={language}
                value={code}
                theme="vs-dark"
                onChange={onChange}
                onMount={handleMount}
                options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    wordWrap: "on",
                    scrollBeyondLastLine: false,
                }}
            />
        </div>
    );
}
