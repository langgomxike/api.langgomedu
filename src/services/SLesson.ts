import Lesson from "../models/Lesson";
import SLog, { LogType } from "./SLog";
import SMySQL from "./SMySQL";

export default class SLesson {
  /**
   * viết thêm 1 api để lưu danh sách buổi học
   */

  /**
   * @param onNext
   */

  public static createLesson(
    day: number,
    started_at: number,
    duration: number,
    is_online: boolean,
    onNext: (result: boolean, insertId?: number) => void
  ) {
    const sql =
      "INSERT INTO lessons(day, started_at, duration, is_online) VALUES (?,?,?,?)";
    SMySQL.getConnection((connection) => {
      connection?.query(sql, [day, started_at, duration, is_online], (err, result) => {
        if (err) {
          // Xử lý khi có lỗi
          SLog.log(
            LogType.Error,
            "addNewLesson",
            "Failed to insert new class",
            err
          );
          onNext(false);
        }
        const insertId = (result as any).insertId || undefined;
        onNext(true, insertId);
      });
    });
  }
}
