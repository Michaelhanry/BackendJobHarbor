import mysql from 'mysql2';

const db = mysql.createConnection({
  host: '34.101.110.63',
  user: 'root',
  password: 'loginapi123',
  database: 'login_api',
});

export default db;
