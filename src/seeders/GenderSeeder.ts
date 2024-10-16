import SMySQL from "../services/SMySQL";
import genders from "../datas/genders.json";
import SLog, { LogType } from "../services/SLog";

export default class GenderSeeder {
    public static seedAllGenders() {
        this.dropAllGenders(result => {
            if (!result) {
                SLog.log(LogType.Error, "dropAllGenders", "cannot seed all genders");
            } else {
                this.insertAllGenders();
            }
        })
    }

    private static dropAllGenders(onNext: (result: boolean) => void) {
        const sql = "TRUNCATE TABLE genders";

        SMySQL.getConnection(connection => {
            connection?.execute(sql, (error) => {
                if (error) {
                    onNext(false);
                    return;
                }

                onNext(true);
            });
        });
    }

    private static insertAllGenders() {
        const sql = "INSERT INTO genders VALUES (?, ?, ?, ?)";
        SMySQL.getConnection(connection => {
            genders.forEach(gender => {
                connection?.execute(sql, [gender.id, gender.vn_gender, gender.en_gender, gender.ja_gender]);
            });
        });
    }
}