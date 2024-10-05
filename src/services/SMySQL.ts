import * as mysql from "mysql2";
import dotenv from "dotenv";
import { Connection } from "mysql2";
import SLog, { LogType } from "./SLog";
import e from "express";

export default class SMySQL {
  private static connection: Connection;

  private static init() {
    if (!this.connection) {
      dotenv.config();
      const port: number = +(process.env.MYSQL_PORT || 3306);
      const user = process.env.MYSQL_USER || "root";
      const password = process.env.MYSQL_PASSWORD || "";
      const database = process.env.MYSQL_DATABASE || "api_langgomedu";

      this.connection = mysql.createConnection({
        port: port,
        user: user,
        password: password,
        database: database,
      });
    }
  }

  public static connect(
    onSuccess: () => void = () => {},
    onFailure: () => void = () => {},
    onComlete: () => void = () => {}
  ) {
    this.init();
    this.connection.connect((err) => {
      if (!err) {
        onSuccess();
        onComlete();

        SLog.log(LogType.Infor, "connect", "connected to mysql");
      } else {
        onFailure();
        onComlete();

        SLog.log(LogType.Infor, "connect", "can not connect to mysql", err);
      }
    });
  }
}