import express from 'express';
import SResponse, { ResponseStatus } from './SResponse';
import SMySQL from './SMySQL';
import SLog, { LogType } from './SLog';

export enum OWNING_REF_TABLES {
    CV = "cvs",
    USER_REPORT = "user_reports",
    CLASS_REPORT = "class_reports",
    INFORMATION = "informations",
    PERSONAL_CLASS = "classes",
}

export enum OWNING_REF_COLUMNS {
    USER_ID = "user_id",
    CLASS_ID = "class_id",
    AUTHOR_ID = "author_id",
    RATER_ID = "rater_id",
    RATEE_ID = "ratee_id",
}

export enum OWNING_KEY_COLUMNS {
    USER_ID = "user_id",
    iD = "id",
}


export default class SAuthentication {
    public static checkAuthentication(request: express.Request, response: express.Response, onNext: express.NextFunction, permissions: number[] = []) {
        const token: string = request?.headers?.authorization?.replace("Bearer ", "") ?? "";

        if (!token) {
            SResponse.getResponse(ResponseStatus.Unauthorized, null, "Token not found", response);
            return;
        }

        let sql = `SELECT count(permissions.id) as permission_total  FROM permissions
                        INNER JOIN user_permissions ON permissions.id = user_permissions.permission_id
                        INNER JOIN users ON users.id = user_permissions.user_id
                        WHERE users.token = ? `;

        if (permissions.length >= 1) {
            sql += ` AND permissions.id IN (${permissions.map(_ => "?").join(", ")})`;
        }

        SMySQL.getConnection(connection => {
            connection?.execute<any[]>(sql, [token, ...permissions], (error, result) => {
                if (error) {
                    SResponse.getResponse(ResponseStatus.Internal_Server_Error, error, "Cannot check authentication of user", response);
                    return;
                }

                const permissionTotal: number = result.length > 0 && result[0]?.permission_total || 0;
                SLog.log(LogType.Info, "checkAuthentication", "get total permissions of user", permissionTotal);

                if (permissionTotal > 0) { //has at least one permission
                    onNext(); //move to next step
                } else {
                    SResponse.getResponse(ResponseStatus.Forbidden, error, "The user is not authenticated", response);
                }
            });
        });
    }

    public static checkAuthorization(request: express.Request, response: express.Response, onNext: express.NextFunction, refTable: OWNING_REF_TABLES, refColumn: OWNING_REF_COLUMNS, keyColumn: OWNING_KEY_COLUMNS) {
        const token: string = request?.headers?.authorization?.replace("Bearer ", "") ?? "";
        const keyId: number = +(request?.query?.id ?? -1);

        if (!token) {
            SResponse.getResponse(ResponseStatus.Unauthorized, null, "Token not found", response);
            return;
        }

        const sql = `SELECT * FROM users 
                        INNER JOIN ${refTable} 
                        ON users.id = ${refTable}.${refColumn}
                        WHERE token = ? AND ${refTable}.${keyColumn} = ?`;

        SMySQL.getConnection(connection => {
            connection?.execute<any[]>(sql, [token, keyId], (error, result) => {
                if (error) {
                    SResponse.getResponse(ResponseStatus.Internal_Server_Error, error, "Cannot check authorization of user", response);
                    return;
                }

                const existRows = result?.length ?? 0;

                if (existRows >= 1) {
                    onNext();
                } else {
                    // SLog.log(LogType.Info, "checkAuthorization", "check authorization of user", result?.length);
                    SResponse.getResponse(ResponseStatus.Unauthorized, error, "The user is not authorized", response);
                }
            });
        });
    }
}