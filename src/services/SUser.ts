import User from "./../models/User";
import SMySQL from "./SMySQL";
import SLog, {LogType} from "./SLog";
import {v4} from "uuid";
import SFirebase, {FirebaseNode} from "./SFirebase";
import * as crypto from "crypto";
import * as dotenv from "dotenv";
import OTP from "../models/OTP";
import SMessage from "./SMessage";
import {pbkdf2Sync, randomBytes} from "node:crypto";
import Address from "../models/Address";

export default class SUser {

  private static hashPassword(password: string): string {
    const salt = randomBytes(16).toString("hex"); // Generate a unique salt
    const hash = pbkdf2Sync(password, salt, 100000, 64, "sha256").toString("hex"); // Hash with PBKDF2
    return `${salt}:${hash}`; // Store salt and hash together
  }

  public static verifyPassword(password: string, storedHash: string): boolean {
    const [salt, hash] = storedHash.split(":");
    const hashToVerify = pbkdf2Sync(password, salt, 100000, 64, "sha256").toString("hex");
    return hash === hashToVerify;
  }

  public static sendOTP(phoneNumber: string, onNext: (otp: number) => void) {
    const otp = new OTP(Math.floor(111111 + Math.random() * 888889), new Date().getTime() + 5 * 60 * 1000);

    SFirebase.push(FirebaseNode.OTPs, [
      {
        key: FirebaseNode.PhoneNumber,
        value: phoneNumber
      },
    ], () => {
      onNext(otp.code);
    }, otp);
  }

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
                            EXISTS (SELECT 1
                                    FROM messages
                                    WHERE messages.sender_id = users.id COLLATE utf8mb4_unicode_ci)
                            )
                     OR (
                            EXISTS (SELECT 1
                                    FROM messages
                                    WHERE messages.receiver_id = users.id COLLATE utf8mb4_unicode_ci)
                            ))
                   AND users.id <> ?
                   AND users.id <> ?
                 ORDER BY users.full_name ASC `;
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

          if (user) {
            user.username = (user as any)?.user_name;
          }

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

          if (user) {
            user.username = (user as any)?.user_name;
          }

          SLog.log(LogType.Info, "getUserByToken", "", user);
          onNext(user);
        }
      });
    });
  }

  public static getUserAddress(
    userId: string,
    onNext: (address: Address | undefined) => void
  ) {
    const sql = `SELECT addresses.*
                 FROM addresses
                 INNER JOIN users ON users.address_id = addresses.id
                 WHERE users.id = ?`;

    SMySQL.getConnection((connection) => {
      connection?.execute<any>(sql, [userId], (error, result) => {
        if (error) {
          onNext(undefined);
          SLog.log(LogType.Error, "getUserAddress", "", error);
          return;
        } else {
          const address: Address | undefined = (result && result[0]) || undefined;

          SLog.log(LogType.Info, "getUserAddress", "successfully");
          onNext(address);
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
          SLog.log(LogType.Error, "getUserByPhoneNumberOrUsername", "found error", error);
          return;
        } else {
          const user: User | undefined = (result && result[0]) || undefined;

          if (user) {
            user.username = (user as any)?.user_name;
          }

          SLog.log(LogType.Info, "getUserByPhoneNumberOrUsername", "sucessfully", user);
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
      "INSERT INTO `users` (`id`, `email`, `user_name`, `full_name`, `phone_number`, `password`, `token`, `hometown`, `birthday`, `gender_id`, `address_id`, `created_at`, `parent_id`, `avatar`) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)";

    SMySQL.getConnection((connection) => {
      connection?.execute<any>(
        sql,
        [
          user.id,
          new Date().getTime(),
          user.username,
          user.full_name,
          user.phone_number,
          this.hashPassword(user.password),
          v4(),
          user.hometown,
          user.birthday,
          user.gender?.id ?? 3,
          -1,
          new Date().getTime(),
          user.parent?.id ?? "-1",
          "/images/avatars/user_" + (Math.floor(1 + Math.random() * 5)) + ".jpg",
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

            const encodedPhone = user.phone_number.slice(0, 3) + "*".repeat(user.phone_number.length - 3);

            SMessage.createNotification(`Xin chào ${user.full_name}, bạn đã đăng ký tài khoản thành công. Tài khoản mới với số điện thoại [${encodedPhone}], tên tài khoản [${user.username}] đã được tạo thành công. Từ nay bạn sẽ có thể đăng nhập tài khoản với những thông tin này. Vui lòng ghi nhớ những thông tin cho các lần đăng nhập tiếp theo!`, user.id,
              () => {
                onNext(true);
              });
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

  public static updateUserPassword(userId: string, password: string, onNext: (result: boolean) => void) {
    const sql = "UPDATE `users` SET `password` = ?, `updated_at` = ? WHERE id = ?";

    SMySQL.getConnection((connection) => {
      connection?.execute<any>(
        sql,
        [this.hashPassword(password), new Date().getTime(), userId],
        (error, result) => {
          if (error) {
            onNext(false);
            SLog.log(LogType.Error, "updateUser", "failed to execute", error);
            return;
          }

          SMessage.createNotification(`Cập nhật mật khẩu mới thành công. Từ nay bạn sẽ đăng nhập tài khoản với mật khẩu mới này.`, userId, () => {
            onNext(true);
          });
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
        DELETE
        FROM user_role
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
        SELECT point
        FROM users
        WHERE id = ?;
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
    const updateUserPointsSql = `UPDATE users
                                 SET point = point - ?
                                 WHERE id = ? LIMIT 1;`;

    // Câu truy vấn cập nhật desc_point trong bảng reports
    const updateReportDescPointSql = `UPDATE reports
                                      SET desc_point = ?
                                      WHERE id = ? LIMIT 1;`;

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

  public static minusUserPoint(
    user_id: string,
    point: number,
    onNext: (result: boolean) => void
  ) {
    const updateUserPointsSql = `UPDATE users
                                 SET point = point - ?
                                 WHERE id = ?`;

    SMySQL.getConnection((connection) => {
      // Thực hiện trừ điểm cho người dùng
      connection?.execute(updateUserPointsSql, [point, user_id], (error, result) => {
        if (error) {
          console.error("Error subtracting points in database:", error);
          onNext(false);
          return;
        }

        console.log("Subtracted points successfully for user", user_id);
        SFirebase.push(FirebaseNode.Users, [{key: FirebaseNode.Id, value: user_id}], () => {
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
//lấy ra profile user
public static getProfileUserById(
  id: string,
  onNext: (
    userWithDetails:
      | (User & { interesdMajors: any[]; interestedClassLevels: any[] })
      | undefined
  ) => void
) {
  const sql = `
  SELECT 
    users.*,
    -- Lấy danh sách majors từ bảng interested_majors
    (
      SELECT 
        IFNULL(
          JSON_ARRAYAGG(
            JSON_OBJECT(
              'id', majors.id,
              'vn_name', majors.vn_name,
              'en_name', majors.en_name,
              'ja_name', majors.ja_name,
              'icon', majors.icon
            )
          ), JSON_ARRAY()
        )
      FROM interested_majors
      JOIN majors ON interested_majors.major_id = majors.id
      WHERE interested_majors.user_id = users.id
    ) AS interested_majors,
    -- Lấy danh sách class levels từ bảng interested_class_levels
    (
      SELECT 
        IFNULL(
          JSON_ARRAYAGG(
            JSON_OBJECT(
              'id', class_levels.id,
              'vn_name', class_levels.vn_name,
              'en_name', class_levels.en_name,
              'ja_name', class_levels.ja_name
            )
          ), JSON_ARRAY()
        )
      FROM interested_class_levels
      JOIN class_levels ON interested_class_levels.class_level_id = class_levels.id
      WHERE interested_class_levels.user_id = users.id
    ) AS interested_class_levels,
    -- Lấy thông tin địa chỉ
    JSON_OBJECT(
      'province', addresses.province,
      'district', addresses.district,
      'ward', addresses.ward,
      'detail', addresses.detail
    ) AS address,
    JSON_OBJECT(
      'id', users.gender_id
) as gender
  FROM users
  LEFT JOIN addresses ON users.address_id = addresses.id
  WHERE users.id = ?;
  `;

  // Kết nối với cơ sở dữ liệu và thực hiện truy vấn
  SMySQL.getConnection((connection) => {
    connection?.execute<any>(sql, [id], (error, result) => {
      if (error || !result || result.length === 0) {
        SLog.log(
          LogType.Error,
          "getProfileUserById",
          "User not found",
          error
        );
        onNext(undefined);
        return;
      }

      const userWithDetails = result[0]; // Lấy kết quả đầu tiên từ query
      onNext(userWithDetails);
    });
  });
}

//thay avatar

public static updateAvatar(
  id: string, // ID của người dùng
  avatar: string, // Avatar mới
  onNext: (result: boolean) => void // Callback trả về kết quả
) {
  // Truy vấn SQL để cập nhật avatar trong bảng users
  const sqlUpdateAvatar = "UPDATE users SET avatar = ? WHERE id = ?";

  // Thời gian cập nhật
  const paramsUpdate = [avatar, id];

  // Kết nối cơ sở dữ liệu và thực hiện truy vấn cập nhật
  SMySQL.getConnection((connection) => {
    if (!connection) {
      SLog.log(LogType.Error, "updateAvatar", "No connection available");
      onNext(false);
      return;
    }

    connection.execute(
      sqlUpdateAvatar,
      paramsUpdate,
      (err: Error | null, result: any) => {
        if (err) {
          // Nếu có lỗi khi cập nhật avatar
          SLog.log(
            LogType.Error,
            "updateAvatar",
            "Failed to update avatar",
            err
          );
          onNext(false);
          return;
        }

        if (result.affectedRows === 0) {
          // Nếu không có dòng nào bị ảnh hưởng (ID không tồn tại hoặc avatar không thay đổi)
          SLog.log(
            LogType.Error,
            "updateAvatar",
            "No user found with the given ID or no changes made."
          );
          onNext(false);
          return;
        }

        // Nếu cập nhật thành công trong MySQL
        SLog.log(LogType.Info, "updateAvatar", "Avatar updated successfully");

        // Đồng bộ hóa với Firebase Realtime Database
        SFirebase.push(FirebaseNode.Users, [
          { key: FirebaseNode.Id, value: id }
        ], () => {
          // Callback khi cập nhật Firebase thành công
          SLog.log(LogType.Info, "updateAvatar", "Avatar updated in Firebase");
          onNext(true);
        });
      }
    );
  });
}


public static updateUserProfile(
  id: string,
  onNext: (result: boolean) => void,
  full_name?: string,
  hometown?: string,
  birthday?: number,
  gender_id?: number,
  province?: string,
  district?: string,
  ward?: string,
  detail?: string,
  majors?: number[],
  classes?: number[]
) {
  const updateUser = (connection: any, callback: () => void) => {
    let sql = "UPDATE users SET ";
    const params: any[] = [];

    if (full_name !== undefined) {
      sql += "full_name = ?,";
      params.push(full_name || null);
    }
    if (hometown !== undefined) {
      sql += "hometown = ?,";
      params.push(hometown || null);
    }
    if (birthday !== undefined) {
      sql += "birthday = ?,";
      params.push(birthday || null);
    }
    if (gender_id !== undefined) {
      sql += "gender_id = ?,";
      params.push(gender_id || null);
    }

    sql += "updated_at = ? WHERE id = ?";
    params.push(new Date().getTime(), id);

    connection.execute(sql, params, (error: Error | null) => {
      if (error) {
        onNext(false);
        SLog.log(LogType.Error, "updateUser", "Failed to execute", error);
        return;
      }
      callback();
    });
  };

  const updateClasses = (connection: any, callback: () => void) => {
    if (classes && classes.length > 0) {
      const deleteSql =
        "DELETE FROM interested_class_levels WHERE user_id = ?";
      connection.execute(deleteSql, [id], (deleteError: Error | null) => {
        if (deleteError) {
          onNext(false);
          SLog.log(
            LogType.Error,
            "deleteClasses",
            "Failed to execute",
            deleteError
          );
          return;
        }

        // Tạo danh sách VALUES cụ thể cho INSERT
        const insertValues = classes.map(() => "(?, ?)").join(", ");
        const insertSql = `INSERT INTO interested_class_levels (user_id, class_level_id) VALUES ${insertValues}`;
        const insertParams = classes.flatMap((classId) => [id, classId]);

        connection.execute(
          insertSql,
          insertParams,
          (insertError: Error | null) => {
            if (insertError) {
              onNext(false);
              SLog.log(
                LogType.Error,
                "insertClasses",
                "Failed to execute",
                insertError
              );
              return;
            }
            callback();
          }
        );
      });
    } else {
      callback();
    }
  };

  const updateMajors = (connection: any, callback: () => void) => {
    if (majors && majors.length > 0) {
      // Lọc danh sách majors để loại bỏ giá trị trùng lặp
      const uniqueMajors = [...new Set(majors)];

      const deleteSql = "DELETE FROM interested_majors WHERE user_id = ?";
      connection.execute(deleteSql, [id], (deleteError: Error | null) => {
        if (deleteError) {
          onNext(false);
          SLog.log(
            LogType.Error,
            "deleteMajors",
            "Failed to execute",
            deleteError
          );
          return;
        }

        // Tạo câu lệnh INSERT
        const insertValues = uniqueMajors.map(() => "(?, ?)").join(", ");
        const insertSql = `INSERT INTO interested_majors (user_id, major_id) VALUES ${insertValues}`;
        const insertParams = uniqueMajors.flatMap((majorId) => [id, majorId]);

        connection.execute(
          insertSql,
          insertParams,
          (insertError: Error | null) => {
            if (insertError) {
              onNext(false);
              SLog.log(
                LogType.Error,
                "insertMajors",
                "Failed to execute",
                insertError
              );
              return;
            }
            callback();
          }
        );
      });
    } else {
      callback();
    }
  };

  const updateAddress = (connection: any, callback: () => void) => {
    if (province || district || ward || detail) {
      const getAddressIdSql = "SELECT address_id FROM users WHERE id = ?";
      connection.execute(
        getAddressIdSql,
        [id],
        (getAddressError: Error | null, result: any) => {
          if (getAddressError) {
            onNext(false);
            SLog.log(
              LogType.Error,
              "getAddressId",
              "Failed to execute",
              getAddressError
            );
            return;
          }

          const addressId = result[0]?.address_id;
          if (addressId) {
            let updateAddressSql = "UPDATE addresses SET ";
            const addressParams: any[] = [];

            if (province !== undefined) {
              updateAddressSql += "province = ?,";
              addressParams.push(province || null);
            }
            if (district !== undefined) {
              updateAddressSql += "district = ?,";
              addressParams.push(district || null);
            }
            if (ward !== undefined) {
              updateAddressSql += "ward = ?,";
              addressParams.push(ward || null);
            }
            if (detail !== undefined) {
              updateAddressSql += "detail = ?,";
              addressParams.push(detail || null);
            }

            updateAddressSql =
              updateAddressSql.slice(0, -1) + " WHERE id = ?";
            addressParams.push(addressId);

            connection.execute(
              updateAddressSql,
              addressParams,
              (updateError: Error | null) => {
                if (updateError) {
                  onNext(false);
                  SLog.log(
                    LogType.Error,
                    "updateAddress",
                    "Failed to execute",
                    updateError
                  );
                  return;
                }
                callback();
              }
            );
          } else {
            const insertAddressSql =
              "INSERT INTO addresses (province, district, ward, detail) VALUES (?, ?, ?, ?)";
            const insertParams = [province, district, ward, detail];

            connection.execute(
              insertAddressSql,
              insertParams,
              (insertError: Error | null, result: any) => {
                if (insertError) {
                  onNext(false);
                  SLog.log(
                    LogType.Error,
                    "insertAddress",
                    "Failed to execute",
                    insertError
                  );
                  return;
                }

                const newAddressId = result.insertId;
                const updateUserSql =
                  "UPDATE users SET address_id = ? WHERE id = ?";
                connection.execute(
                  updateUserSql,
                  [newAddressId, id],
                  (updateError: Error | null) => {
                    if (updateError) {
                      onNext(false);
                      SLog.log(
                        LogType.Error,
                        "updateUserAddressId",
                        "Failed to execute",
                        updateError
                      );
                      return;
                    }
                    callback();
                  }
                );
              }
            );
          }
        }
      );
    } else {
      callback();
    }
  };

  SMySQL.getConnection((connection: any) => {
    if (!connection) {
      onNext(false);
      SLog.log(LogType.Error, "updateUserProfile", "No connection available");
      return;
    }

    updateAddress(connection, () => {
      updateMajors(connection, () => {
        updateClasses(connection, () => {
          updateUser(connection, () => {
            SFirebase.push(FirebaseNode.Users, [{ key: FirebaseNode.Id, value: id }], () => {
              onNext(true);
            })
          
          });
        });
      });
    });
  });
}
}
