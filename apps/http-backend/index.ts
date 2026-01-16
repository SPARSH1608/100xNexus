import express, { type Request, type Response } from "express"
const app = express()
const PORT = 3001
import { router as AuthRouter } from "./routes/AuthRouter.js"
import { router as BatchRouter } from "./routes/BatchController.js"
import { AdminMiddleware, authMiddleware } from "./middleware/AuthMiddleware.js"
import { router as ContestRouter } from './routes/ContestController.js'
import { router as QuestionRouter } from './routes/QuestionController.js'
import { startContestLifeCycle } from "./jobs/ContestLifeCycle.js"
import cors from 'cors'
app.use(express.json())

app.use(cors())
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