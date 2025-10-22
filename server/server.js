import express from 'express'
import path from 'path'
import favicon from 'serve-favicon'
import dotenv from 'dotenv'
import cors from 'cors'
import fs from 'fs'

// import the router from your routes file
import carsRouter from './routes/cars.js'
import featuresRouter from './routes/features.js'

dotenv.config()

const PORT = process.env.PORT || 3000

const app = express()

// Enable CORS for all routes
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176'], // Allow Vite default ports
    credentials: true
}))

app.use(express.json())

if (process.env.NODE_ENV === 'development') {
    app.use(favicon(path.resolve('../', 'client', 'public', 'lightning.png')))
    // Serve static assets from client public directory in development
    const assetsPath = path.resolve(process.cwd(), 'client', 'public', 'assets')
    console.log('Serving assets from:', assetsPath)
    console.log('Directory exists:', fs.existsSync(assetsPath))
    app.use('/assets', express.static(assetsPath, {
        index: false,
        dotfiles: 'ignore'
    }))
}
else if (process.env.NODE_ENV === 'production') {
    app.use(favicon(path.resolve('public', 'lightning.png')))
    app.use(express.static('public'))
}

// specify the api path for the server to use
app.use('/api/cars', carsRouter)
app.use('/api/features', featuresRouter)


if (process.env.NODE_ENV === 'production') {
    app.get('/*', (_, res) =>
        res.sendFile(path.resolve('public', 'index.html'))
    )
}

app.listen(PORT, () => {
    console.log(`server listening on http://localhost:${PORT}`)
})