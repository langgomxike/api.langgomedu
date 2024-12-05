import User from "../../models/User";
import SMySQL from "../SMySQL";
import "reflect-metadata";
import Pagination from "../../models/Pagination";
import Report from "../../models/Report";
import SLog, {LogType} from "../SLog";

const userJsonSql = `
JSON_OBJECT(
            'id', users.id,
            'full_name', users.full_name,
            'phone_number', users.phone_number,
            'avatar', users.avatar,
            'point', users.point,
             'birthday', users.birthday,
            'banking_number', users.banking_number,
            'banking_code', users.banking_code,
            'address', JSON_OBJECT(
                'id', addresses.id,
                'province', addresses.province,
                'district',addresses.district,
                'ward', addresses.ward,
                'detail', addresses.detail
               ),
            'gender', JSON_OBJECT(
                    'id', genders.id,
                    'ja_name',genders.ja_name,
                    'en_name', genders.en_name, 
                    'vn_name', genders.vn_name
                ) ,
            'is_reported', CASE 
                WHEN reports.reportee_id IS NOT NULL THEN true 
                ELSE false 
            END,
            'cv_id', MAX(cvs.id)
        ) AS user
`;
export default class SUserAdmin {
  public static getAllUsers(
    search,
    action,
    page,
    perPage,
    onNext: (users: User[], pagination: Pagination) => void
  ) {
    let additionalCondition = "";
    const params = [search, search, search];

    const TAB = {
        ALL: "all",
        PENDING_APPROVAL: "pendingApproval",
        REPORTED: "reported",
        BANNED: "banned",
      };

    // Điều kiện tìm kiếm tùy thuộc vào `userType`

    // Người dùng bị báo cáo
    if (action === TAB.REPORTED) {
      additionalCondition = "AND reports.reportee_id IS NOT NULL";
    } 
    // Người dùng có CV đang chờ phê duyệt
    else if (action === TAB.PENDING_APPROVAL) {
      additionalCondition = "AND cvs.approved_at IS NULL AND cvs.id IS NOT NULL";
    }
    // Người dùng bị cấm
    else if (action === TAB.BANNED) {
      additionalCondition = "AND user_role.role_id = 7";
    }

    const searchCondition = search
      ? `AND (
            users.full_name LIKE CONCAT('%', ?, '%') OR
            users.phone_number LIKE CONCAT('%', ?, '%') OR
            CONCAT(addresses.province, ' ', addresses.district, ' ', addresses.ward, ' ', addresses.detail) LIKE CONCAT('%', ?, '%')
        )`
      : "";

    const sql = `
        SELECT 
        ${userJsonSql}
        FROM users
        LEFT JOIN reports ON reports.reportee_id = users.id
        LEFT JOIN genders ON users.gender_id = genders.id
        LEFT JOIN addresses ON addresses.id = users.address_id
        LEFT JOIN user_role ON user_role.user_id = users.id
        LEFT JOIN cvs ON cvs.id = users.id OR cvs.id = CONCAT(users.id, '_t')
        WHERE COALESCE(user_role.role_id, 0) NOT IN (1, 2)
        ${additionalCondition}
         ${searchCondition}
        GROUP BY users.id
        ORDER BY users.full_name ASC
        LIMIT ${perPage} OFFSET ${(page - 1) * perPage}
        ;
        `;

    const countSQL = `
        SELECT COUNT(DISTINCT users.id) AS total
        FROM users
        LEFT JOIN reports ON reports.reportee_id = users.id
        LEFT JOIN addresses ON addresses.id = users.address_id
        LEFT JOIN user_role ON user_role.user_id = users.id
        LEFT JOIN cvs ON cvs.id = users.id OR cvs.id = CONCAT(users.id, '_t')
        WHERE COALESCE(user_role.role_id, 0) NOT IN (1, 2) ${additionalCondition} ${searchCondition};
    `;

    // console.log(mysql.format(sql, [search, search, search]));
    SMySQL.getConnection((connection) => {
      connection?.execute<any[]>(sql, params, (err, results) => {
        if (err) {
          console.log("Error getting", err);
          onNext([], new Pagination());
          return;
        }
        const users: User[] = [];
        results.forEach((result) => {
          const user = result.user;
          user.is_reported = result.user.is_reported === 1 ? true : false;
          users.push(user);
        });

        connection.execute(countSQL, params, (err, countResults) => {
          if (err) {
            console.log("get total", err);
            onNext([], new Pagination());
            return;
          }
          const total = countResults[0].total;
          const pagination: Pagination = {
            page: page,
            per_page: perPage,
            total_pages: Math.ceil(total / perPage),
            total_items: total,
          };

          onNext(users, pagination);
        });
      });
    });
  }

  public static getPendingCVs() {}


  public static getAllReportUserOfUser(
    userId: string,
    onNext: (reports: Report[]) => void
  ) {
    const sql = `
        SELECT reports.*,
               reports.level_id as report_level,
               JSON_OBJECT(
                       'id', users.id,
                       'full_name', users.full_name,
                       'avatar', users.avatar,
                       'point', users.point
               )                as reporter
        FROM reports
                 INNER JOIN users ON reports.reporter_id = users.id
                 LEFT JOIN classes ON reports.class_id = classes.id
        WHERE reports.reportee_id = ?;
    `;

    SMySQL.getConnection((connection) => {
      connection?.execute<any[]>(sql, [userId], (err, results) => {
        if (err) {
          SLog.log(LogType.Error, "getAllReportUserOfUser", "found error: ", err);
          onNext([]);
          return;
        }

        const reports: Report[] = results ?? [];

        onNext(reports);
      });
    });
  }

  public static getReportById(
    reportId: number,
    onNext: (report: Report | undefined) => void
  ) {
    const sql = `
        SELECT reports.*,
               reports.level_id as report_level,
               JSON_OBJECT(
                       'id', users.id,
                       'full_name', users.full_name,
                       'avatar', users.avatar,
                       'point', users.point
               )                as reportee,
               JSON_OBJECT(
                       'id', classes.id,
                       'title', classes.title,
                       'major', JSON_OBJECT(
                               'vn_name', majors.vn_name,
                               'en_name', majors.en_name,
                               'ja_name', majors.ja_name
                                ),
                       'tutor', JSON_OBJECT(
                               'id', classes.author_id
                                 )
               )                as class
        FROM reports
                 INNER JOIN users ON reports.reportee_id = users.id
                 LEFT JOIN classes ON reports.class_id = classes.id
                 LEFT JOIN majors ON majors.id = classes.major_id
        WHERE reports.id = ?;
    `;

    SMySQL.getConnection((connection) => {
      connection?.execute<any[]>(sql, [reportId], (err, result) => {
        if (err) {
          SLog.log(LogType.Error, "getAllReportUserOfUser", "found error: ", err);
          onNext(undefined);
          return;
        }

        const report: Report = (result.length > 0 && result[0] as Report) ?? undefined;
        onNext(report);
      });
    });
  }

  public static getReportEvidences(reportId: number, onNext: (files: string[]) => void) {
    const sql = `
        SELECT files.path as file_path
        FROM files INNER JOIN report_files ON report_files.file_id = files.id
        WHERE report_files.report_id =?;
    `;

    SMySQL.getConnection((connection) => {
      connection?.execute<any[]>(sql, [reportId], (err, result) => {
        if (err) {
          SLog.log(LogType.Error, "getReportEvidences", "found error: ", err);
          onNext([]);
          return;
        }

        const files: string[] = result.map((item) => item.file_path);
        onNext(files);
      });
    });
  }

  // public static async getAllUsers2(onNext: (users: User[]) => void) {
  //   const results = await db("users")
  //     .join("addresses as ad", "ad.id", "=", "users.address_id")
  //     .join("genders", "genders.id", "=", "users.gender_id")
  //     .select(db.raw(userJson("users", "ad", "genders")));
  //
  //   onNext(results as User[]);
  // }
}
