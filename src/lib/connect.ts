import mysql, { Connection } from 'mysql2/promise';

let connection: Connection;

export async function onConnection(fn: (conn: Connection) => Promise<any>) {
  if (!connection) {
    connection = await mysql.createConnection({
      host: process.env.MYSQL_DB_HOST,
      port: Number(process.env.MYSQL_DB_PORT),
      user: process.env.MYSQL_DB_USER,
      password: process.env.MYSQL_DB_PASSWORD,
      database: process.env.MYSQL_DB_NAME,
    });
  }
  return fn(connection);
}
