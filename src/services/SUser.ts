import User, { userJson } from "./../models/User";
import SMySQL from "./SMySQL";
import SLog, {LogType} from "./SLog";
import {v4} from "uuid";
import SFirebase, {FirebaseNode} from "./SFirebase";
import SMessage from "./SMessage";
import * as crypto from "crypto";
import db from "../configs/knex";

export default class SUser {
  public static getAllUsers(onNext: (users: User[]) => void) {
    const sql = `SELECT users.*,
                        JSON_OBJECT(
                                'id', roles.id,
                                'role', roles.name
                        ) AS role,
                        JSON_OBJECT(
                                'id', files.id,
                                'path', files.path,
                                'image_width', files.image_with,
                                'image_height', files.image_height
                        ) AS avatar
                 FROM users
                          LEFT JOIN roles ON roles.id = users.role_id
                          LEFT JOIN files ON files.id = users.avatar_id
                 GROUP BY users.id
    `;

    SMySQL.getConnection((connection) => {
      connection?.execute<any[]>(sql, (err, results) => {
        if (err) {
          SLog.log(LogType.Error, "get all users", "failed to execute", err);
          onNext([]);
          return;
        }

        const users: User[] = [];

        results.forEach(result => {
          const user: User = result;
          users.push(user);
        });

        SLog.log(LogType.Info, "getAllUsers", "", users);
        onNext(users);
      });
    });
  }

  public static getContactUsers(
    userId: string,
    onNext: (users: User[]) => void
  ) {
    SMessage.getInboxes(userId, (inboxes) => {
      const contacts = inboxes.map((inbox) => inbox.user);

      SLog.log(LogType.Info, "getContactUsers", "", contacts.length);

      contacts.sort((a, b) => a.full_name > b.full_name ? 1 : -1);

      onNext(contacts);
    });
  }

  public static getUserById(
    id: string,
    onNext: (user: User | undefined) => void
  ) {
    const sql = `SELECT users
                 FROM users
                 WHERE users.id = ?`;

    SMySQL.getConnection((connection) => {
      connection?.execute<any>(sql, [id], (error, result) => {
        if (error) {
          onNext(undefined);
          SLog.log(LogType.Error, "getUserById", "", error);
          return;
        } else {
          const user: User | undefined = (result && result[0]) || undefined;

          SLog.log(LogType.Info, "getUserById", "", user);
          onNext(user);
        }
      });
    });
  }

  public static getUserByToken(
    token: string,
    onNext: (user: User | undefined) => void
  ) {
    const sql = `SELECT *
                 FROM users
                 WHERE token = ?`;

    SMySQL.getConnection((connection) => {
      connection?.execute<any>(sql, [token], (error, result) => {
        if (error) {
          onNext(undefined);
          SLog.log(LogType.Error, "getUserByToken", "", error);
          return;
        } else {
          const user: User | undefined = (result && result[0]) || undefined;
          SLog.log(LogType.Info, "getUserByToken", "", user);
          onNext(user);
        }
      });
    });
  }

  public static getUserByPhoneNumberOrUsername(
    phoneNumber: string,
    username: string,
    onNext: (user: User | undefined) => void
  ) {
    const sql = `SELECT *
                 FROM users
                 WHERE phone_number = ?
                    OR user_name = ?`;

    SMySQL.getConnection((connection) => {
      connection?.execute<any>(sql, [phoneNumber, username], (error, result) => {
        if (error) {
          onNext(undefined);
          SLog.log(LogType.Error, "getUserByPhoneNumberOrUsername", "", error);
          return;
        } else {
          const user: User | undefined = (result && result[0]) || undefined;
          SLog.log(LogType.Info, "getUserByPhoneNumberOrUsername", "", user);
          onNext(user);
        }
      });
    });
  }

  public static checkUserPassword(
    userId: string,
    password: string,
    onNext: (result: boolean) => void
  ) {
    const sql = "SELECT password FROM users WHERE id = ?";

    SMySQL.getConnection((connection) => {
      connection?.execute<any>(sql, [userId ?? -1], (error, result) => {
        if (error) {
          SLog.log(LogType.Error, "checkUserPassword", "", error);
          onNext(false);
          return;
        } else {
          const userPassword: string = (result && result[0]) || "";
          const flag =
            /*SEncrypt.decrypt(userPassword, "")*/ userPassword === password;
          SLog.log(LogType.Warning, "checkUserPassword", "", flag);
          onNext(flag);
        }
      });
    });
  }

  public static storeUser(user: User, onNext: (result: boolean) => void) {

    const sql =
      "INSERT INTO `users` (`id`, `email`, `user_name`, `full_name`, `phone_number`, `password`, `token`, `hometown`, `birthday`, `gender_id`, `address_id`, `created_at`) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)";

    SMySQL.getConnection((connection) => {
      connection?.execute<any>(
        sql,
        [
          user.id,
          new Date().getTime(),
          user.username,
          user.full_name,
          user.phone_number,
          user.password,
          v4(),
          user.hometown,
          user.birthday,
          user.gender?.id ?? 3,
          -1,
          new Date().getTime(),
        ],
        (error, result) => {
          if (error) {
            onNext(false);
            SLog.log(LogType.Error, "storeUser", "failed to execute", error);
            return;
          }

          //update into firebase
          SFirebase.push(FirebaseNode.Users, [{key: FirebaseNode.Id, value: user.id}], () => {
            SLog.log(LogType.Info, "storeUser", "store user successfully");
            onNext(true);
          });
        }
      );
    });

  }

  public static updateUserInfo(user: User, onNext: (result: boolean) => void) {

    let sql = "UPDATE `users` SET ";
    const params: any[] = [];

    if (user.full_name) {
      sql += "`full_name` = ?,";
      params.push(user.full_name);
    }

    if (user.phone_number) {
      sql += "`phone_number` = ?,";
      params.push(user.phone_number);
    }

    if (user.password) {
      sql += "`password` = ?,";
      params.push(user.password);
    }

    if (user.token) {
      sql += "`token` = ?,";
      params.push(user.token);
    }

    if (user.avatar) {
      sql += "`avatar` = ?,";
      params.push(user.avatar);
    }

    sql += "`updated_at` = ? WHERE id = ?";

    SMySQL.getConnection((connection) => {
      connection?.execute<any>(
        sql,
        [...params, new Date().getTime(), user.id],
        (error, result) => {
          if (error) {
            onNext(false);
            SLog.log(LogType.Error, "updateUser", "failed to execute", error);
            return;
          }

          //update into firebase
          // SFirebase.push(FirebaseNode.USER, user.id, () => {
          //   SLog.log(LogType.Info, "updateUser", "update user successfully");
          onNext(true);
          // });
        }
      );
    });

  }

  public static softDeleteUser(id: number, onNext: (result: boolean) => void) {
  }

  // Hàm khoá tài khoản người dùng
  public static LockUserAccount(
    user_id: string,
    permissionIds: string[], // Mảng ID quyền truyền vào
    onNext: (result: boolean) => void
  ) {
    // Nếu mảng quyền rỗng, đặt mặc định là quyền 13
    if (permissionIds.length === 0) {
      permissionIds = ["13"];
    }

    // Tạo danh sách quyền dưới dạng chuỗi để chèn vào SQL
    const permissionValues = permissionIds.map(() => "(?, ?)").join(", ");

    // Câu truy vấn DELETE để xóa các quyền hiện tại của user_id
    const deleteSql = `
      DELETE FROM user_role
      WHERE user_id = ? AND role_id IN (${permissionIds
        .map(() => "?")
        .join(", ")});
    `;

    // Câu truy vấn INSERT để thêm lại các quyền mới cho user_id
    const insertSql = `
        INSERT INTO user_permissions (user_id, permission_id)
        VALUES (?, 16),
               (?, 20),
               (?, 37),
               (?, 38),
               (?, 42),
               (?, 43),
               (?, 47),
               (?, 48),
               (?, 49),
               (?, 50);
    `;

    // Thực thi câu truy vấn DELETE trước
    SMySQL.getConnection((connection) => {
      connection?.execute(
        deleteSql,
        [user_id, ...permissionIds],
        (deleteError) => {
          if (deleteError) {
            onNext(false);
            SLog.log(
              LogType.Error,
              "LockUserAccount",
              "Cannot delete user permissions",
              deleteError
            );
            return;
          }

          // Sau khi DELETE thành công, thực thi câu truy vấn INSERT
          const insertParams: (string | number)[] = [];
          permissionIds.forEach((permissionId) => {
            insertParams.push(user_id, permissionId);
          });

          connection.execute(insertSql, insertParams, (insertError) => {
            if (insertError) {
              onNext(false);
              SLog.log(
                LogType.Error,
                "LockUserAccount",
                "Cannot insert new permissions",
                insertError
              );
              return;
            }

            // Nếu thành công, ghi log và gọi callback với `true`
            SLog.log(
              LogType.Info,
              "LockUserAccount",
              "Locked user account successfully"
            );
            onNext(true);
          });
        }
      );
    });
  }

  //trừ điểm uy tín của người dùng
  public static MinusUserPoints(
    user_id: string,
    point: number,
    onNext: (result: boolean) => void
  ) {
    // Câu truy vấn cập nhật điểm của người dùng
    let sql = `
        UPDATE informations
        SET point = point - ?
        WHERE user_id = ? LIMIT 1;
    `;

    SMySQL.getConnection((connection) => {
      connection?.execute(
        sql,
        [point, user_id], // Truyền vào `point` và `user.user_id` làm tham số
        (error, result) => {
          // Nếu có lỗi, ghi lại lỗi và gọi callback với `false`
          if (error) {
            onNext(false);
            SLog.log(
              LogType.Error,
              "MinusUserPoints",
              "Cannot subtract points for user",
              error
            );
            return;
          }

          // Nếu cập nhật thành công, gọi callback với `true` và ghi log thành công
          SLog.log(
            LogType.Info,
            "MinusUserPoints",
            "Subtracted points successfully for user"
          );
          onNext(true);
        }
      );
    });
  }

  //tạo admin
  public static CreateAdminUser(
    phone: string,
    email: string,
    password: string,
    onNext: (result: boolean) => void
  ) {
    // Tạo ID với chuỗi "99" + 10 số ngẫu nhiên
    const id =
      "99" + Math.floor(1000000000 + Math.random() * 9999999999).toString();

    // Thiết lập các giá trị mặc định
    const fullName = "admin";
    const avatar = 1;
    const role = 2;
    const token = ""; // Thêm token mặc định (ví dụ là chuỗi rỗng hoặc giá trị khác nếu cần)

    // Mã hóa mật khẩu
    const hashedPassword = crypto
      .createHash("sha256")
      .update(password)
      .digest("hex");

    // Câu truy vấn INSERT để thêm admin vào cơ sở dữ liệu
    const insertSql = `
        INSERT INTO users (id, full_name, email, phone_number, password, avatar_id, role_id, token, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW());
    `;

    // Thực thi truy vấn
    SMySQL.getConnection((connection) => {
      if (!connection) {
        onNext(false);
        SLog.log(
          LogType.Error,
          "CreateAdminUser",
          "Database connection failed"
        );
        return;
      }

      connection.execute(
        insertSql,
        [id, fullName, email, phone, hashedPassword, avatar, role, token], // Thêm token vào đây
        (insertError, result) => {
          if (insertError) {
            onNext(false);
            SLog.log(
              LogType.Error,
              "CreateAdminUser",
              "Cannot insert new admin user",
              insertError
            );
          } else {
            SLog.log(
              LogType.Info,
              "CreateAdminUser",
              "Admin user created successfully"
            );
            onNext(true);
          }

          // Đảm bảo đóng kết nối sau khi thực hiện xong
          connection.end();
        }
      );
    });
  }

  
}