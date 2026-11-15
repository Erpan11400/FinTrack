import 'dotenv/config'
import connectDB from './src/config/database.js'
import app from './src/app.js'

const HOST = process.env.HOST || 'localhost'
const PORT = process.env.PORT || 3000

connectDB().then(() => {
  app.listen(PORT, HOST, () => {
    console.log(`Server running at http://${HOST}:${PORT}/api/v1`)
  })
})