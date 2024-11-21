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
    const sql = "SELECT * FROM majors";

        SMySQL.getConnection((connection) => {
            connection?.query<any[]>(sql, [], (err, result) => {
                // kiem tra xem co err khong
                if (err) {
                    SLog.log(
                        LogType.Error,
                        "get all majors",
                        "fail to get all majors in database",
                        err
                    );
                    onNext([]);
                    return;
                }

                // khoi tao mang moi de luu
                const majors: Major[] = result;
                onNext(majors);
            });
        });
  }
}
