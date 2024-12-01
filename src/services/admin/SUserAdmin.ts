
import User, { userJson } from "../../models/User";
import SMySQL from "../SMySQL";
import "reflect-metadata";
import db from "../../configs/knex";
import Pagination from "../../models/Pagination";
import mysql from "mysql2";

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
            'cv_id', cvs.id
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
    userId: number,
    onNext: (user: User[] | undefined) => void
  ) {
    const sql = `
        SELECT 
        JSON_OBJECT(
            'id', from_user.id,
            'full_name', from_user.full_name,
            'email', from_user.email,
            'phone_number', from_user.phone_number,
            'avatar', (
                SELECT JSON_OBJECT(
                    'id', ffu.id,
                    'name', ffu.name,
                    'path', ffu.path
                )
                FROM files AS ffu
                WHERE ffu.id = from_user.avatar_id
            )
        ) as user
FROM user_reports AS ur 
LEFT JOIN users AS from_user ON from_user.id = ur.from_user_id
WHERE ur.to_user_id = 089204010902;
        `;

    SMySQL.getConnection((connection) => {
      connection?.execute<any[]>(sql, [userId], (err, results) => {
        if (err) {
          onNext([]);
          return;
        }

        const users: User[] = [];
        //  console.log(">>> user_reports", JSON.stringify(results[0].user, null, 2));

        results.forEach((result) => {
          const user = result.user;
          users.push(user);
        });

        onNext(users);
      });
    });
  }

  public static async getAllUsers2(onNext: (users: User[]) => void) {
    const results = await db("users")
      .join("addresses as ad", "ad.id", "=", "users.address_id")
      .join("genders", "genders.id", "=", "users.gender_id")
      .select(db.raw(userJson("users", "ad", "genders")));

    onNext(results as User[]);
  }
}
