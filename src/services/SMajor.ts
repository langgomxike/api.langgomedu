import File from "../models/File";
import Major from "./../models/Major";
import SLog, { LogType } from "./SLog";
import SMySQL from "./SMySQL";

export default class SMajor {
  // public static getAllMajors(onNext: (majors: Major[]) => void) {
  //   const sql = `SELECT *, majors.id as id
  //       FROM majors JOIN files ON majors.icon_id = files.id`;

  //   SMySQL.getConnection((connection) => {
  //     connection?.execute<any[]>(sql, (err, result) => {
  //       if (err) {
  //         onNext([]);
  //         return;
  //       }
        
  //       const majors:Major[] = [];
  //       result.forEach((row) => {
  //         const file = new File(row.icon_id, row.name, row.path, row.capacity, row.image_width, row.image_height, row.created_at,row.updated_at )
  //         const major = new Major(row.id,row.vn_name, row.jaName, row.en_name, file);
  //         majors.push(major);
  //       });

  //       onNext(majors);
  //     });
  //   });
  // }

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

  // CREATE MAJORS
  public static createMajor(
    vn_name: string,
    ja_name: string,
    en_name: string,
    icon: string,
    onNext: (result: boolean) => void
  ) {
    const majorSql = `INSERT INTO majors (vn_name, en_name, ja_name, icon) VALUES (?,?,?,?)`;
  
    SMySQL.getConnection((connection) => {
      if (!connection) {
        console.error("Không thể kết nối database.");
        onNext(false);
        return;
      }
  
      connection.beginTransaction((transactionErr) => {
        if (transactionErr) {
          console.error("Lỗi khi bắt đầu transaction:", transactionErr);
          onNext(false);
          return;
        }
  
        connection.execute(
          majorSql,
          [vn_name, ja_name, en_name, icon],
          (majorErr, majorResult) => {
            if (majorErr) {
              console.error("Lỗi khi thêm major:", majorErr);
              connection.rollback(() => {
                onNext(false);
              });
              return;
            }
  
            connection.commit((commitErr) => {
              if (commitErr) {
                console.error("Lỗi khi commit transaction:", commitErr);
                connection.rollback(() => {
                  onNext(false);
                });
                return;
              }
  
              // Thành công
              console.log("Major được thêm thành công:", majorResult);
              onNext(true);
            });
          }
        );
      });
    });
  }
  
}
