import User from "./../models/User";
import SMySQL from "./SMySQL";
import SLog, {LogType} from "./SLog";
import {v4} from "uuid";
import SFirebase, {FirebaseNode} from "./SFirebase";
import SMessage from "./SMessage";
import * as crypto from "crypto";
import * as dotenv from "dotenv";
import {dot} from "node:test/reporters";

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
    const sql = `SELECT *
                 FROM users
                 WHERE ((
                     EXISTS (SELECT 1 FROM messages WHERE messages.sender_id = users.id COLLATE utf8mb4_unicode_ci)
                     )
                    OR (
                     EXISTS (SELECT 1 FROM messages WHERE messages.receiver_id = users.id COLLATE utf8mb4_unicode_ci)
                     )) AND users.id <> ? AND users.id <> ? ORDER BY users.full_name ASC `;
    ;

    dotenv.config();
    const superAdminId = process.env.ADMIN_ID ?? "-1";

    SMySQL.getConnection(connection => {
      connection?.execute<any[]>(sql, [userId, superAdminId], (error, results) => {
        if (error) {
          SLog.log(LogType.Error, "getContactUsers", "get all contacts failed", error);
          onNext([]);
        } else {
          const contacts = results as User[] ?? [];
          SLog.log(LogType.Error, "getContactUsers", "get all contacts successfully", contacts.length);
          onNext(contacts);
        }
      });
    });
  }

  public static getUserById(
    id: string,
    onNext: (user: User | undefined) => void
  ) {
    const sql = `SELECT *
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
    report_id: string,
    permissionIds: string[], // Mảng ID quyền truyền vào
    onNext: (result: boolean) => void
  ) {
    // Tạo danh sách quyền dưới dạng chuỗi để chèn vào SQL
    const permissionValues = permissionIds.map(() => "(?, ?)").join(", ");

    // Câu truy vấn DELETE để xóa các quyền hiện tại của user_id
    const deleteSql = `
      DELETE FROM user_role
      WHERE user_id = ?;
    `;

    // Câu truy vấn INSERT để thêm quyền mới (bao gồm quyền mặc định 13 nếu cần)
    const insertSql = `
      INSERT INTO user_role (user_id, role_id)
      VALUES (?, ?);
    `;

    // Câu truy vấn UPDATE để khóa các lớp có author_id bằng user_id
    const updateClassesSql = `
      UPDATE classes
      SET ended_at = (UNIX_TIMESTAMP() * 1000)
      WHERE author_id = ?;
    `;

    // Câu truy vấn UPDATE để cài lại điểm về 0 cho user_id
    const updatePointsSql = `
      UPDATE users
      SET point = 0
      WHERE id = ?;
    `;

    // Câu truy vấn để lấy điểm hiện tại của user_id
    const getUserPointsSql = `
      SELECT point FROM users WHERE id = ?;
    `;

    // Câu truy vấn UPDATE để cập nhật desc_point trong bảng reports
    const updateReportDescPointSql = `
      UPDATE reports
      SET desc_point = ?
      WHERE id = ?;
    `;

    // Thực thi câu truy vấn DELETE trước
    SMySQL.getConnection((connection) => {
      connection?.execute(getUserPointsSql, [user_id], (pointsError, pointsResult) => {
        if (pointsError) {
          onNext(false);
          SLog.log(
            LogType.Error,
            "LockUserAccount",
            "Cannot get user points",
            pointsError
          );
          return;
        }

        // Lấy điểm của user trước khi cập nhật thành 0
        const currentPoint = pointsResult[0]?.point || 0;

        // Cập nhật bảng reports với desc_point = currentPoint
        connection.execute(updateReportDescPointSql, [currentPoint, report_id], (reportError) => {
          if (reportError) {
            onNext(false);
            SLog.log(
              LogType.Error,
              "LockUserAccount",
              "Cannot update desc_point in reports",
              reportError
            );
            return;
          }

          // Thực hiện các truy vấn còn lại (DELETE, INSERT, UPDATE các bảng khác)
          connection.execute(deleteSql, [user_id], (deleteError) => {
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

            // Sau khi DELETE thành công, thêm quyền mặc định 13
            connection.execute(insertSql, [user_id, "13"], (insertError) => {
              if (insertError) {
                onNext(false);
                SLog.log(
                  LogType.Error,
                  "LockUserAccount",
                  "Cannot insert default permission",
                  insertError
                );
                return;
              }

              // Cập nhật điểm về 0 cho người dùng
              connection.execute(updatePointsSql, [user_id], (pointsUpdateError) => {
                if (pointsUpdateError) {
                  onNext(false);
                  SLog.log(
                    LogType.Error,
                    "LockUserAccount",
                    "Cannot update user points to 0",
                    pointsUpdateError
                  );
                  return;
                }

                // Nếu quyền 7 có trong permissionIds, thực hiện câu truy vấn cập nhật cho các lớp
                if (permissionIds.includes("7")) {
                  connection.execute(updateClassesSql, [user_id], (updateError) => {
                    if (updateError) {
                      onNext(false);
                      SLog.log(
                        LogType.Error,
                        "LockUserAccount",
                        "Cannot update classes with author_id",
                        updateError
                      );
                      return;
                    }

                    // Nếu cập nhật lớp thành công, ghi log và gọi callback với `true`
                    SLog.log(
                      LogType.Info,
                      "LockUserAccount",
                      "Locked user account successfully and updated classes"
                    );
                    onNext(true);
                  });
                } else {
                  // Nếu không có quyền 7, chỉ ghi log và gọi callback với `true`
                  SLog.log(
                    LogType.Info,
                    "LockUserAccount",
                    "Locked user account successfully with default permission"
                  );
                  onNext(true);
                }
              });
            });
          });
        });
      });
    });
  }

  //trừ điểm uy tín của người dùng
  public static MinusUserPoints(
    user_id: string,
    point: number,
    report_id: string,  // Thêm tham số report_id
    onNext: (result: boolean) => void
  ) {
    const updateUserPointsSql = `UPDATE users SET point = point - ? WHERE id = ? LIMIT 1;`;

    // Câu truy vấn cập nhật desc_point trong bảng reports
    const updateReportDescPointSql = `UPDATE reports SET desc_point = ? WHERE id = ? LIMIT 1;`;

    SMySQL.getConnection((connection) => {
      // Thực hiện trừ điểm cho người dùng
      connection?.execute(updateUserPointsSql, [point, user_id], (error, result) => {
        if (error) {
          console.error("Error subtracting points in database:", error);
          onNext(false);
          return;
        }

        console.log("Subtracted points successfully for user", user_id);

        // Sau khi trừ điểm thành công, cập nhật desc_point trong bảng reports
        connection.execute(updateReportDescPointSql, [point, report_id], (reportError, reportResult) => {
          if (reportError) {
            console.error("Error updating desc_point in reports:", reportError);
            onNext(false);
            return;
          }

          console.log("Updated desc_point in reports for report_id", report_id);

          // Cuối cùng, gọi callback với kết quả thành công
          onNext(true);
        });
      });
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