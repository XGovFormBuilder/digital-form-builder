import mysql from "mysql";
import { promisify } from "util";

export function promisifyMysql(connection: mysql.Connection) {
  return {
    query(sql, values) {
      return promisify(connection.query).call(connection, { sql, values });
    },
    close() {
      return promisify(connection.end).call(connection);
    },
  };
}
