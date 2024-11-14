import { RowDataPacket } from "mysql2";
import Role from "../models/Role";
import SLog, { LogType } from "./SLog";
import SMySQL from "./SMySQL";

export default class SRole {
    public static getRolesByIds(ids: number[], onNext: (roles: Role[] | []) => void) {
        const sql = `SELECT * FROM roles WHERE id IN (${ids.map(id => "?").join(", ")})`;

        // SLog.log(LogType.Info, "sql", "", { ids, sql, });

        SMySQL.getConnection((connection) => {
            connection?.execute<any[]>(sql, ids.map(id => id ? id : -1), (err, results) => {
                if (err) {
                    onNext([]);
                    SLog.log(LogType.Error, "getRolesByIds", "ids: " + ids.join(", "), err);

                    return;
                }

                const roles: Role[] = results;

                onNext(roles);
                SLog.log(LogType.Info, "getRolesByIds", "ids: " + ids.join(", "), { err: err, results: results });
            });
        });
    }

    public static getAllRoles(onNext: (roles: Role[]) => void) {
        const sql = "SELECT * FROM roles";

        SMySQL.getConnection((connection) => {
            connection?.execute<any[]>(sql, (err, results) => {
                if (err) {
                    onNext([]);
                    SLog.log(LogType.Error, "getAllRoles", "cannot get all roles", err);
                    return;
                }

                const roles: Role[] = results;

                SLog.log(LogType.Info, "getAllRoles", "", { err: err, results: results });
                onNext(roles);
            });
        });
    }
}