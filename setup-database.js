import dotenv from 'dotenv'
import resetDatabase from './server/config/reset.js'

// Load environment variables
dotenv.config({ path: './server/.env' })

console.log('Setting up database...')
console.log('Connecting to:', process.env.PGHOST)
await resetDatabase()
console.log('Database setup complete!')
process.exit(0)
