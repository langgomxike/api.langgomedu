import { RowDataPacket } from "mysql2";
import Role from "../models/Role";
import SLog, { LogType } from "./SLog";
import SMySQL from "./SMySQL";

interface IRole extends RowDataPacket {
    id: number;
    name: string;
}

export default class SRole {
    public static getRolesByIds(ids: number[], onNext: (roles: Role[] | []) => void) {
        const sql = `SELECT * FROM roles WHERE id IN (${ids.map(id => "?").join(", ")})`;

        // SLog.log(LogType.Info, "sql", "", { ids, sql, });

        SMySQL.getConnection((connection) => {
            connection?.execute<IRole[]>(sql, ids.map(id => id ? id : -1), (err, results) => {
                if (err) {
                    onNext([]);
                    // SLog.log(LogType.Error, "getRolesByIds", "ids: " + ids.join(", "), err);
                    return;
                }

                const roles: Role[] = [];

                results.forEach(iRole => {
                    const role = new Role();
                    role.id = iRole.id;
                    role.role = iRole.name;
                    roles.push(role);
                });

                onNext(roles);
                // SLog.log(LogType.Info, "getRolesByIds", "ids: " + ids.join(", "), { err: err, results: results });
            });
        });
    }
}