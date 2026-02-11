import express from "express"
import { createServer } from "http"
import { Server } from "socket.io"
import { router as AuthRouter } from "./routes/AuthRouter.js"
import { router as BatchRouter } from "./routes/BatchRouter.js"
import { AdminMiddleware, authMiddleware } from "./middleware/AuthMiddleware.js"
import { router as ContestRouter } from './routes/ContestRouter.js'
import { router as QuestionRouter } from './routes/QuestionRouter.js'
import { startContestLifeCycle } from "./jobs/ContestLifeCycle.js"
import { router as UserRouter } from './routes/UserRouter.js'
import { handleEditorEvents } from "./sockets/editorEvents.js" // Import
import { handleTerminalEvents } from "./sockets/terminalEvents.js" // Import
import { handleFileEvents } from "./sockets/fileEvents.js"

const app = express()
const httpServer = createServer(app)
const PORT = 3001

const io = new Server(httpServer, {
    cors: {
        origin: "*", 
        methods: ["GET", "POST"]
    }
})

io.on("connection", (socket) => {
    console.log("Client connected:", socket.id)
    handleEditorEvents(socket)
    handleTerminalEvents(socket)
    handleFileEvents(socket)

    socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id)
    })
})

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
        return;
    }
    next();
});

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
startContestLifeCycle()

httpServer.listen(PORT, () => {
    console.log(`server started at port ${PORT}`)
})