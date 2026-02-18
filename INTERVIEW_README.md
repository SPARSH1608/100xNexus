# AI Interviewer - System Architecture & Flow

This document provides a detailed overview of the AI Interviewer system, explaining how the frontend, backend, and sandboxed environments interact to provide a seamless technical assessment experience.

## Architecture Overview

The system is built as a monorepo with the following core components:

- **Frontend (`apps/web`)**: A Next.js application providing the interview room UI (Editor, Terminal, File Explorer, and AI Chat).
- **Backend (`apps/http-backend`)**: An Express server running on Bun, handling REST APIs and real-time Socket.IO communication.
- **Database (`packages/db`)**: Prisma ORM with PostgreSQL (or MySQL) storing interview sessions, chat history, and user activity events.
- **Sandbox (`E2B`)**: Secure, isolated cloud environments where candidate code is executed in real-time.

---

##  Complete Interview Flow

### 1. Creation & Scheduling
An interview session is initiated by an administrator or a system event.
- **API**: `POST /interview`
- **Action**: A record is created in the `Interview` table with a `studentId`, `topic`, and `description`.
- **Status**: Set to `PENDING` until the candidate joins.

### 2. Candidate Entry
When a candidate navigates to `/interview/[id]`:
- **Auth**: The frontend validates the user's token.
- **Socket Connection**: A Socket.IO connection is established.
- **Room Join**: The candidate emits `terminal:join` and `chat:join` with the `interviewId`.

### 3. Session Initialization (Backend)
Upon joining:
- **Sandbox Creation**: The backend checks if an E2B Sandbox exists for this `interviewId`. If not, it provisions a new one.
- **PTY Setup**: A pseudo-terminal (PTY) is created inside the sandbox.
- **History Retrieval**: Previous chat messages are fetched from the `InterviewMessage` table and sent to the client via `chat:history`.

### 4. Active Interview Phase
As the candidate works, every action is synchronized and logged:

#### A. Coding (The Editor)
- User types in the Monaco Editor.
- Frontend emits `editor:event` on every change.
- Backend logs this content to the `InterviewEvent` table (type: `editor_update`).

#### B. Execution (The Terminal)
- User runs commands (e.g., `npm test`, `node index.js`).
- Frontend emits `terminal:command`.
- Backend logs the command to `InterviewEvent` (type: `terminal_command`) and pipes it to the E2B Sandbox.
- Sandbox output is streamed back to the frontend via `terminal:output`.

#### C. File Management (The File Tree)
- User creates, renames, or moves files in the sidebar.
- Frontend emits `file:created`, `file:renamed`, etc.
- Backend logs these to `InterviewEvent`.

### 5. AI Interaction & Context Awareness
This is where the "AI" part happens.
- **User Input**: Candidate asks a question or responds to the AI in the chat.
- **Context Gathering**: The backend fetches the latest **50 events** from the `InterviewEvent` table.
- **Context Construction**: The AI is provided with a summary of:
    - Recent terminal commands.
    - Recent file system changes.
    - The current state of the code in the editor.
- **Response Generation**: The AI generates a context-aware response (e.g., *"I see your test just failed with a syntax error in index.js, would you like to debug that first?"*).

---

## Data Models

### `Interview`
The core session record.

### `InterviewMessage`
Stores the chat transcript (roles: `user`, `ai`).

### `InterviewEvent`
A chronological log of all technical actions taken by the candidate.
Types: `terminal_command`, `editor_update`, `file_create`, `file_delete`, `file_move`, `file_rename`.

---

##  Backend Monitoring (Logging)
The backend provides standardized console logs for real-time monitoring of sessions:
- `[Interview: id] Chat Message: ...`
- `[Interview: id] Terminal Command: ...`
- `[Interview: id] Editor Updated (Length: N)`
- `[Interview: id] File Created: name`
