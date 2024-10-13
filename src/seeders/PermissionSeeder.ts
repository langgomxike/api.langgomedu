import SMySQL from "../services/SMySQL";
import permissions from "../datas/permissions.json";
import SLog, { LogType } from "../services/SLog";

export default class PermissionSeeder {
    public static seedAllPermissions() {
        this.dropAllPermissions(result => {
            if (!result) {
                SLog.log(LogType.Error, "dropAllPermissions", "cannot seed all permissions");
            } else {
                this.insertAllPermissions();
            }
        })
    }

    private static dropAllPermissions(onNext: (result: boolean) => void) {
        const sql = "TRUNCATE TABLE permissions";

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

    private static insertAllPermissions() {
        const sql = "INSERT INTO permissions VALUES (?, ?)";
        SMySQL.getConnection(connection => {
            permissions.forEach(permission => {
                connection?.execute(sql, [permission.id, permission.permission]);
            });
        });
    }
}