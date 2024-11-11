import ClassLevel from "../models/ClassLevel";
import SLog, {LogType} from "./SLog";
import SMySQL from "./SMySQL";
import SFirebase, {FirebaseNode} from "./SFirebase";

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
                    return;
                }

                // khoi tao mang moi de luu
                const classLevels: ClassLevel[] = result;
                onNext(classLevels);
            });
        });
    }

    public static storeClassLevel(level: ClassLevel, onNext: (result: boolean) => void) {
        const sql = "INSERT INTO class_levels (vn_name, en_name, ja_name) VALUES (?,?,?)";

        SMySQL.getConnection((connection) => {
            connection?.query(sql, [level.vn_name, level.en_name, level.jp_name], (err, result) => {
                if (err) {
                    SLog.log(
                        LogType.Error,
                        "store class level",
                        "fail to store class level in database",
                        err
                    );
                    onNext(false);
                    return;
                }

                SLog.log(
                    LogType.Error,
                    "store class level",
                    "success to store class level in database"
                );

                SFirebase.push(FirebaseNode.CLASS_LEVEL, (result as any)?.insertId, () => {
                    onNext(true);
                });
            });
        });
    }

    public static updateClassLevel(level: ClassLevel, onNext: (result: boolean) => void) {
        let sql = "UPDATE class_levels SET ";
        const values = [];

        if (level.vn_name) {
            sql += " vn_name =?,";
            values.push(level.vn_name);
        }

        if (level.en_name) {
            sql += " en_name =?,";
            values.push(level.en_name);
        }

        if (level.jp_name) {
            sql += " ja_name =?,";
            values.push(level.jp_name);
        }

        sql += " id = id WHERE id = ?";

        SMySQL.getConnection((connection) => {
            connection?.query(sql, [...values, level.id, level.id], (err, result) => {
                if (err) {
                    SLog.log(
                        LogType.Error,
                        "update class level",
                        "fail to update class level in database",
                        err
                    );
                    onNext(false);
                    return;
                }

                SLog.log(
                    LogType.Error,
                    "update class level",
                    "success to update class level in database"
                );

                SFirebase.push(FirebaseNode.CLASS_LEVEL, level.id, () => {
                    onNext(true);
                });
            });
        });
    }

    public static deleteClasslevel(level: ClassLevel, onNext: (result: boolean) => void) {
        const sql = "DELETE FROM class_levels WHERE id =?";

        SMySQL.getConnection((connection) => {
            connection?.query(sql, [level.id], (err, result) => {
                if (err) {
                    SLog.log(
                        LogType.Error,
                        "delete class level",
                        "fail to delete class level in database",
                        err
                    );
                    onNext(false);
                    return;
                }

                SLog.log(
                    LogType.Error,
                    "delete class level",
                    "success to delete class level in database"
                );

                SFirebase.delete(FirebaseNode.CLASS_LEVEL, level.id, () => {
                    onNext(true);
                });
            });
        });
    }
}
