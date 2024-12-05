import Permission from "../models/Permission";
import SMySQL from "./SMySQL";
import SLog, {LogType} from "./SLog";
import SFirebase, {FirebaseNode} from "./SFirebase";

export default class SPermission {

  public static getAllPermissions(onNext: (permissions: Permission[]) => void) {
    const sql = `SELECT *
                 FROM permissions
                 ORDER BY permissions.name ASC`;

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
    const sql = `SELECT DISTINCT permissions.*
                 FROM permissions
                          INNER JOIN role_permission ON permissions.id = role_permission.permission_id
                 WHERE role_permission.role_id IN (SELECT user_role.role_id
                                                   FROM user_role
                                                   WHERE user_role.user_id = ?)`;

    SMySQL.getConnection((connection) => {
      connection?.execute<any[]>(sql, [id], (err, results) => {
        if (err) {
          onNext([]);
          SLog.log(LogType.Error, "getPermissionsOfUser", "getPermissionsOfUser unsuccessfully", err);
          return;
        }

        const permissions: Permission[] = results ?? [];
        SLog.log(LogType.Error, "getPermissionsOfUser", "getPermissionsOfUser successfully", permissions.length);
        onNext(permissions);
      });
    });
  }

  public static getPermissionsOfRole(id: number, onNext: (permissions: Permission[]) => void) {
    const sql = `SELECT permissions.*
                 FROM permissions
                          INNER JOIN role_permission ON permissions.id = role_permission.permission_id
                 WHERE role_permission.role_id = ?
                 ORDER BY permissions.name ASC`;

    SMySQL.getConnection((connection) => {
      connection?.execute<any[]>(sql, [id], (err, results) => {
        if (err) {
          onNext([]);
          SLog.log(LogType.Error, "getPermissionsOfRole", "Get permissions of role unsuccessfully", err);
          return;
        }

        const permissions: Permission[] = results ?? [];
        SLog.log(LogType.Info, "getPermissionsOfRole", "Get permissions of role unsuccessfully", permissions.length);
        onNext(permissions);
      });
    });
  }

  public static addPermissionsToUser(id: string, permissions: Permission[], onNext: (result: boolean) => void) {
    const sql = `INSERT INTO user_permission (user_id, permission_id)
                 VALUES ${permissions.map(_ => "(?,?)").join(",")}`;
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
        SFirebase.push(FirebaseNode.Permissions, [], () => {
          onNext(true);
        });
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
        SFirebase.push(FirebaseNode.Permissions, [], () => {
          onNext(true);
        });
      });
    });
  }

  public static updatePermissionsOfRole(id: number, permissions: number[], onNext: (result: boolean) => void) {
    const sql = `INSERT INTO role_permission (role_id, permission_id)
                 VALUES ${permissions.map(_ => "(?,?)").join(",")}`;

    const values = [];

    permissions.forEach((permission) => {
      values.push(id);
      values.push(permission);
    });

    SPermission.removePermissionsOfRole(id, () => {
      SMySQL.getConnection((connection) => {
        connection?.execute<any>(sql, values, (err, result) => {
          if (err) {
            SLog.log(LogType.Error, "updatePermissionsOfRole", "Update permissions of role unsuccessfully", err);
            onNext(false);
            return;
          }

          SLog.log(LogType.Info, "updatePermissionsOfRole", "Update permissions of role successfully");
          SFirebase.push(FirebaseNode.Permissions, [], () => {
            onNext(true);
          });
        });
      });
    });
  }

  private static removePermissionsOfRole(id: number, onNext: (result: boolean) => void) {
    const sql = "DELETE FROM role_permission WHERE role_id =?";

    SMySQL.getConnection((connection) => {
      connection?.execute<any>(sql, [id], (err, result) => {
        if (err) {
          SLog.log(LogType.Error, "removePermissionsOfRole", "removePermissionsOfRole unsuccessfully", err);
          onNext(false);
          return;
        }

        SLog.log(LogType.Info, "removePermissionsOfRole", "removePermissionsOfRole successfully");
        onNext(true);
      });
    });
  }

}