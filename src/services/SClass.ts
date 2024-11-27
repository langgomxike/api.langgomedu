import { response } from "express";
import Class from "./../models/Class";
import SLog, { LogType } from "./SLog";
import SMySQL from "./SMySQL";
import User from "../models/User";
import Major from "../models/Major";
import Lesson from "../models/Lesson";
import { UserType } from "../configs/UserType";
import SFirebase, { FirebaseNode } from "./SFirebase";
import db from "../configs/knex";
import mysql from "mysql2";
import Filters from "../models/Filters";
import Pagination from "../models/Pagination";
import { parseNumericFilter } from "../configs/QueryHelpers";

export default class SClass {
  /**
   * Truy vấn tất cả các lớp học từ cơ sở dữ liệu và trả kết quả dưới dạng mảng các đối tượng Class.
   * @param onNext - Hàm callback để xử lý kết quả trả về, với tham số là mảng các lớp học (Class[]).
   */
  public static getAllClasses(onNext: (classes: Class[]) => void) {
    // Câu truy vấn SQL lấy thông tin về lớp học, giáo viên, ngành học, cấp độ lớp, và tác giả
    let sql = `SELECT DISTINCT
                JSON_OBJECT(
                    'id', classes.id,
                    'title', classes.title,
                    'description', classes.description,
                    'price', classes.price,
                    'class_creation_fee', classes.class_creation_fee,
                    'max_learners', classes.max_learners,
                    'started_at', classes.started_at,
                    'ended_at', classes.ended_at,
                    'address_1', classes.address_1,
                    'address_2', classes.address_2,
                    'address_3', classes.address_3,
                    'address_4', classes.address_4
                ) AS class,
                JSON_OBJECT(
                    'id', tutors.id,
                    'name', tutors.full_name,
                    'email', tutors.email,
                    'phone_number', tutors.phone_number,
                    'avatar', JSON_OBJECT('path', files_tutor.path)
                ) AS tutor,
                JSON_OBJECT(
                    'id', majors.id,
                    'vn_name', majors.vn_name,
                    'en_name', majors.en_name,
                    'ja_name', majors.ja_name,
                    'icon', JSON_OBJECT('path', files_major.path)
                ) AS major,
                JSON_OBJECT(
                    'id', class_levels.id,
                    'vn_name', class_levels.vn_name,
                    'en_name', class_levels.en_name,
                    'ja_name', class_levels.ja_name
                ) AS class_level,
                JSON_OBJECT(
                    'id', author.id,
                    'name', author.full_name,
                    'email', author.email,
                    'phone_number', author.phone_number,
                    'avatar', JSON_OBJECT('path', files_author.path)
                ) AS author
            FROM classes
            LEFT JOIN users AS tutors ON tutors.id = classes.tutor_id
            LEFT JOIN majors ON majors.id = classes.major_id
            LEFT JOIN class_levels ON class_levels.id = classes.class_level_id
            LEFT JOIN files AS files_tutor ON files_tutor.id = tutors.avatar_id
            LEFT JOIN files AS files_major ON files_major.id = majors.icon_id
            LEFT JOIN in_class_members ON in_class_members.class_id = classes.id
            LEFT JOIN users AS author ON author.id = classes.author_id
            LEFT JOIN files AS files_author ON files_author.id = author.avatar_id;`;

    // Lấy kết nối tới cơ sở dữ liệu
    SMySQL.getConnection((connection) => {
      // Thực hiện truy vấn SQL
      connection?.query<any[]>(sql, [], (err, result) => {
        // Xử lý khi có lỗi trong quá trình truy vấn
        if (err) {
          SLog.log(
            LogType.Error,
            "get all classes",
            "fail to get all classes in database",
            err
          );
          // Gọi callback với mảng rỗng khi gặp lỗi
          onNext([]);
          return;
        }

        // Nếu truy vấn thành công, khởi tạo mảng lưu các lớp học
        const classes: Class[] = [];

        // Duyệt qua kết quả trả về và ánh xạ vào các đối tượng Class
        result.forEach((data) => {
          const _class = data.class as Class; // Lấy đối tượng class từ cột 'class'
          _class.tutor = data.tutor as User; // Gán thông tin giáo viên
          _class.major = data.major as Major; // Gán thông tin ngành học
          _class.author = data.author as User; // Gán thông tin tác giả

          // Thêm lớp học vào mảng classes
          classes.push(_class);
        });

        // Gọi callback với mảng các lớp học đã ánh xạ
        onNext(classes);
      });
    });
  }

  public static getAuthorClasses(
    author_id: string,
    onNext: (classes: Class[]) => void
  ) {
    const sql = `SELECT 
                JSON_OBJECT(
                    'id', c.id,
                    'title', c.title,
                    'description', c.description,
                    'started_at', c.started_at,
                    'ended_at', c.ended_at,
                    'price', c.price,
                    'address_1', c.address_1,
                    'address_2', c.address_2,
                    'address_3', c.address_3,
                    'address_4', c.address_4
                ) AS class,
                JSON_OBJECT(
                    'full_name', tutors.full_name,
                    'phone_number', tutors.phone_number
                ) AS tutor,
                JSON_OBJECT(
                    'icon', JSON_OBJECT('path', icon_major.path),
                    'vn_name', majors.vn_name,
                    'en_name', majors.en_name,
                    'ja_name', majors.ja_name
                ) AS major 
            
            FROM classes c
            JOIN users tutors ON tutors.id = c.tutor_id
            JOIN majors ON majors.id = c.major_id
            JOIN files icon_major ON icon_major.id = majors.icon_id
            WHERE author_id = ?`;

    SMySQL.getConnection((connection) => {
      connection?.query<any[]>(sql, [author_id], (err, result) => {
        if (err) {
          SLog.log(
            LogType.Error,
            "get author of classes",
            "can't not get your classes"
          );
        }

        const classes: Class[] = [];
        result.forEach((data) => {
          const _class: Class = data.class as Class;
          _class.tutor = data.tutor as User;
          _class.major = data.major as Major;

          classes.push(_class);
        });

        onNext(classes);
      });
    });
  }

  public static getStudentClasses(
    student_id: number,
    onNext: (classes: Class[]) => void
  ) {}

  //Lấy chi tiết lớp học và với user id
  public static getClassDetailWithUser(
    id: number,
    userId: string,
    onNext: (_class: Class, conflictingLessons: any) => void
  ) {
    //get class
    const sql = `SELECT JSON_OBJECT(
                    'id', c.id,
                    'title', c.title,
                    'description', c.description,
                    'price', c.price,
                    'tutor', JSON_OBJECT(
                        'id', tutor.id,
                        'full_name', tutor.full_name,
                        'email', tutor.email,
                        'phone_number', tutor.phone_number,
                        'avatar', tutor.avatar
                    ),
                    'author', JSON_OBJECT(
                        'id', author.id,
                        'full_name', author.full_name,
                        'email', author.email,
                        'phone_number', author.phone_number,
                        'avatar', author.avatar
                    ),
                    'major', JSON_OBJECT(
                        'id', majors.id,
                        'icon', majors.icon,
                        'vn_name', majors.vn_name,
                        'en_name', majors.en_name,
                        'ja_name', majors.ja_name
                    ),
                    'class_level', JSON_OBJECT(
                    	'id', cl.id,
                        'vn_name', cl.vn_name,
                        'en_name', cl.en_name,
                        'ja_name', cl.ja_name
                    ),
                    'class_creaton_fee', c.class_creation_fee,
                    'type', GROUP_CONCAT(
                        DISTINCT CASE 
                            WHEN lessons.is_online = 1 THEN 'online'
                            ELSE 'offline'
                        END
                        ORDER BY CASE 
                            WHEN lessons.is_online = 1 THEN 1 
                            ELSE 2 
                        END ASC
                        SEPARATOR ', '
                    ),
                    'duration', lessons.duration,
                    'max_learners', c.max_learners,
                    'started_at', c.started_at,
                    'ended_at', c.ended_at,
                    'created_at', c.created_at,
                    'updated_at', c.updated_at,
                    'address', JSON_OBJECT (
                        "id", addresses.id,
                        "province", addresses.province,
                        "district", addresses.district,
                        "ward", addresses.ward,
                        "detail", addresses.detail
                    ),
                    'user_status', CASE 
                        WHEN c.author_id = ? THEN 'author'
                        WHEN c.tutor_id = ? THEN 'tutor'
                        WHEN class_members.user_id IS NOT NULL THEN 'member'
                        ELSE 'not_joined'
                    END,
                    'lessons', (
                      SELECT JSON_ARRAYAGG(
                          JSON_OBJECT(
                              'id', l.id,
                              'day', l.day,
                              'started_at', l.started_at,
                              'duration', l.duration,
                              'is_online', l.is_online,
                              'note', l.note
                          )
                      )
                      FROM (
                          SELECT * 
                          FROM lessons 
                          WHERE lessons.class_id = c.id
                          GROUP BY lessons.day
                          ORDER BY lessons.day ASC
                      ) l
                  )
                    ) as class
                FROM classes c
                LEFT JOIN users tutor ON tutor.id = c.tutor_id
                LEFT JOIN users author ON author.id = c.author_id
                LEFT JOIN majors ON majors.id = c.major_id
                LEFT JOIN class_levels cl ON cl.id = c.class_level_id
                LEFT JOIN lessons ON lessons.class_id = c.id
                LEFT JOIN addresses ON addresses.id = c.address_id
                LEFT JOIN class_members ON class_members.class_id = c.id AND class_members.user_id = ?
                WHERE c.id = ?
                GROUP BY c.id;`;

    SMySQL.getConnection((connection) => {
      connection?.query<any>(
        sql,
        [userId, userId, userId, id],
        (err, result) => {
          if (err) {
            SLog.log(
              LogType.Error,
              "get Class by ID",
              "can't not get class",
              err
            );
            onNext(new Class(), err);
          }

          const _class: Class = result[0].class as Class;

          this.getconflictingLessonsWithClassUsers(
            id,
            ["089204000001"],
            (data) => {
              onNext(_class, data);
            }
          );
        }
      );
    });
  }

  // Lây danh sách các buổi học bị trùng với lớp học người dùng đang học
  public static getconflictingLessonsWithClassUsers(
    classId: number,
    userIds: string[],
    onNext: (data: any[]) => void
  ) {
    const userPlaceholders = userIds.map(() => "?").join(", ");
    const sql = `
        SELECT 
        cm.user_id,
        lessons_user.class_id AS conflicting_class_id,
        lessons_user.day AS conflicting_day ,
        lessons_current.started_at,
        lessons_current.class_id AS current_class_id,
        lessons_current.day AS current_day ,
        CASE 
            WHEN lessons_user.class_id IS NOT NULL THEN TRUE
            ELSE FALSE
        END AS is_conflicting
        FROM class_members AS cm
        LEFT JOIN lessons AS lessons_current ON lessons_current.class_id = ?
        INNER JOIN lessons AS lessons_user ON lessons_user.day = lessons_current.day
            AND lessons_user.class_id = cm.class_id
            AND (
                lessons_user.started_at BETWEEN lessons_current.started_at 
                    AND (lessons_current.started_at + lessons_current.duration) OR 
                (lessons_user.started_at + lessons_user.duration) BETWEEN lessons_current.started_at 
                    AND (lessons_current.started_at + lessons_current.duration)
            )
        WHERE cm.user_id IN (${userPlaceholders}) AND lessons_user.class_id != lessons_current.class_id
        GROUP BY cm.user_id,  lessons_user.day;
    `;

    SMySQL.getConnection((connection) => {
      connection?.query<any>(sql, [classId, ...userIds], (err, result) => {
        if (err) {
          SLog.log(
            LogType.Error,
            "get conflicting lessons with class users",
            "can't not get conflicting lessons",
            err
          );
          onNext([]);
        }

        onNext(result);
      });
    });
  }

  public static getClassesByKey(
    key: string,
    onNext: (classes: Class[]) => void
  ) {}

  public static classJsonSQL = `
  JSON_OBJECT(
        'id', classes.id ,
        'title', classes.title ,
        'description', classes.description,
        'price', classes.price,
        'class_creation_fee', classes.class_creation_fee,
        'max_learners', classes.max_learners,
        'started_at', classes.started_at,
        'ended_at', classes.ended_at,
        'admin_accepted', classes.admin_accepted,
       	'author_accepted', classes.author_accepted,
        'created_at', classes.created_at,
        'updated_at', classes.updated_at,
        'address', JSON_OBJECT (
            "id", addresses.id,
            "province", addresses.province,
            "district", addresses.district,
            "ward", addresses.ward,
            "detail", addresses.detail
        ),
        'tutor', JSON_OBJECT(
          'id', tutor.id,
          'full_name', tutor.full_name,
          'email', tutor.email,
          'phone_number', tutor.phone_number,
          'avatar', tutor.avatar
        ),
        'author', JSON_OBJECT(
            'id', author.id,
            'full_name', author.full_name,
            'email', author.email,
            'phone_number', author.phone_number,
            'avatar', author.avatar
        ),
        'major', JSON_OBJECT(
        'id', majors.id,
        'vn_name', majors.vn_name,
        'en_name', majors.en_name,
        'ja_name', majors.ja_name,
        'icon', majors.icon ),
      'class_level', JSON_OBJECT(
        'id', class_levels.id,
        'vn_name', class_levels.vn_name,
        'en_name', class_levels.en_name,
        'ja_name', class_levels.ja_name
      ),
      'type', GROUP_CONCAT(
      DISTINCT CASE 
          WHEN lessons.is_online = 1 THEN 'online'
          ELSE 'offline'
      END
      ORDER BY CASE 
          WHEN lessons.is_online = 1 THEN 1 
          ELSE 2 
      END ASC
      SEPARATOR ', '
      )
    ) AS class
  `;

  // Lấy danh sách lớp học gợi

  public static getSuggestsClasses(
    userId: string,
    userType: number,
    filter: Filters,
    sortBy: string,
    page: number,
    perPage: number,
    onNext: (classes: Class[], pagination: Pagination) => void
  ) {
    // Xác định điều kiện WHERE theo userType
    const condition =
      userType === UserType.TUTOR
        ? `classes.tutor_id IS NULL AND classes.author_id != ? AND class_members.user_id IS NULL`
        : `classes.author_id != ? AND  classes.tutor_id IS NULL AND class_members.user_id IS NULL`;

    // Tạo các điều kiện lọc động
    // Tạo các điều kiện lọc động
    let filterConditions = "";

    if (filter.minPrice) {
      filterConditions += ` AND classes.price >= ?`;
    }
    if (filter.maxPrice) {
      filterConditions += ` AND classes.price <= ?`;
    }

    if (filter.province) {
      const provinces = filter.province.split(",").map((p) => `%{p.strim()%}`);
      filterConditions += ` AND (${provinces
        .map(() => "addresses.province LIKE ?")
        .join(" OR ")})`;
    }

    if (filter.district) {
      const districts = filter.district.split(",").map((d) => `%${d.trim()}%`);
      filterConditions += ` AND (${districts
        .map(() => "addresses.district LIKE ?")
        .join(" OR ")})`;
    }

    if (filter.ward) {
      const wards = filter.ward.split(",").map((w) => `%${w.trim()}%`);
      filterConditions += ` AND (${wards
        .map(() => "addresses.ward LIKE ?")
        .join(" OR ")})`;
    }

    if (filter.major) {
      const majors = filter.major.split(",").map(Number);
      filterConditions += ` AND classes.major_id IN (${majors
        .map(() => "?")
        .join(",")})`;
    }

    if (filter.classLevelId) {
      const classLevels = filter.classLevelId.split(",").map(Number);
      filterConditions += ` AND classes.class_level_id IN (${classLevels
        .map(() => "?")
        .join(",")})`;
    }

    if (filter.maxLearners) {
      filterConditions += ` AND classes.max_learners <= ?`;
    }
    if (filter.isOnline !== undefined) {
      filterConditions += ` AND lessons.is_online = ?`;
    }
    if (filter.startedAtMin) {
      filterConditions += ` AND DATE(FROM_UNIXTIME(classes.started_at / 1000)) >= DATE(FROM_UNIXTIME(? / 1000))`;
    }
    if (filter.endedAtMax) {
      filterConditions += ` AND DATE(FROM_UNIXTIME(classes.ended_at / 1000)) <= DATE(FROM_UNIXTIME(? / 1000))`;
    }

    let orderBy = sortBy.toLowerCase();
    switch (orderBy) {
      case "priceasc":
        orderBy = "ORDER BY classes.price ASC";
        break;
      case "pricedesc":
        orderBy = "ORDER BY classes.price DESC";
        break;
      case "startedatasc":
        orderBy = "ORDER BY classes.started_at ASC";
        break;
      case "startedatdesc":
        orderBy = "ORDER BY classes.started_at DESC";
        break;
      default:
        orderBy = "ORDER BY classes.title ASC"; // Mặc định nếu không khớp
    }

    // SQL query to fetch class information, including tutor, major, and class level details
    const sql = `
    WITH SuggestedClasses AS (
      SELECT
        ${this.classJsonSQL}
      FROM classes
      LEFT JOIN users tutor ON tutor.id = classes.tutor_id
      LEFT JOIN users author ON author.id = classes.author_id
      LEFT JOIN majors ON majors.id = classes.major_id
      LEFT JOIN class_levels ON class_levels.id = classes.class_level_id
      LEFT JOIN addresses ON addresses.id = classes.address_id
      LEFT JOIN lessons ON lessons.class_id = classes.id
      LEFT JOIN class_members ON class_members.class_id = classes.id AND class_members.user_id = ?
      WHERE classes.admin_accepted = 1 AND ${condition} ${filterConditions}
      GROUP BY classes.id
    ),
    RandomClasses AS (
      SELECT
        ${this.classJsonSQL}
      FROM classes
      LEFT JOIN users tutor ON tutor.id = classes.tutor_id
      LEFT JOIN users author ON author.id = classes.author_id
      LEFT JOIN majors ON majors.id = classes.major_id
      LEFT JOIN class_levels ON class_levels.id = classes.class_level_id
      LEFT JOIN addresses ON addresses.id = classes.address_id
      LEFT JOIN lessons ON lessons.class_id = classes.id
      LEFT JOIN class_members ON class_members.class_id = classes.id AND class_members.user_id = ?
      WHERE classes.admin_accepted = 1 AND ${condition} AND classes.id NOT IN (SELECT classes.id FROM SuggestedClasses)
      GROUP BY classes.id
    ),

    CombinedClasses AS (
    SELECT * FROM SuggestedClasses
    UNION ALL
    SELECT * FROM RandomClasses
    )

    SELECT
    (SELECT COUNT(*) FROM CombinedClasses) AS totalCount,
    CombinedClasses.*
    FROM CombinedClasses

    LIMIT ${perPage} OFFSET ${(page - 1) * perPage};
  `;

    // Thay thế các giá trị điều kiện theo userType và các filter
    const params = [
      ...(userType === UserType.TUTOR ? [userId, userId] : [userId, userId]),
      filter.minPrice,
      filter.maxPrice,
      ...(filter.province?.split(",") || []),
      ...(filter.district?.split(",") || []),
      ...(filter.ward?.split(",") || []),
      ...(parseNumericFilter(filter.major) || []),
      ...(parseNumericFilter(filter.classLevelId) || []),
      filter.maxLearners,
      ...(userType === UserType.TUTOR ? [userId, userId] : [userId, userId]),
    ].filter((param) => param !== undefined);

    // console.log(mysql.format(sql, params));
    // console.log(params);

    // Get a database connection
    SMySQL.getConnection((connection) => {
      // Execute the SQL query with the provided user_id as a parameter
      connection?.execute<any[]>(sql, params, (err, rows) => {
        if (err) {
          // If an error occurs, return an empty array to the callback
          onNext([], new Pagination());
          console.log("getSuggestedClasses", err);

          return;
        }

        const classes: Class[] = [];
        const totalCount = rows[0]?.totalCount;

        // Iterate through` each row from the query result
        rows.forEach((row) => {
          const _class = row.class;
          classes.push(_class);
        });

        const pagination: Pagination = {
          page: page,
          perPage: perPage,
          total_pages: Math.ceil(totalCount / perPage),
          total_items: totalCount,
        };

        // Return the list of classes via the callback function
        return onNext(classes, pagination);
      });
    });
  }

  // public static getSuggestedClasses(
  //   userId: string,
  //   userType: number,
  //   onNext: (classes: Class[], pagination: Pagination) => void,
  //   page: number,
  //   perPage: number,
  //   province?: string,
  //   district?: string,
  //   ward?: string,
  //   majorIds?: string,
  //   classLevelIds?: string,
  // ){

  //     const condition =
  //     userType === UserType.TUTOR
  //       ? ` classes.tutor_id IS NULL AND classes.author_id != ? AND class_members.user_id IS NULL`
  //       : ` classes.author_id != ? AND classes.tutor_id IS NULL AND class_members.user_id IS NULL`;

  //       let filterConditions = ""
  //       if (province || district || ward) {
  //         filterConditions = `(addresses.province = ? OR addresses.district = ? OR addresses.ward = ?)`;
  //       }

  //       if (majorIds) {
  //         const majors = majorIds.split(",").map(Number);
  //         filterConditions += ` AND classes.major_id IN (${majors.map(() => "?").join(",")})`;
  //       }

  //       if (classLevelIds) {
  //         const classLevels = classLevelIds.split(",").map(Number);
  //         filterConditions += ` AND classes.class_level_id IN (${classLevels.map(() => "?").join(",")})`;
  //       }

  //   const sql = `
  //     -- Truy vấn chính lấy lớp học liên quan đến người dùng
  //         WITH RelevantClasses AS (
  //           SELECT
  //              ${this.classJsonSQL}
  //           FROM classes
  //           LEFT JOIN users tutor ON tutor.id = classes.tutor_id
  //           LEFT JOIN users author ON author.id = classes.author_id
  //           LEFT JOIN lessons ON lessons.class_id = classes.id
  //           LEFT JOIN addresses ON classes.address_id = addresses.id
  //           LEFT JOIN majors ON classes.major_id = majors.id
  //           LEFT JOIN class_levels ON classes.class_level_id = class_levels.id
  //           LEFT JOIN class_members ON class_members.class_id = classes.id AND class_members.user_id = ?
  //           WHERE  ${condition} ${filterConditions}
  //         ),
  //         RandomClasses AS (
  //           -- Truy vấn lớp học ngẫu nhiên nếu không có lớp liên quan
  //           SELECT
  //              ${this.classJsonSQL}
  //           FROM classes
  //           LEFT JOIN users tutor ON tutor.id = classes.tutor_id
  //           LEFT JOIN users author ON author.id = classes.author_id
  //           LEFT JOIN lessons ON lessons.class_id = classes.id
  //           LEFT JOIN addresses ON classes.address_id = addresses.id
  //           LEFT JOIN majors ON classes.major_id = majors.id
  //           LEFT JOIN class_levels ON classes.class_level_id = class_levels.id
  //           LEFT JOIN class_members ON class_members.class_id = classes.id AND class_members.user_id = ?
  //           WHERE
  //             ${condition}
  //           ORDER BY RAND()
  //         )
  //         -- Lấy dữ liệu lớp học có phân trang
  //         SELECT *
  //         FROM (
  //           SELECT * FROM RelevantClasses
  //           UNION ALL
  //           SELECT * FROM RandomClasses
  //         ) AS CombinedClasses
  //         LIMIT ${perPage} OFFSET ${(page -1) * perPage};
  //   `;

  //   const totleSQL = `-- Truy vấn đếm tổng số lớp học
  //   WITH RelevantClasses AS (
  //     SELECT 1
  //     FROM classes
  //     LEFT JOIN users tutor ON tutor.id = classes.tutor_id
  //     LEFT JOIN users author ON author.id = classes.author_id
  //     LEFT JOIN lessons ON lessons.class_id = classes.id
  //     LEFT JOIN addresses ON classes.address_id = addresses.id
  //     LEFT JOIN majors ON classes.major_id = majors.id
  //     LEFT JOIN class_levels ON classes.class_level_id = class_levels.id
  //     LEFT JOIN class_members ON class_members.class_id = classes.id AND class_members.user_id = ?
  //     WHERE
  //       (addresses.province = ? OR addresses.district = ? OR addresses.ward = ?)
  //       AND majors.id = ?
  //       AND class_levels.id = ?
  //       ${condition}
  //   ),
  //   RandomClasses AS (
  //     SELECT 1
  //     FROM classes
  //     LEFT JOIN users tutor ON tutor.id = classes.tutor_id
  //     LEFT JOIN users author ON author.id = classes.author_id
  //     LEFT JOIN lessons ON lessons.class_id = classes.id
  //     LEFT JOIN addresses ON classes.address_id = addresses.id
  //     LEFT JOIN majors ON classes.major_id = majors.id
  //     LEFT JOIN class_levels ON classes.class_level_id = class_levels.id
  //     LEFT JOIN class_members ON class_members.class_id = classes.id AND class_members.user_id = ?
  //     WHERE
  //       ${condition}
  //   )
  //   -- Tính tổng số lượng lớp học
  //   SELECT COUNT(*) AS total_items
  //   FROM (
  //     SELECT * FROM RelevantClasses
  //     UNION ALL
  //     SELECT * FROM RandomClasses
  //   ) AS CombinedClasses;
  //   `;

  //   const params = [
  //     ...(userType === UserType.TUTOR ? [userId, userId] : [userId, userId]),
  //     province,
  //     district,
  //     ward,
  //     ...(parseNumericFilter(majorIds) || []),
  //     ...(parseNumericFilter(classLevelIds) || []),
  //     ...(userType === UserType.TUTOR ? [userId, userId] : [userId, userId]),
  //   ].filter((param) => param !== undefined);

  //   console.log(mysql.format(sql, params));
  //   console.log(params);

  //   SMySQL.getConnection((connection) => {
  //     connection?.execute<any[]>(sql, params, (err, rows) => {
  //       if (err) {
  //         onNext([], new Pagination);
  //         return;
  //       }

  //       const classes: Class[] = [];

  //       rows.forEach((row) => {
  //         const classData = row.class;
  //         classes.push(classData);
  //       });

  //       connection.execute<any>(totleSQL, params, (err2, result) => {
  //         if (err2) {
  //           console.log("Error in detail query:", err2);
  //           onNext([], new Pagination());
  //           return;
  //         }

  //         const pagination: Pagination = {
  //           page: page,
  //           perPage: perPage,
  //           total_pages: Math.ceil(result[0].total_classes / perPage),
  //           total_items: result[0].total_classes,
  //         };

  //         return onNext(classes, pagination);
  //       });

  //     });
  //   });
  // }

  // Lấy danh sách  lớp học liên quan
  public static getRelatedClasses(
    major_id: number | undefined,
    class_id: number,
    onNext: (classes: Class[]) => void
  ) {
    //get related classes
    const sql_related_classes = `SELECT 
                    JSON_OBJECT(
                    'id', c.id,
                    'title', c.title,
                    'description', c.description,
                    'price', c.price,
                    'tutor', JSON_OBJECT(
                        'id', tutor.id,
                        'full_name', tutor.full_name,
                        'email', tutor.email,
                        'phone_number', tutor.phone_number,
                        'avatar', JSON_OBJECT(
                            'id', tutor_avatar.id,
                            'name', tutor_avatar.name,
                            'path', tutor_avatar.path,
                            'capacity', tutor_avatar.capacity,
                            'image_width', tutor_avatar.image_with,
                            'image_height', tutor_avatar.image_height,
                            'created_at', tutor_avatar.created_at,
                            'updated_at', tutor_avatar.updated_at
                        )
                    ),
                    'author', JSON_OBJECT(
                        'id', tutor.id,
                        'full_name', tutor.full_name,
                        'email', tutor.email,
                        'phone_number', tutor.phone_number,
                        'avatar', JSON_OBJECT(
                            'id', tutor_avatar.id,
                            'name', tutor_avatar.name,
                            'path', tutor_avatar.path,
                            'capacity', tutor_avatar.capacity,
                            'image_width', tutor_avatar.image_with,
                            'image_height', tutor_avatar.image_height,
                            'created_at', tutor_avatar.created_at,
                            'updated_at', tutor_avatar.updated_at
                        )
                    ),
                    'major', JSON_OBJECT(
                        'id', majors.id,
                        'icon', JSON_OBJECT(
                            'id', major_icon.id,
                            'name', major_icon.name,
                            'path', major_icon.path,
                            'image_width', major_icon.image_with,
                            'image_height', major_icon.image_height,
                            'created_at', major_icon.created_at,
                            'updated_at', major_icon.updated_at
                        ),
                        'vn_name', majors.vn_name,
                        'en_name', majors.en_name,
                        'ja_name', majors.ja_name
                    ),
                    'class_level', JSON_OBJECT(
                    	'id', cl.id,
                        'vn_name', cl.vn_name,
                        'en_name', cl.en_name,
                        'ja_name', cl.ja_name
                    ),
                    'class_creaton_fee', c.class_creation_fee,
                    'type', JSON_ARRAYAGG(
                       		CASE WHEN lessons.is_online = 1 THEN 'online'
                        		ELSE 'offline'
                        	END
                    ),
                    'duration', lessons.duration,
                    'max_learners', c.max_learners,
                    'started_at', c.started_at,
                    'ended_at', c.ended_at,
                    'created_at', c.created_at,
                    'updated_at', c.updated_at,
                    'address_1', c.address_1,
                    'address_2', c.address_2,
                    'address_3', c.address_3,
                    'address_4', c.address_4
                    ) as class
                FROM classes c
                LEFT JOIN users tutor ON tutor.id = c.tutor_id
                LEFT JOIN files tutor_avatar ON tutor_avatar.id = tutor.avatar_id
                LEFT JOIN users author ON author.id = c.author_id
                LEFT JOIN files author_avatar ON author_avatar.id = author.avatar_id
                LEFT JOIN majors ON majors.id = c.major_id
                LEFT JOIN files major_icon ON major_icon.id = majors.icon_id
                LEFT JOIN class_levels cl ON cl.id = c.class_level_id
                LEFT JOIN lessons ON lessons.class_id = c.id
                WHERE c.major_id = ? AND c.id = ?
                GROUP BY c.id;`;

    const related_classes: Class[] = [];

    SMySQL.getConnection((connection) => {
      connection?.query<any>(
        sql_related_classes,
        [major_id, class_id],
        (err, result) => {
          // console.log(major_id);
          if (err) {
            SLog.log(
              LogType.Error,
              "get related classes",
              "can't not get classes related with major",
              err
            );
            onNext([]);
            return;
          }

          result.forEach((data) => {
            const related_class = data.class as Class;
            related_classes.push(related_class);
          });
          // console.log(related_classes);

          onNext(related_classes);
        }
      );
    });
  }

  // Lấy danh sách lớp học của người dùng
  public static getClassByUserId(userId: string, onNext: (classes: Class[]) => void) {
    // SQL query to fetch class information, including tutor, major, and class level details
    const sql = `SELECT 
                    ${this.classJsonSQL}
                  FROM classes
                  LEFT JOIN users tutor ON tutor.id = classes.tutor_id
                  LEFT JOIN users author ON author.id = classes.author_id
                  LEFT JOIN majors ON majors.id = classes.major_id
                  LEFT JOIN class_levels class_levels ON class_levels.id = classes.class_level_id
                  LEFT JOIN addresses ON addresses.id = classes.address_id
                  LEFT JOIN lessons ON lessons.class_id = classes.id
                  LEFT JOIN class_members ON class_members.class_id = classes.id AND class_members.user_id = ?
                  WHERE classes.tutor_id = ? OR classes.author_id = ? OR class_members.user_id IS NOT NULL 
                   GROUP BY classes.id;`;

      // console.log("", mysql.format(sql, [userId, userId, userId]));
      
    // Get a database connection
    SMySQL.getConnection((connection) => {
      // Execute the SQL query with the provided user_id as a parameter
      connection?.execute<any[]>(sql, [userId, userId, userId], (err, rows) => {
        if (err) {
          // If an error occurs, return an empty array to the callback
          console.log("Get class by user id: ", err);
          
          onNext([]);
          return;
        }

        const classes: Class[] = [];

        rows.forEach((row) => {
          const classData = {
            ...row.class,
            author_accepted: !!row.class.author_accepted,
            admin_accepted: !!row.class.admin_accepted
          };
          classes.push(classData);
        });

        return onNext(classes);
      });
    });
  }

  public static storeClass(
    createdClass: Class,
    onNext: (id: number | undefined) => void
  ) {
    let sql = "";
    const insertCols: string[] = [];
    const insertValues: Array<String | number> = [];
  }

  /**
   * Updates a class record in the database based on the provided class details.
   *
   * @param updatedClass - The class object containing the updated details.
   * @param onNext - Callback function to handle the result of the update operation.
   */
  public static updateClass(
    updatedClass: Class,
    onNext: (result: boolean) => void
  ) {
    // // Initialize the SQL statement for updating the 'classes' table
    // let sql = "UPDATE `classes` SET ";
    // const updateCols: string[] = []; // Array to hold the columns to be updated
    // const updateValues: Array<string | number> = []; // Array to hold the values corresponding to the columns
    // // Conditionally add the 'title' column if the title length is within the valid range
    // if (
    //   updatedClass.title &&
    //   updatedClass.title.length >= 3 &&
    //   updatedClass.title.length <= 255
    // ) {
    //   updateCols.push("`title`=?");
    //   updateValues.push(updatedClass.title);
    // }
    // // Conditionally add the 'description' column if it is provided
    // if (updatedClass.description) {
    //   updateCols.push("`description`=?");
    //   updateValues.push(updatedClass.description);
    // }
    // // Conditionally add the 'major_id' column if a valid major ID is provided
    // if (updatedClass.major?.id) {
    //   updateCols.push("`major_id`=?");
    //   updateValues.push(updatedClass.major.id);
    // }
    // // Conditionally add the 'tutor_id' column if a valid tutor ID is provided
    // if (updatedClass.tutor?.id) {
    //   updateCols.push("`tutor_id`=?");
    //   updateValues.push(updatedClass.tutor.id);
    // }
    // // Conditionally add the 'price' column if a price is provided
    // if (updatedClass.price) {
    //   updateCols.push("`price`=?");
    //   updateValues.push(updatedClass.price);
    // }
    // // Conditionally add the 'class_creation_fee' column if it is provided
    // if (updatedClass.class_creation_fee) {
    //   updateCols.push("`class_creation_fee`=?");
    //   updateValues.push(updatedClass.class_creation_fee);
    // }
    // // Conditionally add the 'class_level_id' column if a valid class level ID is provided
    // if (updatedClass.class_level?.id) {
    //   updateCols.push("`class_level_id`=?");
    //   updateValues.push(updatedClass.class_level.id);
    // }
    // // Conditionally add the 'max_learners' column if the maximum number of learners is provided
    // if (updatedClass.max_learners) {
    //   updateCols.push("`max_learners`=?");
    //   updateValues.push(updatedClass.max_learners);
    // }
    // // Conditionally add the 'started_at' column if the start date is provided
    // if (updatedClass.started_at) {
    //   updateCols.push("`started_at`=?");
    //   updateValues.push(updatedClass.started_at);
    // }
    // // Conditionally add the 'ended_at' column if the end date is provided
    // if (updatedClass.ended_at) {
    //   updateCols.push("`ended_at`=?");
    //   updateValues.push(updatedClass.ended_at);
    // }
    // // Conditionally add address columns if they are provided
    // if (updatedClass.address_1) {
    //   updateCols.push("`address_1`=?");
    //   updateValues.push(updatedClass.address_1);
    // }
    // // Conditionally add the 'address_2' column if the second address line is provided
    // if (updatedClass.address_2) {
    //   updateCols.push("`address_2`=?"); // Add the 'address_2' column to the list of columns to update
    //   updateValues.push(updatedClass.address_2); // Add the corresponding value for 'address_2'
    // }
    // // Conditionally add the 'address_3' column if the third address line is provided
    // if (updatedClass.address_3) {
    //   updateCols.push("`address_3`=?"); // Add the 'address_3' column to the list of columns to update
    //   updateValues.push(updatedClass.address_3); // Add the corresponding value for 'address_3'
    // }
    // // Conditionally add the 'address_4' column if the fourth address line is provided
    // if (updatedClass.address_4) {
    //   updateCols.push("`address_4`=?"); // Add the 'address_4' column to the list of columns to update
    //   updateValues.push(updatedClass.address_4); // Add the corresponding value for 'address_4'
    // }
    // // Build the final SQL statement by appending updated columns and setting the updated timestamp
    // sql += updateCols.map((col) => col + ", ").join(" ");
    // sql += " `updated_at`=? WHERE id = ?";
    // // Execute the SQL statement using a MySQL connection
    // SMySQL.getConnection((connection) => {
    //   connection?.execute(
    //     sql,
    //     [...updateValues, new Date().getTime(), updatedClass.id],
    //     (error) => {
    //       // If an error occurs, log the error and invoke the callback with 'false'
    //       if (error) {
    //         onNext(false);
    //         SLog.log(
    //           LogType.Error,
    //           "updateClass",
    //           "Cannot update class",
    //           error
    //         );
    //         return;
    //       }
    //       // If the update is successful, log success and invoke the callback with 'true'
    //       onNext(true);
    //       SLog.log(LogType.Error, "updateClass", "Update class successfully");
    //       return;
    //     }
    //   );
    // });
  }

  /**
   * Soft deletes a class by setting the 'ended_at' and 'updated_at' fields in the database.
   *
   * @param id - The ID of the class to be deleted.
   * @param onNext - Callback function to handle the result of the deletion operation.
   */
  public static softDeleteClass(id: number, onNext: (result: boolean) => void) {
    // // SQL statement for performing a soft delete by updating the 'ended_at' and 'updated_at' fields
    // const sql = "UPDATE classes SET ended_at = ?, updated_at = ? WHERE id = ?";
    // const endedAt = new Date().getTime() - 1000; // Set the ended time to the current time minus one second
    // const updatedAt = new Date().getTime(); // Set the updated time to the current time
    // // Execute the SQL statement using a MySQL connection
    // SMySQL.getConnection((connection) => {
    //   connection?.execute(sql, [endedAt, updatedAt, id], (error) => {
    //     // If an error occurs, log the error and invoke the callback with 'false'
    //     if (error) {
    //       onNext(false);
    //       SLog.log(
    //         LogType.Error,
    //         "softDeleteClass",
    //         "Cannot delete class",
    //         error
    //       );
    //       return;
    //     }
    //     // If the deletion is successful, log success and invoke the callback with 'true'
    //     onNext(true);
    //     SLog.log(LogType.Error, "softDeleteClass", "Delete class successfully");
    //     return;
    //   });
    // });
  }

  /**
   * @param newClass
   * @param onNext
   */

  public static getClassLevels(
    onNext: (result: boolean, classLevels?: number[]) => void
  ) {
    const sql = "SELECT id FROM lessons";

    SMySQL.getConnection((connection) => {
      connection?.query(sql, (err, results) => {
        if (err) {
          SLog.log(
            LogType.Error,
            "getClassLevels",
            "Failed to fetch class levels",
            err
          );
          onNext(false);
          return;
        }
        // Trả về danh sách id của class_levels
        if (Array.isArray(results)) {
          const classLevels = results.map((row: any) => row.id);
          onNext(true, classLevels);
        } else {
          // Trường hợp không phải là mảng, trả về lỗi
          SLog.log(
            LogType.Error,
            "getClassLevels",
            "Unexpected result format",
            results
          );
          onNext(false);
        }
      });
    });
  }

  // public static createClass(
  //   title: string,
  //   description: string,
  //   major_id: number,
  //   class_level_id: number,
  //   price: number,
  //   started_at: number,
  //   ended_at: number,
  //   lessons: Lesson[],
  //   onNext: (result: boolean, insertId?: number) => void
  // ) {
  //   const sql =
  //     "INSERT INTO classes (title, description, major_id, price, class_level_id, started_at, ended_at) VALUES (?,?,?,?,?,?,?)";

  //   //class_level_id:  lấy danh sách cấp học -> lưu lại id
  //   // bỏ mô tả và yêu cầu trong giao diện

  //   SMySQL.getConnection((connection) => {
  //     connection?.execute(
  //       sql,
  //       [
  //         title,
  //         description,
  //         major_id,
  //         price,
  //         class_level_id,
  //         started_at,
  //         ended_at,
  //       ],
  //       (err, result) => {
  //         if (err) {
  //           // Xử lý khi có lỗi
  //           SLog.log(
  //             LogType.Error,
  //             "addNewClass",
  //             "Failed to insert new class",
  //             err
  //           );
  //           onNext(false);
  //           return;
  //         }
  //         // Trả về kết quả thành công và ID của lớp học vừa thêm
  //         const classId = (result as any).insertId || undefined;
  //         onNext(true, classId); // tìm cách trả về ID lớp vừa tạo

  //         // Chuẩn bị dữ liệu cho việc chèn nhiều dòng trong bảng lessons
  //         if (lessons.length > 0) {
  //           const values: any[] = [];
  //           lessons.forEach((lesson) => {
  //             values.push(
  //               classId,
  //               lesson.day,
  //               lesson.started_at,
  //               lesson.duration,
  //               lesson.is_online
  //             );
  //           });
  //           console.log("values: " + values);

  //           // Xây dựng câu truy vấn `INSERT` với nhiều giá trị
  //           const placeholders = lessons.map(() => "(?,?,?,?,?)").join(",");
  //           const sqlLesson = `INSERT INTO lessons (class_id, day, started_at, duration, is_online) VALUES ${placeholders}`;

  //           console.log("sql lesson: ", sqlLesson);

  //           connection.execute(sqlLesson, values, (lessonErr) => {
  //             if (lessonErr) {
  //               SLog.log(
  //                 LogType.Error,
  //                 "addLessons",
  //                 "Failed to insert lessons",
  //                 lessonErr
  //               );
  //               onNext(false);
  //             } else {
  //               onNext(true, classId); // thanh cong tra ve id cho lop
  //             }
  //           });
  //         } else {
  //           onNext(true, classId);
  //         }
  //       }
  //     );
  //   });
  // }

  // Join class by leaner

  public static createClass(
    title: string,
    description: string,
    major_id: number,
    class_level_id: number,
    price: number,
    started_at: number,
    ended_at: number,
    lessons: Lesson[],
    onNext: (result: boolean, insertId?: number) => void
  ) {
    const sql =
      "INSERT INTO classes (title, description, major_id, price, class_level_id, started_at, ended_at) VALUES (?,?,?,?,?,?,?)";

    SMySQL.getConnection((connection) => {
      if (!connection) {
        onNext(false);
        return;
      }

      connection.beginTransaction((transactionErr) => {
        if (transactionErr) {
          onNext(false);
          return;
        }

        connection.execute(
          sql,
          [
            title,
            description,
            major_id,
            price,
            class_level_id,
            started_at,
            ended_at,
          ],
          (classErr, result) => {
            if (classErr) {
              connection.rollback(() => onNext(false));
              return;
            }

            const classId = (result as any).insertId || undefined;
            if (!classId) {
              onNext(false);
              return;
            }

            // Kiểm tra nếu không có bài học để thêm, commit ngay
            if (lessons.length === 0) {
              connection.commit((commitErr) => {
                if (commitErr) {
                  onNext(false);
                } else {
                  onNext(true, classId);
                }
              });
              return;
            }

            // Thêm các bài học vào bảng lessons
            const values: any[] = [];
            lessons.forEach((lesson) => {
              values.push(
                classId,
                lesson.day,
                lesson.started_at,
                lesson.duration,
                lesson.is_online
              );
            });

            const placeholders = lessons.map(() => "(?,?,?,?,?)").join(",");
            const sqlLesson = `INSERT INTO lessons (class_id, day, started_at, duration, is_online) VALUES ${placeholders}`;

            connection.execute(sqlLesson, values, (lessonErr) => {
              if (lessonErr) {
                connection.rollback(() => onNext(false));
                return;
              }

              connection.commit((commitErr) => {
                if (commitErr) {
                  onNext(false);
                } else {
                  onNext(true, classId);
                }
              });
            });
          }
        );
      });
    });
  }

  public static joinClass(
    classId: number,
    userIds: string[],
    onNext: (message, result) => void
  ) {
    console.log(">>> user ids", userIds);
    console.log(">>> class id", classId);

    // Khởi tạo mảng tham số và chuỗi giá trị
    let values = "";
    const params: any[] = [];

    userIds.forEach((userId, index) => {
      values += `(?, ?)`;
      if (index < userIds.length - 1) values += ", ";

      // Thêm classId và userId vào params
      params.push(classId, userId);
    });

    const sql = `
          INSERT INTO class_members (class_id, user_id)
          VALUES ${values}
          `;

    SMySQL.getConnection((connection) => {
      // Thực thi câu lệnh SQL
      connection?.execute(sql, params, (err, result) => {
        if (err) {
          return onNext(
            `Error inserting users into class: ${err.message}`,
            false
          );
        }
        SFirebase.push(
          FirebaseNode.Classes,
          [{ key: FirebaseNode.ClassId, value: classId }],
          () => {
            onNext(`Join in class id: ${classId} successful!`, true);
          }
        );
      });
    });
  }

  // Accpet class to tech
  public static acceptClassToTeach(
    classId: number,
    tutorId: string,
    onNext: (message, result) => void
  ) {
    // Truy vấn để kiểm tra xem lớp học đã có gia sư hoặc người tham gia hay chưa
    const checkSql = `SELECT classes.tutor_id FROM classes WHERE classes.id = ?; `;

    const updateSql = ` UPDATE classes SET tutor_id =?, updated_at = ?  WHERE id =?`;

    SMySQL.getConnection((connection) => {
      connection?.execute<any>(checkSql, [classId], (error, results) => {
        if (error) {
          onNext(error, false);
          return;
        }

        const classInfo = results[0];
        if (classInfo && (classInfo.tutor_id || classInfo.member_count > 0)) {
          const errorMessage = "Class already has a tutor.";
          onNext(errorMessage, false);
          console.log(">>> error:", errorMessage);
          return;
        }

        // Nếu lớp chưa có gia sư và không có thành viên tham gia, thực hiện cập nhật
        connection.execute<any>(
          updateSql,
          [tutorId, new Date().getTime(), classId],
          (updateError, updateResults) => {
            if (updateError) {
              onNext(updateError, false);
              return;
            }

            if (updateResults && updateResults.affectedRows > 0) {
              onNext("Class accepted by tutor successfully", true);
              console.log(">>> Class accepted by tutor successfully");
            } else {
              const errorMessage =
                "No class was updated. Possibly invalid class ID.";
              onNext(errorMessage, false);
              console.log(">>> error:", errorMessage);
            }
          }
        );
      });
    });
  }
  //khoá lớp học
  //  UPDATE classes
  // SET status = 1
  // WHERE class_id = your_class_id
  // LIMIT 1;
  public static LockClass(class_id: string, onNext: (result: boolean) => void) {
    // Câu truy vấn SQL để khóa lớp học
    const sql = `
  UPDATE classes
  SET ended_at = (UNIX_TIMESTAMP() * 1000)
  WHERE id = ?
  LIMIT 1;
`;

    // Lấy kết nối và thực thi truy vấn
    SMySQL.getConnection((connection) => {
      connection?.execute(
        sql,
        [class_id], // Truyền vào `class_id` làm tham số
        (error, result) => {
          // Nếu có lỗi, ghi log lỗi và gọi callback với `false`
          if (error) {
            onNext(false);
            SLog.log(LogType.Error, "LockClass", "Cannot lock class", error);
            return;
          }

          // Nếu thành công, ghi log và gọi callback với `true`
          SLog.log(LogType.Info, "LockClass", "Locked class successfully");
          onNext(true);
        }
      );
    });
  }
}
