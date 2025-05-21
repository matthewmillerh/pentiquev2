import mysql from 'mysql2'
import dotenv from 'dotenv'

dotenv.config()

const host = process.env.DB_URL
const userName = process.env.DB_USERNAME
const password = process.env.DB_PASSWORD
const database = process.env.DB_NAME

const db = mysql.createConnection({
    host: host,
    user: userName,
    password: password,
    database: database,
})

export default db
