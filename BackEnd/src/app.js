import express from 'express'
import appRouter from './routes/appRouter.js'
import ErrorHandler from './middlewares/errorHandler.js'

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/api/v1', appRouter)
app.use(ErrorHandler)

export default app