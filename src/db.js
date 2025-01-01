//  db.js
import mysql from 'mysql2';
// import { mysql } from 'mysql2';

async function createAndConnectDB() {
    return new Promise((resolve, reject) => {
        // Create connection to db
        const connection = mysql.createConnection({
            host: 'localhost',
            user: 'user',
            password: 'pass',
            database: 'chat_room'
        });

        // Connect to the DB
        connection.connect((err) => {
            if (err) {
                reject(err);
            }
            resolve(connection);
        });
    });
}


// Export connection object to be used in server.js
export default createAndConnectDB;
