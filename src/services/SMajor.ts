import File from "../models/File";
import Major from "./../models/Major";
import SLog, { LogType } from "./SLog";
import SMySQL from "./SMySQL";

export default class SMajor {
  public static getAllMajors(onNext: (majors: Major[]) => void) {
    const sql = `SELECT * FROM majors`;

    SMySQL.getConnection((connection) => {
      connection?.execute<any[]>(sql, (err, result) => {
        if (err) {
          onNext([]);
          return;
        }
        
        const majors:Major[] = result;

        onNext(majors);
      });
    });
  }
}
