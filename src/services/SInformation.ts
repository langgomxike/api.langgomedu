import Information from "../models/Information";
import SMySQL from "./SMySQL";
import SLog, {LogType} from "./SLog";

export default class SInformation {
    public static storeInformation(userId: string, info: Information, onNext: (result: boolean) => void) {
        const sql = "INSERT INTO informations (user_id, hometown, address_1, address_2, address_3, address_4, birthday, gender_id) VALUES (?,?,?,?,?,?,?, ?)";

        SMySQL.getConnection(connection => {
            connection?.execute(sql, [userId, info.hometown, info.address_1, info.address_2, info.address_3, info.address_4 ?? "", info.birthday, info.gender?.id], (err, result) => {
                if (err) {
                    SLog.log(LogType.Error, "storeInformation", "storeInformation unsuccessfully", err);
                    onNext(false);
                    return;
                }
                onNext(true);
            });
        });
    }

    public static updateInformation(info: Information, onNext: (result: boolean) => void) {
        let sql = "UPDATE informations SET ";
        const values = [];

        if (info.hometown) {
            sql += "hometown=?,";
            values.push(info.hometown);
        }

        if (info.address_1) {
            sql += "address_1=?,";
            values.push(info.address_1);
        }

        if (info.address_2) {
            sql += "address_2=?,";
            values.push(info.address_2);
        }

        if (info.address_3) {
            sql += "address_3=?,";
            values.push(info.address_3);
        }

        if (info.address_4) {
            sql += "address_4=?,";
            values.push(info.address_4);
        }

        if (info.birthday) {
            sql += "birthday=?,";
            values.push(info.birthday);
        }

        if (info.gender?.id) {
            sql += "gender_id=?,";
            values.push(info.gender?.id);
        }

        sql += " user_id = ? WHERE user_id=?"

        SMySQL.getConnection(connection => {
            connection?.execute(sql, [...values, info.user?.id ?? -1, info.user?.id ?? -1], (err, result) => {
                if (err) {
                    SLog.log(LogType.Error, "updateInformation", "updateInformation unsuccessfully", err);
                    onNext(false);
                    return;
                }
                onNext(true);
            });
        });
    }
}