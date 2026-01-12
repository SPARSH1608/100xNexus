import express,{type Request,type Response} from "express"
const app = express()
const PORT = 3000
import { router as AuthRouter } from "./routes/AuthRouter.js"
import { router as BatchRouter } from "./routes/BatchController.js"
import { AdminMiddleware, authMiddleware } from "./middleware/AuthMiddleware.js"
import {router as ContestRouter} from './routes/ContestController.js'
import {router as QuestionRouter} from './routes/QuestionController.js'
app.use(express.json())


app.use('/auth',AuthRouter)

app.use(authMiddleware)
app.use('/batch',AdminMiddleware,BatchRouter)
app.use('/contest',ContestRouter)
app.use('/question',QuestionRouter)
app.listen(PORT, () => {
    console.log(`server started at port ${PORT}`)
})