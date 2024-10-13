import SMySQL from "../services/SMySQL";
import roles from "../datas/roles.json";
import SLog, { LogType } from "../services/SLog";

export default class RoleSeeder {
    public static seedAllRoles() {
        this.dropAllRoles(result => {
            if (!result) {
                SLog.log(LogType.Error, "dropAllRoles", "cannot seed all roles");
            } else {
                this.insertAllRoles();
            }
        })
    }

    private static dropAllRoles(onNext: (result: boolean) => void) {
        const sql = "TRUNCATE TABLE roles";

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

    private static insertAllRoles() {
        const sql = "INSERT INTO roles VALUES (?, ?)";
        SMySQL.getConnection(connection => {
            roles.forEach(role => {
                connection?.execute(sql, [role.id, role.name]);
            });
        });
    }
}