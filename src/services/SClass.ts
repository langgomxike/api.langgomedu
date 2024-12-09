import { response } from "express";
import Class, { classJson } from "./../models/Class";
import SLog, { LogType } from "./SLog";
import SMySQL from "./SMySQL";
import User from "../models/User";
import Major from "../models/Major";
import Lesson from "../models/Lesson";
import { UserType } from "../configs/UserType";
import SFirebase, { FirebaseNode } from "./SFirebase";
import db from "../configs/knex";
import * as mysql from "mysql2";
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
    classId: number,
    userId: string,
    onNext: (_class: Class, memberInClass: User[]) => void
  ) {
    //get class
    const sql = `SELECT JSON_OBJECT(
                                'id', c.id,
                                'title', c.title,
                                'description', c.description,
                                'price', c.price,
                                'class_creation_fee', c.class_creation_fee,
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
                                'address', JSON_OBJECT(
                                        "id", addresses.id,
                                        "province", addresses.province,
                                        "district", addresses.district,
                                        "ward", addresses.ward,
                                        "detail", addresses.detail
                                           ),
                                'author_accepted', c.author_accepted,
                                'admin_accepted', c.admin_accepted,
                                'paid', c.paid,
                                'paid_path', c.paid_path,
                                'created_at', c.created_at,
                                'updated_at', c.updated_at,
                                'user_status', CASE
                                                   WHEN c.author_id = ? AND c.tutor_id = ? THEN 'author_and_tutor'
                                                   WHEN c.author_id = ? THEN 'author'
                                                   WHEN c.tutor_id = ? THEN 'tutor'
                                                   WHEN class_members.user_id IS NOT NULL THEN 'member'
                                                   ELSE 'not_joined'
                                    END,
                                'lessons', (SELECT JSON_ARRAYAGG(
                                                           JSON_OBJECT(
                                                                   'id', l.id,
                                                                   'day', l.day,
                                                                   'started_at', l.started_at,
                                                                   'duration', l.duration,
                                                                   'is_online', l.is_online,
                                                                   'note', l.note
                                                           )
                                                   )
                                            FROM (SELECT *
                                                  FROM lessons
                                                  WHERE lessons.class_id = c.id
                                                  GROUP BY lessons.day
                                                  ORDER BY lessons.day ASC) l),
                        'total_lessons', (SELECT COUNT(*) FROM lessons WHERE lessons.class_id = c.id),
                        'is_rating', IFNULL(ratings.id, false)
                        ) as class
                 FROM classes c
                          LEFT JOIN users tutor ON tutor.id = c.tutor_id
                          LEFT JOIN users author ON author.id = c.author_id
                          LEFT JOIN majors ON majors.id = c.major_id
                          LEFT JOIN class_levels cl ON cl.id = c.class_level_id
                          LEFT JOIN lessons ON lessons.class_id = c.id
                          LEFT JOIN addresses ON addresses.id = c.address_id
                          LEFT JOIN class_members ON class_members.class_id = c.id AND class_members.user_id = ?
                          LEFT JOIN ratings ON ratings.class_id = c.id AND ratings.rater_id = ?
                 WHERE c.id = ?
                 GROUP BY c.id;`;

                 const childInClassSql = `
                 SELECT JSON_OBJECT(
                            'id', u.id,
                            'full_name', u.full_name,
                            'email', u.email,
                            'phone_number', u.phone_number,
                            'avatar', u.avatar
                          ) as child
                 FROM users u
                          INNER JOIN class_members cm ON cm.user_id = u.id
                          INNER JOIN classes c ON c.id = cm.class_id
                 WHERE u.parent_id = ? AND cm.class_id = ?;
               `;

    SMySQL.getConnection((connection) => {
      connection?.execute<any[]>(
        sql,
        [userId, userId, userId, userId, userId, userId,classId],
        (err, result) => {
          if (err || !result || result.length < 1) {
            console.log("get Class by ID", err);
            onNext(new Class(), []);
          }

          const classData: Class = result[0].class as Class;
          classData.admin_accepted = result[0].class.admin_accepted  === 1
          classData.author_accepted = result[0].class.author_accepted  === 1
          classData.paid = result[0].class.paid  === 1
          classData.is_rating = result[0].class.is_rating  === 1

          connection.execute<any[]>(childInClassSql, [userId, classId], (childErr, childResult) => {
              if (childErr) {
                console.log("Error fetching children", childErr);
              } else {
                const membersInClassL: User[] = [];

                if (childResult && childResult.length > 0) {
                  childResult.forEach((child) => {
                    if (child.child) {
                      membersInClassL.push(child.child); // Đẩy từng thành viên vào danh sách
                    }
                  });
                }
                
                onNext(classData,membersInClassL );
              }
    
              // Trả dữ liệu về callback
            }
          );

        }
      );
    });
  }

  // Lây danh sách các buổi học bị trùng với lớp học người dùng đang học

  public static getconflictingLessonsWithClassUsers(
    classId: number,
    userId: string,
    onNext: (data: any[]) => void
  ) {
    const sql = `
    WITH parent_children AS (
    SELECT *
    FROM users AS parent
    WHERE parent.id = ?
    
    UNION ALL
    
    SELECT *
    FROM users AS child
    WHERE child.parent_id = ?
),
distinct_lessons AS (
    SELECT
        lessons_user.class_id,
        lessons_user.day,
        lessons_user.started_at,
        cm.user_id
    FROM lessons AS lessons_user
    LEFT JOIN class_members AS cm ON cm.class_id = lessons_user.class_id
    LEFT JOIN lessons AS lessons_current ON lessons_current.class_id = ?
    WHERE lessons_user.day = lessons_current.day
    AND (
        lessons_user.started_at BETWEEN lessons_current.started_at 
            AND (lessons_current.started_at + lessons_current.duration)
        OR (lessons_user.started_at + lessons_user.duration) BETWEEN lessons_current.started_at 
            AND (lessons_current.started_at + lessons_current.duration)
    )
    AND lessons_user.class_id != lessons_current.class_id
)
SELECT 
	 JSON_OBJECT(
            'id', parent_children.id,
            'full_name', parent_children.full_name,
            'avatar', parent_children.avatar
        ) AS all_user,
    CASE
        WHEN COUNT(distinct_lessons.class_id) > 0 THEN 
            JSON_ARRAYAGG(
                JSON_OBJECT(
                    'class_id', distinct_lessons.class_id,
                    'day', distinct_lessons.day,
                    'started_at', distinct_lessons.started_at
                )
            )
        ELSE NULL
    END AS conflicts
FROM parent_children
LEFT JOIN class_members AS cm ON cm.user_id = parent_children.id
LEFT JOIN distinct_lessons ON distinct_lessons.user_id = parent_children.id 
GROUP BY parent_children.id;
    `;

    SMySQL.getConnection((connection) => {
      connection?.query<any>(sql, [userId, userId, classId], (err, result) => {
        if (err) {
          SLog.log(
            LogType.Error,
            "get conflicting lessons with class users",
            "can't not get conflicting lessons",
            err
          );
          onNext([]);
        }

        const removeDuplicates = (conflicts) => {
          const seen = {};
          return conflicts.filter((conflict) => {
            if (!seen[conflict.day]) {
              seen[conflict.day] = true;
              return true; // Keep this conflict
            }
            return false; // Remove duplicates
          });
        };

        // Process data
        const groupedData = result.map((user) => {
          return {
            ...user.all_user,
            conflicts: user.conflicts ? removeDuplicates(user.conflicts) : null,
          };
        });

        onNext(groupedData);
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
        'paid', classes.paid,
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

  public static getFilterClasses(
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
    let queryParamsAddress: string[] = [];

    if (filter.minPrice) {
      filterConditions += ` AND classes.price >= ?`;
    }
    if (filter.maxPrice) {
      filterConditions += ` AND classes.price <= ?`;
    }

    if (filter.province) {
      const province = filter.province.trim();
      filterConditions += `
        AND (addresses.province LIKE ? OR ? LIKE CONCAT('%', CONCAT(addresses.province, '%')))
      `;
      queryParamsAddress.push(`%${province}%`, province);
    }

    if (filter.district) {
      const districts = filter.district.split(",").map((d) => d.trim());
      filterConditions += ` AND (${districts
        .map(
          () =>
            "(addresses.district LIKE ? OR ? LIKE CONCAT('%', CONCAT(addresses.district, '%')))"
        )
        .join(" OR ")})`;
      districts.forEach((d) => {
        queryParamsAddress.push(`%${d}%`, d);
      });
    }

    if (filter.ward) {
      const wards = filter.ward.split(",").map((w) => w.trim());
      filterConditions += ` AND (${wards
        .map(
          () =>
            "(addresses.ward LIKE ? OR ? LIKE CONCAT('%', CONCAT(addresses.ward, '%')))"
        ) // Tương tự
        .join(" OR ")})`;
      wards.forEach((w) => {
        queryParamsAddress.push(`%${w}%`, w); // Thêm cả giá trị '%<ward>%' và `<ward>`
      });
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
      WHERE classes.admin_accepted = 1 AND classes.paid = 1 AND ${condition} ${filterConditions}
      GROUP BY classes.id
      ${orderBy}
      LIMIT ${perPage} OFFSET ${(page - 1) * perPage};
  `;

    const countSql = `
    SELECT COUNT(DISTINCT classes.id) AS totalCount
    FROM classes
    LEFT JOIN users tutor ON tutor.id = classes.tutor_id
    LEFT JOIN users author ON author.id = classes.author_id
    LEFT JOIN majors ON majors.id = classes.major_id
    LEFT JOIN class_levels ON class_levels.id = classes.class_level_id
    LEFT JOIN addresses ON addresses.id = classes.address_id
    LEFT JOIN lessons ON lessons.class_id = classes.id
    LEFT JOIN class_members ON class_members.class_id = classes.id AND class_members.user_id = ?
    WHERE classes.admin_accepted = 1 AND classes.paid = 1 AND ${condition} ${filterConditions}
  `;

    // Thay thế các giá trị điều kiện theo userType và các filter
    const params = [
      ...(userType === UserType.TUTOR ? [userId, userId] : [userId, userId]),
      filter.minPrice,
      filter.maxPrice,
      ...queryParamsAddress,
      ...(parseNumericFilter(filter.major) || []),
      ...(parseNumericFilter(filter.classLevelId) || []),
      filter.maxLearners,
    ].filter((param) => param !== undefined);

    console.log(mysql.format(sql, params));
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
        // Iterate through` each row from the query result
        rows.forEach((row) => {
          const _class = row.class;
          classes.push(_class);
        });

        connection.execute<any[]>(countSql, params, (err, rows) => {
          if (err) {
            onNext([], new Pagination());
            console.log("getFilterClasses - DATA", err);
            return;
          }

          const totalCount = rows[0]?.totalCount;

          const pagination: Pagination = {
            page,
            per_page: perPage,
            total_pages: Math.ceil(totalCount / perPage),
            total_items: totalCount,
          };
          return onNext(classes, pagination);
        });
      });
    });
  }

  public static getSuggestsClasses(
    userId: string,
    userType: number,
    filter: Filters,
    page: number,
    perPage: number,
    onNext: (classes: Class[], pagination: Pagination) => void
  ) {
    const currentDate = new Date().getTime();
    console.log("Current date: " + currentDate);
    
   // Xác định điều kiện WHERE theo userType
   const condition =
   userType === UserType.TUTOR
     ? `classes.tutor_id IS NULL AND classes.author_id != ? AND class_members.user_id IS NULL AND classes.started_at >= ${currentDate}`
     : `classes.author_id = classes.tutor_id AND classes.tutor_id != ? AND classes.author_id != ? AND class_members.user_id IS NULL AND classes.started_at >= ${currentDate}`;

    // Tạo các điều kiện lọc động
    let filterConditions = "";
    let queryParamsAddress: string[] = [];

    if (filter.province) {
      const province = filter.province.trim();
      filterConditions += `
     AND (addresses.province LIKE ? OR ? LIKE CONCAT('%', CONCAT(addresses.province, '%')))
   `;
      queryParamsAddress.push(`%${province}%`, province);
    }

    if (filter.district) {
      const districts = filter.district.split(",").map((d) => d.trim());
      filterConditions += ` AND (${districts
        .map(
          () =>
            "(addresses.district LIKE ? OR ? LIKE CONCAT('%', CONCAT(addresses.district, '%')))"
        )
        .join(" OR ")})`;
      districts.forEach((d) => {
        queryParamsAddress.push(`%${d}%`, d);
      });
    }

    if (filter.ward) {
      const wards = filter.ward.split(",").map((w) => w.trim());
      filterConditions += ` AND (${wards
        .map(
          () =>
            "(addresses.ward LIKE ? OR ? LIKE CONCAT('%', CONCAT(addresses.ward, '%')))"
        ) // Tương tự
        .join(" OR ")})`;
      wards.forEach((w) => {
        queryParamsAddress.push(`%${w}%`, w);
      });
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

    // SQL query to fetch class information, including tutor, major, and class level details
    const sql = `
    WITH SuggestedClasses AS (
      SELECT
        ${this.classJsonSQL},
        classes.id AS class_id
      FROM classes
      LEFT JOIN users tutor ON tutor.id = classes.tutor_id
      LEFT JOIN users author ON author.id = classes.author_id
      LEFT JOIN majors ON majors.id = classes.major_id
      LEFT JOIN class_levels ON class_levels.id = classes.class_level_id
      LEFT JOIN addresses ON addresses.id = classes.address_id
      LEFT JOIN lessons ON lessons.class_id = classes.id
      LEFT JOIN class_members ON class_members.class_id = classes.id AND class_members.user_id = ?
      WHERE classes.admin_accepted = 1 AND classes.paid = 1  AND  ${condition} ${filterConditions}
      GROUP BY classes.id
    ),
    RandomClasses AS (
      SELECT
        ${this.classJsonSQL},
        classes.id AS class_id
      FROM classes
      LEFT JOIN users tutor ON tutor.id = classes.tutor_id
      LEFT JOIN users author ON author.id = classes.author_id
      LEFT JOIN majors ON majors.id = classes.major_id
      LEFT JOIN class_levels ON class_levels.id = classes.class_level_id
      LEFT JOIN addresses ON addresses.id = classes.address_id
      LEFT JOIN lessons ON lessons.class_id = classes.id
      LEFT JOIN class_members ON class_members.class_id = classes.id AND class_members.user_id = ?
      LEFT JOIN SuggestedClasses sc ON classes.id = sc.class_id 
      WHERE classes.admin_accepted = 1 AND classes.paid = 1  AND ${condition} 
      AND sc.class_id IS NULL
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
      ...(userType === UserType.TUTOR ? [userId, userId] : [userId, userId, userId]),
      ...queryParamsAddress,
      ...(parseNumericFilter(filter.major) || []),
      ...(parseNumericFilter(filter.classLevelId) || []),
      ...(userType === UserType.TUTOR ? [userId, userId] : [userId, userId, userId]),
    ].filter((param) => param !== undefined);

    // console.log("suggest: ",mysql.format(sql, params));
    // console.log(params);

    SMySQL.getConnection((connection) => {
      connection?.execute<any[]>(sql, params, (err, rows) => {
        if (err) {
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
          per_page: perPage,
          total_pages: Math.ceil(totalCount / perPage),
          total_items: totalCount,
        };

        // Return the list of classes via the callback function
        return onNext(classes, pagination);
      });
    });
  }

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
  public static getClassByUserId(
    userId: string,
    onNext: (classes: Class[]) => void
  ) {
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
            admin_accepted: !!row.class.admin_accepted,
            paid: !!row.class.paid,
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
    classId: number,
    title: string,
    description: string,
    major_id: number,
    class_level_id: number,
    max_learners: number,
    price: number,
    started_at: number,
    ended_at: number,
    updated_at: number,
    onNext: (result: boolean) => void
  ) {
    const sql = `
      UPDATE classes 
      SET 
        title = ?, 
        description = ?, 
        major_id = ?, 
        class_level_id = ?, 
        max_learners = ?, 
        price = ?, 
        started_at = ?, 
        ended_at = ?, 
        updated_at = ?
      WHERE id = ?
    `;
  
    SMySQL.getConnection((connection) => {
      if (!connection) {
        console.error("Không thể kết nối database.");
        onNext(false);
        return;
      }
  
      connection.execute(
        sql,
        [
          title,
          description,
          major_id,
          class_level_id,
          max_learners,
          price,
          started_at,
          ended_at,
          updated_at = new Date().getTime(),
          classId,
        ],
        (err, result) => {
          if (err) {
            console.error("Lỗi khi cập nhật lớp học:", err);
            onNext(false);
          } else {
            const affectedRows = (result as any).affectedRows;
            if (affectedRows > 0) {
              console.log("Cập nhật lớp học thành công.");
              onNext(true);
            } else {
              console.warn("Không tìm thấy lớp học để cập nhật.");
              onNext(false);
            }
          }
        }
      );
    });
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

  /**
   * Thực hiện tạo lớp học
   * @param title Tiêu đề lớp học
   * @param description Mô tả lớp học
   * @param major_id ID chuyên ngành
   * @param class_level_id ID cấp lớp
   * @param price Giá lớp học
   * @param started_at Ngày bắt đầu (timestamp)
   * @param ended_at Ngày kết thúc (timestamp)
   * @param lessons Danh sách bài học
   * @param onNext Hàm callback để trả kết quả
   */

  public static createClass(
    title: string,
    description: string,
    major_id: number,
    tutor_id: string,
    author_id: string,
    class_level_id: number,
    max_learners: number,
    price: number,
    started_at: number,
    ended_at: number,
    address_id: number,
    lessons: Lesson[], // Nhận danh sách đầy đủ các bài học
    onNext: (result: boolean, insertId?: number) => void
  ) {
    const classSql = `
      INSERT INTO classes (title, description, major_id, tutor_id, author_id, price, class_level_id, max_learners, started_at, ended_at, address_id) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    SMySQL.getConnection((connection) => {
      if (!connection) {
        console.error("Không thể kết nối database.");
        onNext(false);
        return;
      }

      connection.beginTransaction((transactionErr) => {
        if (transactionErr) {
          console.error("Lỗi khi bắt đầu transaction:", transactionErr);
          onNext(false);
          return;
        }

        connection.execute(
          classSql,
          [
            title,
            description,
            major_id,
            tutor_id, // Phải nhận từ frontend
            author_id, // Phải nhận từ frontend
            price,
            class_level_id,
            max_learners,
            started_at,
            ended_at,
            address_id,
          ],
          (classErr, classResult) => {
            if (classErr) {
              console.error("Lỗi khi thêm lớp học:", classErr);
              connection.rollback(() => onNext(false));
              return;
            }

            const classId = (classResult as any).insertId;
            if (!classId) {
              console.error("Không lấy được ID lớp học vừa tạo.");
              connection.rollback(() => onNext(false));
              return;
            }

            if (lessons.length === 0) {
              connection.commit((commitErr) => {
                if (commitErr) {
                  console.error("Lỗi khi commit transaction:", commitErr);
                  onNext(false);
                } else {
                  console.log("Tạo lớp học thành công, không có bài học.");
                  onNext(true, classId);
                }
              });
            } else {
              // Insert các bài học
              const lessonSql = `
                INSERT INTO lessons (class_id, day, started_at, duration, is_online, note) 
                VALUES ${lessons.map(() => "(?, ?, ?, ?, ?, ?)").join(",")}
              `;
              const lessonValues = lessons
                .map((lesson) => [
                  classId,
                  lesson.day,
                  lesson.started_at,
                  lesson.duration * 60000,
                  lesson.is_online,
                  lesson.note || null,
                ])
                .flat();

              connection.execute(lessonSql, lessonValues, (lessonErr) => {
                if (lessonErr) {
                  console.error("Lỗi khi thêm bài học:", lessonErr);
                  connection.rollback(() => onNext(false));
                  return;
                }

                connection.commit((commitErr) => {
                  if (commitErr) {
                    console.error("Lỗi khi commit transaction:", commitErr);
                    onNext(false);
                  } else {
                    console.log("Tạo lớp học và bài học thành công.");
                    onNext(true, classId);
                  }
                });
              });
            }
          }
        );
      });
    });
  }

  public static createClassForLearner(
    title: string,
    description: string,
    major_id: number,
    tutor_id: string | null,
    author_id: string,
    class_level_id: number,
    price: number,
    started_at: number,
    ended_at: number,
    max_learners: number | 1,
    address_id: number,
    lessons: Lesson[],
    userIds: string[],
    onNext: (result: boolean, insertId?: number) => void
  ) {
    if (!tutor_id || tutor_id === null) tutor_id = null;
    if (!max_learners) max_learners = 1;
  
    const classSql = `
      INSERT INTO classes (title, description, major_id, tutor_id, author_id, price, class_level_id, started_at, ended_at, max_learners, address_id) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
  
    SMySQL.getConnection((connection) => {
      if (!connection) {
        console.error("Không thể kết nối database.");
        onNext(false);
        return;
      }
  
      connection.beginTransaction((transactionErr) => {
        if (transactionErr) {
          console.error("Lỗi khi bắt đầu transaction:", transactionErr);
          onNext(false);
          return;
        }
  
        connection.execute(
          classSql,
          [
            title,
            description,
            major_id,
            tutor_id,
            author_id,
            price,
            class_level_id,
            started_at,
            ended_at,
            max_learners,
            address_id,
          ],
          (classErr, classResult) => {
            if (classErr) {
              console.error("Lỗi khi thêm lớp học:", classErr);
              connection.rollback(() => onNext(false));
              return;
            }
  
            const classId = (classResult as any)?.insertId;
  
            if (!classId) {
              console.error("Không lấy được ID lớp học vừa tạo.");
              connection.rollback(() => onNext(false));
              return;
            }
  
            // Insert lessons
            const lessonSql = `
              INSERT INTO lessons (class_id, day, started_at, duration, is_online, note) 
              VALUES ${lessons.map(() => "(?, ?, ?, ?, ?, ?)").join(",")}
            `;
            const lessonValues = lessons.flatMap((lesson) => [
              classId,
              lesson.day,
              lesson.started_at,
              lesson.duration * 60000,
              lesson.is_online,
              lesson.note || null,
            ]);
  
            
            
            connection.execute(lessonSql, lessonValues, (lessonErr) => {
              if (lessonErr) {
                console.error("Lỗi khi thêm bài học:", lessonErr);
                connection.rollback(() => onNext(false));
                return;
              }
  
              // Insert class members
              const finalUserIds = userIds.length > 0 ? userIds : [author_id];
              const sqlClassMember = `
                INSERT INTO class_members (class_id, user_id) 
                VALUES ${userIds.map(() => "(?, ?)").join(",")}
              `;
              const valueClassMembers = finalUserIds.flatMap((userId) => [classId, userId]);
  
              connection.execute(sqlClassMember, valueClassMembers, (err) => {
                if (err) {
                  console.error("Lỗi khi thêm thông tin người dùng:", err);
                  connection.rollback(() => onNext(false));
                  return;
                }
  
                connection.commit((commitErr) => {
                  if (commitErr) {
                    console.error("Commit thất bại:", commitErr);
                    onNext(false);
                  } else {
                    console.log("Tạo lớp học và các thông tin liên quan thành công.");
                    onNext(true, classId);
                  }
                });
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
        SFirebase.push(FirebaseNode.Classes, [{ key: FirebaseNode.Id, value: classId }],
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
              SFirebase.push(
                FirebaseNode.Classes,
                [{ key: FirebaseNode.Id, value: classId }],
                () => {
                  onNext("Class accepted by tutor successfully", true);
                }
              );
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

  public static payForClass(
    classId: number,
    classFee: number,
    paidPath: string | null,
    onNext: (message: string, result: boolean) => void
  ) {
    console.log("class id: ", classId);
    console.log("classFee: ", classFee);
    console.log("paymentPath: ", paidPath);

    // Tạo placeholders cho danh sách userIds
    const sql = `
    UPDATE classes SET class_creation_fee = ?,  paid_path = ?, updated_at = ? WHERE id = ?
  `;
  
      const updatedAT = new Date().getTime();
      const values = [classFee, paidPath, updatedAT ,classId];
    
      SMySQL.getConnection((connection) => {
          connection?.execute<any>(sql, values, (err, results) => {
            if (err) {
              onNext('Update failed', false);
              console.log('>>> Update failed:', err);
              return;
            }
  
            // Kiểm tra xem có bản ghi nào được cập nhật không
            if (results.affectedRows === 0) {
              onNext('No matching record found', false);
            } else {
              SFirebase.push(FirebaseNode.Classes, [{ key: FirebaseNode.Id, value: classId }],
                () => {
                  onNext(`Payment update successful for ID: ${classId}`, true);
                }
              );
            }
  
          });
      })
  
  
  }

  public static acceptTutorForClass(
    classId: number,
    authorAccepted: boolean,
    onNext: (message: string, result: boolean) => void
  ) {
    console.log("class id: ", classId);

    // Tạo placeholders cho danh sách userIds
    let sql = "";
    let values: any[] = [];
    const updatedAT = new Date().getTime();

    if (authorAccepted == true) {
      sql = `
        UPDATE classes SET author_accepted = ?, updated_at = ? WHERE id = ?
      `;
      values = [authorAccepted, updatedAT, classId];
      console.log("Chấp nhận gia sư");
    } else {
      sql = `
      UPDATE classes SET tutor_id = null, updated_at = ? WHERE id = ?
      `;
      values = [updatedAT, classId];
      console.log("Từ chối");
    }

    SMySQL.getConnection((connection) => {
      connection?.execute<any>(sql, values, (err, results) => {
        if (err) {
          onNext("Update failed", false);
          console.log(">>> Update failed:", err);
          return;
        }

        // Kiểm tra xem có bản ghi nào được cập nhật không
        if (results.affectedRows === 0) {
          onNext("No matching record found", false);
        } else {
          SFirebase.push(
            FirebaseNode.Classes,
            [{ key: FirebaseNode.Id, value: classId }],
            () => {
              onNext(` Update successful for ID: ${classId}`, true);
            }
          );
        }
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

   //lấy lớp học theo id
   public static getClassById(
    id: string,
    onNext: (classDetails: Class | undefined) => void
  ) {
    const sql = `
    SELECT * 
    FROM classes
    WHERE id = ?;
    `;
  
    // Kết nối với cơ sở dữ liệu và thực hiện truy vấn
    SMySQL.getConnection((connection) => {
      connection?.execute<any>(sql, [id], (error, result) => {
        if (error || !result || result.length === 0) {
          SLog.log(
            LogType.Error,
            "getClassById",
            `Class with id ${id} not found`,
            error
          );
          onNext(undefined);
          return;
        }
  
        const classDetails = result[0]; // Lấy kết quả đầu tiên từ query
        onNext(classDetails);
      });
    });
  }
}
