import SMySQL from "./SMySQL";
import Student from "../models/Student";
import SLog, { LogType } from "./SLog";

export default class SStudent {
  /**
   * @param onNext
   */

  public static getAllStudents(onNext: (students: Student[]) => void) {
    const sql = "SELECT * FROM students";

    SMySQL.getConnection((connection) => {
      // Xử lý khi có lỗi trong quá trình truy vấn
      // Thực hiện truy vấn SQL
      connection?.query<any[]>(sql, [], (err, result) => {
        // Xử lý khi có lỗi trong quá trình truy vấn
        if (err) {
          SLog.log(
            LogType.Error,
            "get all students",
            "fail to get all students in database",
            err
          );
          // Gọi callback với mảng rỗng khi gặp lỗi
          onNext([]);
        }
        // khoi tao mang moi de luu
        const students: Student[] = result as Student[];

        onNext(students);
      });
    });
  }
}
