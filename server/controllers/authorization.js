import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { getUser } from '../models/authorizationModel.js'
import dotenv from 'dotenv'

dotenv.config()

const JWT_SECRET = process.env.JWT_SECRET

export const login = (req, res) => {
    const { email, password } = req.body

    getUser(email, (err, results) => {
        if (err) {
            res.status(500).send(err)
        } else if (results.length === 1) {
            const user = results[0]

            bcrypt.compare(password, user.administratorPassword, (err, isMatch) => {
                if (err) {
                    console.error('Error during bcrypt.compare:', err)
                    res.status(500).send(err)
                } else if (isMatch) {
                    // Generate a JWT token
                    const token = jwt.sign(
                        { id: user.administratorID, email: user.administratorEmail },
                        JWT_SECRET,
                        { expiresIn: '1h' },
                    )

                    // Exclude the hashed password from the user object
                    const { administratorPassword, ...userWithoutPassword } = user

                    // Return the token and sanitized user info
                    res.json({ message: 'Login successful', token, user: userWithoutPassword })
                } else {
                    console.log('Password comparison failed')
                    res.status(401).json({ message: 'Invalid email or password' })
                }
            })
        } else {
            res.status(401).json({ message: 'Invalid email or password' })
        }
    })
}
