import Role from "../models/Role";
import SLog, {LogType} from "./SLog";
import SMySQL from "./SMySQL";
import SFirebase, {FirebaseNode} from "./SFirebase";

export default class SRole {
  public static getRolesByIds(ids: number[], onNext: (roles: Role[] | []) => void) {
    const sql = `SELECT *
                 FROM roles
                 WHERE id IN (${ids.map(id => "?").join(", ")})`;

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
        SLog.log(LogType.Info, "getRolesByIds", "ids: " + ids.join(", "), {err: err, results: results});
      });
    });
  }

  public static getRolesByUserId(id: string, onNext: (roles: Role[]) => void) {
    const sql = `SELECT roles.*
                 FROM roles
                          INNER JOIN user_role
                                     ON roles.id = user_role.role_id
                 WHERE user_role.user_id = ?`;

    SMySQL.getConnection((connection) => {
      connection?.execute<any[]>(sql, [id], (err, results) => {
        if (err) {
          onNext([]);
          SLog.log(LogType.Error, "getRolesByUserId", "id: " + id, err);
          return;
        }

        const roles: Role[] = results;

        onNext(roles);
        SLog.log(LogType.Info, "getRolesByUserId", "id: " + id, {err: err, results: results});
      });
    });
  }

  public static getAllRoles(onNext: (roles: Role[]) => void) {
    const sql = "SELECT * FROM roles ORDER BY id DESC";

    SMySQL.getConnection((connection) => {
      connection?.execute<any[]>(sql, (err, results) => {
        if (err) {
          onNext([]);
          SLog.log(LogType.Error, "getAllRoles", "cannot get all roles", err);
          return;
        }

        const roles: Role[] = results;

        SLog.log(LogType.Info, "getAllRoles", "", {err: err, results: results});
        onNext(roles);
      });
    });
  }

  public static addRolesToUser(userId: string, roles: Role[], onNext: () => void) {
    const sql = `INSERT INTO user_role (user_id, role_id)
                 VALUES ${roles.map(r => "(?,?)").join(",")}`;
    const values = [];

    SRole.removeAllRolesOfUser(userId, () => {
      roles.forEach(role => {
        values.push(userId);
        values.push(role.id);
      });

      SLog.log(LogType.Warning, "role list", "", roles);

      SMySQL.getConnection((connection) => {
        connection?.execute<any[]>(sql, [...values], (err, results) => {
          if (err) {
            SLog.log(LogType.Error, "addRolesToUser", "addRolesToUser unsuccessfully", err);
          }

          SLog.log(LogType.Info, "addRolesToUser", "addRolesToUser successfully");
          SFirebase.push(FirebaseNode.Roles, [],
            onNext
          );
        });
      });
    });
  }

  private static removeAllRolesOfUser(userId: string, onNext: () => void) {
    const sql = "DELETE FROM user_role WHERE user_id =?";

    SMySQL.getConnection((connection) => {
      connection?.execute<any[]>(sql, [userId], (err, results) => {
        if (err) {
          SLog.log(LogType.Error, "removeAllRolesOfUser", "removeAllRolesOfUser unsuccessfully", err);
        }

        SLog.log(LogType.Info, "removeAllRolesOfUser", "removeAllRolesOfUser successfully");

        onNext();
      });
    });
  }

  public static createRole(role: Role, onNext: (result: boolean) => void) {
    const sql = "INSERT INTO roles (name) VALUES (?)";

    SMySQL.getConnection((connection) => {
      connection?.execute<any>(sql, [role.name?.toUpperCase() ?? ""], (err, result) => {
        if (err) {
          SLog.log(LogType.Error, "createRole", "createRole unsuccessfully", err);
          onNext(false);
          return;
        }

        SLog.log(LogType.Info, "createRole", "createRole successfully");
        SFirebase.push(FirebaseNode.Roles, [], () => {
          onNext(true);
        });
      });
    });
  }

  public static deleteRole(id: number, onNext: (result: boolean) => void) {
    const sql = "DELETE FROM roles WHERE id = ?";

    SMySQL.getConnection((connection) => {
      connection?.execute<any>(sql, [id], (err, result) => {
        if (err) {
          SLog.log(LogType.Error, "deleteRole", "deleteRole unsuccessfully", err);
          onNext(false);
          return;
        }

        const sql = "DELETE FROM role_permission WHERE role_id = ?";

        connection?.execute(sql, [id], () => {
          SLog.log(LogType.Info, "deleteRole", "deleteRole successfully");
          SFirebase.delete(FirebaseNode.Roles, [], () => {
            onNext(true);
          });
        });
      });
    });
  }
}