import express, { type Request, type Response } from "express"
const app = express()
const PORT = 3001
import { router as AuthRouter } from "./routes/AuthRouter.js"
import { router as BatchRouter } from "./routes/BatchRouter.js"
import { AdminMiddleware, authMiddleware } from "./middleware/AuthMiddleware.js"
import { router as ContestRouter } from './routes/ContestRouter.js'
import { router as QuestionRouter } from './routes/QuestionRouter.js'
import { startContestLifeCycle } from "./jobs/ContestLifeCycle.js"
import { router as UserRouter } from './routes/UserRouter.js'
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
app.listen(PORT, () => {
    console.log(`server started at port ${PORT}`)
})