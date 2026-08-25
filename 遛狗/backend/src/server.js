require('dotenv').config()
const app = require('./app')
const { initDb } = require('./config/db')

const PORT = process.env.PORT || 5000

async function start () {
  try {
    await initDb()
    app.listen(PORT, () => {
      console.log(`API server listening on port ${PORT}`)
    })
  } catch (error) {
    console.error('Failed to start server', error)
    process.exit(1)
  }
}

start()
