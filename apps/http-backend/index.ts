import express, { type Request, type Response } from "express"
const app = express()
const PORT = 3001
import { router as AuthRouter } from "./routes/AuthRouter.js"
import { router as BatchRouter } from "./routes/BatchRouter.js"
import { AdminMiddleware, authMiddleware } from "./middleware/AuthMiddleware.js"
import { router as ContestRouter } from './routes/ContestRouter.js'
import { router as QuestionRouter } from './routes/QuestionRouter.js'
import { startContestLifeCycle } from "./jobs/ContestLifeCycle.js"
import cors from 'cors'
app.use(express.json())

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
}))
app.use('/auth', AuthRouter)
import { router as UserRouter } from './routes/UserRouter.js'

app.use(authMiddleware)
app.use('/user', UserRouter)
app.use('/batch', AdminMiddleware, BatchRouter)
app.use('/contest', ContestRouter)
app.use('/question', QuestionRouter)
startContestLifeCycle()
app.listen(PORT, () => {
    console.log(`server started at port ${PORT}`)
})