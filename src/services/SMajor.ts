import Major from "./../models/Major";
import SMySQL from "./SMySQL";

export default class SMajor {
  public static getAllMajors(onNext: (majors: Major[]) => void) {
    const sql = `SELECT  
        majors.id,  
        majors.vn_name, 
        majors.en_name, 
        majors.ja_name, 
        files.path AS file_path  
        FROM majors JOIN files ON majors.icon_id = files.id`;

    SMySQL.getConnection((connection) => {
      connection?.execute<any[]>(sql, (err, result) => {
        if (err) {
          onNext([]);
          return;
        }
        
        onNext(result);
      });
    });
  }
}
