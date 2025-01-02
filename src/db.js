//  db.js
import mysql from 'mysql2/promise';
// import { mysql } from 'mysql2';

let pool;
export async function createAndConnectDB() {
    if (!pool) {
        pool = mysql.createPool({
            host: 'localhost',
            user: 'user',
            password: 'pass',
            database: 'chat_room',
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });
    }

    try {
        // Test the connection
        const connection = await pool.getConnection();
        console.log("Database connected successfully");
        connection.release(); // Release the connection after testing
    } catch (error) {
        console.error("Error connecting to the database", error);
        throw error;
    }
}

// Function to show all rows from a table
export async function selectAllRows() {
    const sql = 'SELECT * FROM users'; // Adjust this table name as needed
    try {
        const [rows] = await pool.query(sql);
        return rows; // returns all rows in the users table
    } catch (error) {
        console.error('Error fetching rows', error);
        throw error;
    }
}


export async function addUser(email, username, password) {
    const sql = 'INSERT INTO users (email, username, password) VALUES (?, ?, ?)'; // Adjust this table name as needed
    try {
        const [result] = await pool.query(sql, [email, username, password]);
        console.log('User added successfully:', result);    
        return result; // returns all rows in the users table
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            // Duplicate entry error (e.g., username already exists)
            throw { statusCode: 409, message: 'Username already exists' };
        }
        console.error('Error adding user:', error);
        // throw error;
    }
}


// Check to see if user login is correct
export async function userLookUp(username, password) {
    const sql = 'SELECT password from users WHERE username = ?'
    try {
        const [result] = await pool.query(sql, [username]);
        console.log(result);


        if (result.length === 0) {
            console.log("User not found");
            return false;
        }

        const storedPassword = result[0].password;

        if (storedPassword === password) {
            console.log("User matched");
            return true;
        } else {
            console.log("Incorrect password");
            return false;
        }
    } catch (error) {
        console.error('Error doing lookup', error);
    }
}

// Export connection object to be used in server.js
// export default createAndConnectDB;

