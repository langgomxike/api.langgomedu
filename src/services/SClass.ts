import User from "../models/User";
import Class from "./../models/Class";
import SLog, { LogType } from "./SLog";
import SMySQL from "./SMySQL";
export default class SClass {
  public static getAllClasses(onNext: (classes: Class[]) => void) {}

  public static getClassById(
    id: number,
    onNext: (_class: Class | undefined) => void
  ) {}

  public static getClassesByKey(
    key: string,
    onNext: (classes: Class[]) => void
  ) {}

  public static getClassesLearning(
    user_id: string,
    onNext: (classes: Class[]) => void
  ) {
    const sql = `SELECT 
                JSON_OBJECT(
                      'id', classes.id ,
                      'title', classes.title ,
                      'description', classes.description,
                      'price', classes.price,
                      'class_creation_fee', classes.class_creation_fee,
                      'max_learners', classes.max_learners,
                      'started_at', classes.started_at,
                      'ended_at', classes.ended_at,
                      'created_at', classes.created_at,
                      'updated_at', classes.updated_at,
                      'address_1', classes.address_1,
                      'address_2', classes.address_2,
                      'address_3', classes.address_3,
                      'address_4', classes.address_4
                  ) AS class,
                  JSON_OBJECT(
                      'id', users.id,
                      'name', users.full_name,
                      'email', users.email,
                      'phone_number', users.phone_number
                  ) AS tutor,
                  JSON_OBJECT(
                      'id', majors.id,
                      'vn_name', majors.vn_name,
                      'en_name', majors.en_name,
                      'ja_name', majors.ja_name
                  ) AS major,
                  JSON_OBJECT(
                      'id', class_levels.id,
                      'vn_name', class_levels.vn_name,
                      'en_name', class_levels.en_name,
                      'ja_name', class_levels.ja_name
                  ) AS class_level
              FROM classes
              INNER JOIN users ON users.id = classes.tutor_id
              LEFT JOIN majors ON majors.id = classes.major_id
              LEFT JOIN class_levels ON class_levels.id = classes.class_level_id
              WHERE classes.tutor_id = ?;`;

    SMySQL.getConnection((connection) => {
      connection?.execute<any[]>(sql, [user_id], (err, rows) => {
        if (err) {
          onNext([]);
          return;
        }

        const classes: Class[] = [];
        rows.forEach((row) => {
          const tutor = row.tutor;
            const major = row.major;
            const class_level = row.class_level;

          const _class = new Class(
            row.class.id,
            row.class.title,
            row.class.description,
            major,
            tutor,
            undefined,
            row.class.price,
            row.class.class_creation_fee,
            class_level,
            row.class.max_learners,
            row.class.started_at,
            row.class.ended_at,
            row.class.created_at,
            row.class.updated_at,
            row.class.address_1,
            row.class.address_2,
            row.class.address_3,
            row.class.address_4
          );
          classes.push(_class);
        });

        // SLog.log(
        //   LogType.Info,
        //   "getAttendingClasses",
        //   "get Attending Classes",
        //   rows
        // );

        return onNext(classes);
      });
    });
  }

  public static storeClass(
    _class: Class,
    onNext: (id: number | undefined) => void
  ) {}

  public static updateClass(_class: Class, onNext: (result: boolean) => void) {
    // let sql = "UPDATE `classes` SET ";
    // const updateCols: string[] = [];
    // const updateValues: Array<string | number> = [];
    // if (_class.title) {
    //     updateCols.push("`title`=?");
    //     updateValues.push(_class.title);
    // }
    // if (_class.description) {
    //     updateCols.push("`description`=?");
    //     updateValues.push(_class.description);
    // }
    // if (_class.major?.id) {
    //     updateCols.push("`major_id`=?");
    //     updateValues.push(_class.major.id);
    // }
    // if (_class.tutor?.id) {
    //     updateCols.push("`tutor_id`=?");
    //     updateValues.push(_class.tutor.id);
    // }
    // if (_class.price) {
    //     updateCols.push("`price`=?");
    //     updateValues.push(_class.price);
    // }
    // if (_class.classCreationFee) {
    //     updateCols.push("`class_creation_fee`=?");
    //     updateValues.push(_class.classCreationFee);
    // }
    // if (_class.classLevel?.id) {
    //     updateCols.push("`class_level_id`=?");
    //     updateValues.push(_class.classLevel.id);
    // }
    // if (_class.maxLearners) {
    //     updateCols.push("`max_learners`=?");
    //     updateValues.push(_class.maxLearners);
    // }
    // if (_class.startedAt) {
    //     updateCols.push("`started_at`=?");
    //     updateValues.push(_class.startedAt.getTime());
    // }
    // if (_class.endedAt) {
    //     updateCols.push("`ended_at`=?");
    //     updateValues.push(_class.endedAt.getTime());
    // }
    // if (_class.address1) {
    //     updateCols.push("`address_1`=?");
    //     updateValues.push(_class.address1);
    // }
    // if (_class.address2) {
    //     updateCols.push("`address_2`=?");
    //     updateValues.push(_class.address2);
    // }
    // if (_class.address3) {
    //     updateCols.push("`address_3`=?");
    //     updateValues.push(_class.address3);
    // }
    // if (_class.address4) {
    //     updateCols.push("`address_4`=?");
    //     updateValues.push(_class.address4);
    // }
    // sql += updateCols.map(col => col + ", ").join(" ");
    // sql += " `updated_at`=? WHERE id = ?";
    // SMySQL.getConnection(connection => {
    //     connection?.execute(sql, [...updateValues, new Date().getTime(), _class.id], error => {
    //         if (error) {
    //             onNext(false);
    //             SLog.log(LogType.Error, "updateClass", "Cannot update class", error);
    //             return;
    //         }
    //         onNext(true);
    //         return;
    //     });
    // });
  }

  public static softDeleteClass(
    _class: Class,
    onNext: (result: boolean) => void
  ) {}
}
