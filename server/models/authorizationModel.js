//import db connection
import db from '../config/database.js'

// Get user by email
export const getUser = (email, result) => {
    db.query(
        'SELECT * FROM administrator WHERE administratorEmail = ?',
        [email], // Only use email as a parameter
        (err, results) => {
            if (err) {
                console.log(err)
                result(err, null)
            } else {
                result(null, results)
            }
        },
    )
}
