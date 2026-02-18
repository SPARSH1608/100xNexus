import express from "express"
import { createServer } from "http"
import { Server } from "socket.io"
import cors from "cors"
import { router as AuthRouter } from "./routes/AuthRouter.js"
import { router as BatchRouter } from "./routes/BatchRouter.js"
import { AdminMiddleware, authMiddleware } from "./middleware/AuthMiddleware.js"
import { router as ContestRouter } from './routes/ContestRouter.js'
import { router as QuestionRouter } from './routes/QuestionRouter.js'
import { startContestLifeCycle } from "./jobs/ContestLifeCycle.js"
import { router as UserRouter } from './routes/UserRouter.js'
import { handleEditorEvents } from "./sockets/editorEvents.js" // Import
import { router as InterviewRouter } from "./routes/InterviewRouter.js"
import { handleTerminalEvents } from "./sockets/terminalEvents.js" // Import
import { handleFileEvents } from "./sockets/fileEvents.js"
import { handleInterviewEvents } from "./sockets/interviewEvents.js"

const app = express()
const httpServer = createServer(app)
const PORT = 3001

// Simple request logger
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

const io = new Server(httpServer, {
    cors: {
        origin: true, // Reflect origin
        methods: ["GET", "POST"],
        credentials: true
    }
})

io.on("connection", (socket) => {
    console.log("Client connected:", socket.id)
    handleEditorEvents(socket)
    handleTerminalEvents(socket)
    handleFileEvents(socket)
    handleInterviewEvents(socket)

    socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id)
    })
})

app.use(cors({
    origin: true, // Reflect requested origin
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
}));

app.use(express.json())
app.get('/health', (req, res) => {
    res.json({
        msg: "I am healthy"
    })
})
app.use('/auth', AuthRouter)

app.use(authMiddleware)
app.use('/user', UserRouter)
app.use('/batch', AdminMiddleware, BatchRouter)
app.use('/contest', ContestRouter)
app.use('/question', QuestionRouter)
app.use('/interview', InterviewRouter) // Use the router
startContestLifeCycle()

httpServer.listen(PORT, () => {
    console.log(`server started at port ${PORT}`)
})