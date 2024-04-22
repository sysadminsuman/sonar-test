import mysql from "mysql";
import { envs } from "./index.js";

export const mysqlConnection = mysql.createPool({
  connectionLimit: 10,
  host: envs.db.host,
  user: envs.db.username,
  password: envs.db.password,
  database: envs.db.database,
  charset: "utf8mb4",
  multipleStatements: true,
});

export const mysqlConnectionReader = mysql.createPool({
  connectionLimit: 10,
  host: envs.db1.host,
  user: envs.db1.username,
  password: envs.db1.password,
  database: envs.db1.database,
  charset: "utf8mb4",
  multipleStatements: true,
});
export const mysqlConnectionWriter = mysql.createPool({
  connectionLimit: 10,
  host: envs.db2.host,
  user: envs.db2.username,
  password: envs.db2.password,
  database: envs.db2.database,
  charset: "utf8mb4",
  multipleStatements: true,
});

export const connect = () => {
  mysqlConnection.getConnection((err, connection) => {
    if (err) {
      if (err.code === "PROTOCOL_CONNECTION_LOST") {
        console.error("Database connection was closed.");
      }
      if (err.code === "ER_CON_COUNT_ERROR") {
        console.error("Database has too many connections.");
      }
      if (err.code === "ECONNREFUSED") {
        console.error("Database connection was refused.");
      }
    }
    if (connection) connection.release();
    console.log("MYSQL(Write) Connection Established Successfully");
    return;
  });
};

export const connectReader = () => {
  mysqlConnectionReader.getConnection((err, connection) => {
    if (err) {
      if (err.code === "PROTOCOL_CONNECTION_LOST") {
        console.error("Database connection was closed.");
      }
      if (err.code === "ER_CON_COUNT_ERROR") {
        console.error("Database has too many connections.");
      }
      if (err.code === "ECONNREFUSED") {
        console.error("Database connection was refused.");
      }
    }
    if (connection) connection.release();
    console.log("MYSQL(Read) Connection Established Successfully");
    return;
  });
};

export const connectWriter = () => {
  mysqlConnectionWriter.getConnection((err, connection) => {
    if (err) {
      if (err.code === "PROTOCOL_CONNECTION_LOST") {
        console.error("Database connection was closed.");
      }
      if (err.code === "ER_CON_COUNT_ERROR") {
        console.error("Database has too many connections.");
      }
      if (err.code === "ECONNREFUSED") {
        console.error("Database connection was refused.");
      }
    }
    if (connection) connection.release();
    console.log("MYSQL(Write) Connection Established Successfully");
    return;
  });
};
