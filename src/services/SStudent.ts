import SMySQL from "./SMySQL";
import SLog, { LogType } from "./SLog";
import User from "../models/User";
import { error } from "console";

export default class SStudent {
    /**
   * @param onNext
   */

  public static getAllStudents(onNext: (students: User[]) => void) {
    const sql = "SELECT * FROM users";

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
        const students: User[] = result as User[];

        onNext(students);
      });
    });
  }
    public static getStudentByUserId(userId: string, onNext: (students: User[]) => void){
        const sql = `SELECT * FROM users WHERE users.parent_id = ?;
`;

        SMySQL.getConnection((connection) => {
            connection?.execute<any[]>(sql, [userId] ,(err, results) => {
                if (err) {
                    return;
                }

                const students:User[] = results;

                onNext(students);
            })

        })
    }

    public static getStudentsInClass(classId: number, onNext: (students: User[]) => void){
        const sql = `SELECT users.*
            FROM users
            LEFT JOIN class_members cm ON cm.user_id = users.id
            WHERE cm.class_id = ?;
        `;

        SMySQL.getConnection((connection) => {
            connection?.execute<any[]>(sql, [classId] ,(err, results) => {
                if (err) {
                    console.log("Error getStudentsInClass", err);
                    return;
                }

                const students:User[] = results;
                onNext(students);
            })

        })
    }
}
