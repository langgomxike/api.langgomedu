import ClassLevel from "../models/ClassLevel";
import SLog, { LogType } from "./SLog";
import SMySQL from "./SMySQL";

export default class SClassLevel {
  /**
   * @param
   */

  public static getAllClassLevels(onNext: (classLevel: ClassLevel[]) => void) {
    const sql = "SELECT * FROM class_levels";

    SMySQL.getConnection((connection) => {
      connection?.query<any[]>(sql, [], (err, result) => {
        // kiem tra xem co err khong
        if (err) {
          SLog.log(
            LogType.Error,
            "get all class levels",
            "fail to get all cv in database",
            err
          );
          onNext([]);
        }

        // khoi tao mang moi de luu
        const classLevels: ClassLevel[] = result as ClassLevel[];

        onNext(classLevels);
      });
    });
  }
}
