import { RowDataPacket } from "mysql2";
import Permission from "../models/Permission";
import SMySQL from "./SMySQL";

interface IPermission extends RowDataPacket {
    id: number;
    permission: string;
}

export default class SPermission {

    public static getAllPermissions(onNext: (permissions: Permission[]) => void) {
        const sql = `SELECT * FROM permissions`;

        SMySQL.getConnection((connection) => {
            connection?.execute<IPermission[]>(sql, (err, results) => {
                if (err) {
                    onNext([]);
                    return;
                }

                const permissions: Permission[] = [];

                results.forEach(iPermission => {
                    const permission = new Permission();
                    permission.id = iPermission.id;
                    permission.permission = iPermission.permission;

                    permissions.push(permission);
                });

                onNext(permissions);
            });
        });
    }
}