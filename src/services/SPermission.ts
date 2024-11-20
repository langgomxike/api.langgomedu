import { RowDataPacket } from "mysql2";
import Permission from "../models/Permission";
import SMySQL from "./SMySQL";
import SLog, {LogType} from "./SLog";

export default class SPermission {

    public static getAllPermissions(onNext: (permissions: Permission[]) => void) {
        const sql = `SELECT * FROM permissions`;

        SMySQL.getConnection((connection) => {
            connection?.execute<any[]>(sql, (err, results) => {
                if (err) {
                    onNext([]);
                    return;
                }

                const permissions: Permission[] = results;

                onNext(permissions);
            });
        });
    }

    public static getPermissionsOfUser(id: string, onNext: (permissions: Permission[]) => void) {
        const sql = `SELECT permissions.* FROM permissions
        INNER JOIN user_permissions ON permissions.id = user_permissions.permission_id
        WHERE user_permissions.user_id =?`;

        SMySQL.getConnection((connection) => {
            connection?.execute<any[]>(sql, [id], (err, results) => {
                if (err) {
                    onNext([]);
                    SLog.log(LogType.Error, "getPermissionsOfUser", "getPermissionsOfUser unsuccessfully", err);
                    return;
                }

                const permissions: Permission[] = results;
                onNext(permissions);
            });
        });
    }

    public static addPermissionsToUser(id: string, permissions: Permission[], onNext: (result: boolean) => void) {
        const sql = `INSERT INTO user_permissions (user_id, permission_id) VALUES ${permissions.map(_ => "(?,?)").join(",")}`;
        const values = [];

        permissions.forEach((permission) => {
            values.push(id);
            values.push(permission.id);
        });

        SMySQL.getConnection((connection) => {
            connection?.execute<any>(sql, values, (err, result) => {
                if (err) {
                    SLog.log(LogType.Error, "addPermissionsToUser", "addPermissionsToUser unsuccessfully", err);
                    onNext(true);
                    return;
                }

                SLog.log(LogType.Info, "addPermissionsToUser", "addPermissionsToUser successfully");
                onNext(true);
            });
        });
    }

    public static removePermissionsOfUser(id: string, onNext: (result: boolean) => void) {
        const sql = "DELETE FROM user_permissions WHERE user_id =?";

        SMySQL.getConnection((connection) => {
            connection?.execute<any>(sql, [id], (err, result) => {
                if (err) {
                    SLog.log(LogType.Error, "removePermissionsOfUser", "removePermissionsOfUser unsuccessfully", err);
                    onNext(false);
                    return;
                }

                SLog.log(LogType.Info, "removePermissionsOfUser", "removePermissionsOfUser successfully");
                onNext(true);
            });
        });
    }
}