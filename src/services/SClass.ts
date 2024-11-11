import { response } from "express";
import Class from "./../models/Class";
import SLog, { LogType } from "./SLog";
import SMySQL from "./SMySQL";
import User from "../models/User";
import Major from "../models/Major";
import Lesson from "../models/Lesson";
import { UserType } from "../configs/UserType";

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
  public static getClassesWithoutTutor(onNext: (classes: Class[]) => void) {}
  public static getUnstartedClasses(onNext: (classes: Class[]) => void) {}
  public static getIncompleteClasses(onNext: (classes: Class[]) => void) {}

  public static getClassDetailWithUser(
    id: number,
    userId: string,
    onNext: (_class: Class | undefined, related_classes: Class[]) => void
  ) {
    //get class
    const sql = `SELECT 
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
                     'address_4', c.address_4,
        'user_status', CASE 
            WHEN c.author_id = ? THEN 'author'
            WHEN c.tutor_id = ? THEN 'tutor'
            WHEN in_class_members.user_id IS NOT NULL THEN 'member'
            ELSE 'not_joined'
        END
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
                LEFT JOIN in_class_members ON in_class_members.class_id = c.id AND in_class_members.user_id = ?
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
            onNext(undefined, []);
          }

          const _class: Class = result[0].class as Class;
          const related_classes: Class[] = [];
          const major_id = _class.major?.id;
          SClass.getRelatedClasses(major_id, id, (related_class) => {
            related_class.forEach((data) => {
              related_classes.push(data);
            });
            onNext(_class, related_class);
          });
        }
      );
    });
  }

  public static getClassesByKey(
    key: string,
    onNext: (classes: Class[]) => void
  ) {}

  public static getSuggestedClasses(
    userId: string,
    userType: number,
    onNext: (classes: Class[]) => void
  ) {
    // Xác định điều kiện WHERE theo userType
    const condition =
      userType === UserType.TUTOR
        ? `classes.tutor_id IS NULL AND classes.author_id != ? AND in_class_members.user_id IS NULL`
        : `classes.author_id != ? AND in_class_members.user_id IS NULL`;

    // SQL query to fetch class information, including tutor, major, and class level details
    const sql = `SELECT 
                    JSON_OBJECT(
                          'id', classes.id ,
                          'title', classes.title ,
                          'description', classes.description,
                          'price', classes.price,
                          'class_creation_fee', classes.class_creation_fee,
                          'max_learners', classes.max_learners,
                          'started_at', classes.started_at,
                          'ended_at', classes.ended_at,
                          'created_at', classes.created_at,
                          'updated_at', classes.updated_at,
                          'address_1', classes.address_1,
                          'address_2', classes.address_2,
                          'address_3', classes.address_3,
                          'address_4', classes.address_4,
                          'tutor', JSON_OBJECT(
                          'id', users.id,
                          'name', users.full_name,
                          'email', users.email,
                          'phone_number', users.phone_number,
                          'avatar', JSON_OBJECT(
                                      'id', files_tutor.id,
                                      'name', files_tutor.name,
                                      'path', files_tutor.path
                                    )
                            ),
                            'major', JSON_OBJECT(
                          'id', majors.id,
                          'vn_name', majors.vn_name,
                          'en_name', majors.en_name,
                          'ja_name', majors.ja_name,
                          'icon', JSON_OBJECT(
                                      'id', files_major.id,
                                      'name', files_major.name,
                                      'path', files_major.path
                                  )
                            ),
                        'class_level', JSON_OBJECT(
                          'id', class_levels.id,
                          'vn_name', class_levels.vn_name,
                          'en_name', class_levels.en_name,
                          'ja_name', class_levels.ja_name
                        )
                      ) AS class
                  FROM classes
                  LEFT JOIN users ON users.id = classes.tutor_id
                  LEFT JOIN majors ON majors.id = classes.major_id
                  LEFT JOIN class_levels ON class_levels.id = classes.class_level_id
                  LEFT JOIN files AS files_tutor ON files_tutor.id = users.avatar_id
                  LEFT JOIN files AS files_major ON files_major.id = majors.icon_id
                  LEFT JOIN in_class_members ON in_class_members.class_id = classes.id AND in_class_members.user_id = ?
                  WHERE ${condition};`;

    // Thay thế các giá trị điều kiện theo userType
    const params =
      userType === UserType.TUTOR ? [userId, userId] : [userId, userId];

    // Get a database connection
    SMySQL.getConnection((connection) => {
      // Execute the SQL query with the provided user_id as a parameter
      connection?.execute<any[]>(sql, params, (err, rows) => {
        if (err) {
          // If an error occurs, return an empty array to the callback
          onNext([]);
          return;
        }

        const classes: Class[] = [];

        // Iterate through each row from the query result
        rows.forEach((row) => {
          const _class = row.class;

          // Add the created Class instance to the classes array
          classes.push(_class);
        });

        // SLog.log(LogType.Info, "getAttendingClasses","get Attending Classes",rows );

        // Return the list of classes via the callback function
        return onNext(classes);
      });
    });
  }

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

  public static getAttendingClasses(
    user_id: string,
    onNext: (classes: Class[]) => void
  ) {
    // SQL query to fetch class information, including tutor, major, and class level details
    const sql = `SELECT 
                    JSON_OBJECT(
                          'id', classes.id ,
                          'title', classes.title ,
                          'description', classes.description,
                          'price', classes.price,
                          'class_creation_fee', classes.class_creation_fee,
                          'max_learners', classes.max_learners,
                          'started_at', classes.started_at,
                          'ended_at', classes.ended_at,
                          'created_at', classes.created_at,
                          'updated_at', classes.updated_at,
                          'address_1', classes.address_1,
                          'address_2', classes.address_2,
                          'address_3', classes.address_3,
                          'address_4', classes.address_4
                      ) AS class,
                      JSON_OBJECT(
                          'id', users.id,
                          'name', users.full_name,
                          'email', users.email,
                          'phone_number', users.phone_number,
                          'avatar', JSON_OBJECT(
                                      'id', files_tutor.id,
                                      'name', files_tutor.name,
                                      'path', files_tutor.path
                                  )
                      ) AS tutor,
                      JSON_OBJECT(
                          'id', majors.id,
                          'vn_name', majors.vn_name,
                          'en_name', majors.en_name,
                          'ja_name', majors.ja_name,
                          'icon', JSON_OBJECT(
                                      'id', files_major.id,
                                      'name', files_major.name,
                                      'path', files_major.path
                                  )
                      ) AS major,
                      JSON_OBJECT(
                          'id', class_levels.id,
                          'vn_name', class_levels.vn_name,
                          'en_name', class_levels.en_name,
                          'ja_name', class_levels.ja_name
                      ) AS class_level
                  FROM classes
                  INNER JOIN users ON users.id = classes.tutor_id
                  LEFT JOIN majors ON majors.id = classes.major_id
                  LEFT JOIN class_levels ON class_levels.id = classes.class_level_id
                  LEFT JOIN files AS files_tutor ON files_tutor.id = users.avatar_id
                  LEFT JOIN files AS files_major ON files_major.id = majors.icon_id
                  LEFT JOIN in_class_members ON in_class_members.class_id = classes.id
                  WHERE in_class_members.user_id = ?;`;

    // Get a database connection
    SMySQL.getConnection((connection) => {
      // Execute the SQL query with the provided user_id as a parameter
      connection?.execute<any[]>(sql, [user_id], (err, rows) => {
        if (err) {
          // If an error occurs, return an empty array to the callback
          onNext([]);
          return;
        }

        const classes: Class[] = [];

        // Iterate through each row from the query result
        rows.forEach((row) => {
          const tutor = row.tutor;
          const major = row.major;
          const class_level = row.class_level;

          const _class = new Class(
            row.class.id,
            row.class.title,
            row.class.description,
            major, // Major details
            tutor, // Tutor details
            undefined, // Optional undefined parameter (author)
            row.class.price,
            row.class.class_creation_fee,
            class_level, // Class level details
            [],
            0,
            row.class.max_learners,
            new Date(row.class.started_at),
            new Date(row.class.ended_at),
            new Date(row.class.created_at),
            new Date(row.class.updated_at),
            row.class.address_1,
            row.class.address_2,
            row.class.address_3,
            row.class.address_4
          );

          // Add the created Class instance to the classes array
          classes.push(_class);
        });

        // SLog.log(LogType.Info, "getAttendingClasses","get Attending Classes",rows );

        // Return the list of classes via the callback function
        return onNext(classes);
      });
    });
  }

  public static getTeachingClasses(
    user_id: string,
    onNext: (classes: Class[]) => void
  ) {
    // SQL query to fetch class information, including tutor, major, and class level details
    const sql = `SELECT 
                  JSON_OBJECT(
                        'id', classes.id ,
                        'title', classes.title ,
                        'description', classes.description,
                        'price', classes.price,
                        'class_creation_fee', classes.class_creation_fee,
                        'max_learners', classes.max_learners,
                        'started_at', classes.started_at,
                        'ended_at', classes.ended_at,
                        'created_at', classes.created_at,
                        'updated_at', classes.updated_at,
                        'address_1', classes.address_1,
                        'address_2', classes.address_2,
                        'address_3', classes.address_3,
                        'address_4', classes.address_4
                    ) AS class,
                    JSON_OBJECT(
                        'id', users.id,
                        'name', users.full_name,
                        'email', users.email,
                        'phone_number', users.phone_number,
                        'avatar', JSON_OBJECT(
                                    'path', files_tutor.path
                                )
                    ) AS tutor,
                    JSON_OBJECT(
                        'id', majors.id,
                        'vn_name', majors.vn_name,
                        'en_name', majors.en_name,
                        'ja_name', majors.ja_name,
                        'icon', JSON_OBJECT(
                                    'path', files_major.path
                                )
                    ) AS major,
                    JSON_OBJECT(
                        'id', class_levels.id,
                        'vn_name', class_levels.vn_name,
                        'en_name', class_levels.en_name,
                        'ja_name', class_levels.ja_name
                    ) AS class_level
                FROM classes
                INNER JOIN users ON users.id = classes.tutor_id
                LEFT JOIN majors ON majors.id = classes.major_id
                LEFT JOIN class_levels ON class_levels.id = classes.class_level_id
                LEFT JOIN files AS files_tutor ON files_tutor.id = users.avatar_id
                LEFT JOIN files AS files_major ON files_major.id = majors.icon_id
                WHERE classes.tutor_id = ?;`;

    // Get a database connection
    SMySQL.getConnection((connection) => {
      // Execute the SQL query with the provided user_id as a parameter
      connection?.execute<any[]>(sql, [user_id], (err, rows) => {
        if (err) {
          // If an error occurs, return an empty array to the callback
          onNext([]);
          return;
        }

        const classes: Class[] = [];

        // Iterate through each row from the query result
        rows.forEach((row) => {
          const tutor = row.tutor;
          const major = row.major;
          const class_level = row.class_level;

          const _class = new Class(
            row.class.id,
            row.class.title,
            row.class.description,
            major, // Major details
            tutor, // Tutor details
            undefined, // Optional undefined parameter (author)
            row.class.price,
            row.class.class_creation_fee,
            class_level, // Class level details
            [],
            0,
            row.class.max_learners,
            new Date(row.class.started_at),
            new Date(row.class.ended_at),
            new Date(row.class.created_at),
            new Date(row.class.updated_at),
            row.class.address_1,
            row.class.address_2,
            row.class.address_3,
            row.class.address_4
          );

          // Add the created Class instance to the classes array
          classes.push(_class);
        });

        // SLog.log(LogType.Info, "getAttendingClasses","get Attending Classes",rows );

        // Return the list of classes via the callback function
        return onNext(classes);
      });
    });
  }

  public static getCreatedClasses(
    user_id: string,
    onNext: (classes: Class[]) => void
  ) {
    // SQL query to fetch class information, including tutor, major, and class level details
    const sql = `SELECT 
                    JSON_OBJECT(
                          'id', classes.id ,
                          'title', classes.title ,
                          'description', classes.description,
                          'price', classes.price,
                          'class_creation_fee', classes.class_creation_fee,
                          'max_learners', classes.max_learners,
                          'started_at', classes.started_at,
                          'ended_at', classes.ended_at,
                          'created_at', classes.created_at,
                          'updated_at', classes.updated_at,
                          'address_1', classes.address_1,
                          'address_2', classes.address_2,
                          'address_3', classes.address_3,
                          'address_4', classes.address_4
                      ) AS class,
                      JSON_OBJECT(
                          'id', users.id,
                          'name', users.full_name,
                          'email', users.email,
                          'phone_number', users.phone_number,
                          'avatar', JSON_OBJECT(
                                      'path', files_tutor.path
                                  )
                      ) AS tutor,
                      JSON_OBJECT(
                          'id', majors.id,
                          'vn_name', majors.vn_name,
                          'en_name', majors.en_name,
                          'ja_name', majors.ja_name,
                          'icon', JSON_OBJECT(
                                      'path', files_major.path
                                  )
                      ) AS major,
                      JSON_OBJECT(
                          'id', class_levels.id,
                          'vn_name', class_levels.vn_name,
                          'en_name', class_levels.en_name,
                          'ja_name', class_levels.ja_name
                      ) AS class_level
                  FROM classes
                  INNER JOIN users ON users.id = classes.tutor_id
                  LEFT JOIN majors ON majors.id = classes.major_id
                  LEFT JOIN class_levels ON class_levels.id = classes.class_level_id
                  LEFT JOIN files AS files_tutor ON files_tutor.id = users.avatar_id
                  LEFT JOIN files AS files_major ON files_major.id = majors.icon_id
                  WHERE classes.author_id = ?;`;

    // Get a database connection
    SMySQL.getConnection((connection) => {
      // Execute the SQL query with the provided user_id as a parameter
      connection?.execute<any[]>(sql, [user_id], (err, rows) => {
        if (err) {
          // If an error occurs, return an empty array to the callback
          onNext([]);
          return;
        }

        const classes: Class[] = [];

        // Iterate through each row from the query result
        rows.forEach((row) => {
          const tutor = row.tutor;
          const major = row.major;
          const class_level = row.class_level;

          const _class = new Class(
            row.class.id,
            row.class.title,
            row.class.description,
            major, // Major details
            tutor, // Tutor details
            undefined, // Optional undefined parameter (author)
            row.class.price,
            row.class.class_creation_fee,
            class_level, // Class level details
            [],
            0,
            row.class.max_learners,
            new Date(row.class.started_at),
            new Date(row.class.ended_at),
            new Date(row.class.created_at),
            new Date(row.class.updated_at),
            row.class.address_1,
            row.class.address_2,
            row.class.address_3,
            row.class.address_4
          );

          // Add the created Class instance to the classes array
          classes.push(_class);
        });

        // SLog.log(LogType.Info, "getAttendingClasses","get Attending Classes",rows );

        // Return the list of classes via the callback function
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
    // Initialize the SQL statement for updating the 'classes' table
    let sql = "UPDATE `classes` SET ";
    const updateCols: string[] = []; // Array to hold the columns to be updated
    const updateValues: Array<string | number> = []; // Array to hold the values corresponding to the columns

    // Conditionally add the 'title' column if the title length is within the valid range
    if (
      updatedClass.title &&
      updatedClass.title.length >= 3 &&
      updatedClass.title.length <= 255
    ) {
      updateCols.push("`title`=?");
      updateValues.push(updatedClass.title);
    }

    // Conditionally add the 'description' column if it is provided
    if (updatedClass.description) {
      updateCols.push("`description`=?");
      updateValues.push(updatedClass.description);
    }

    // Conditionally add the 'major_id' column if a valid major ID is provided
    if (updatedClass.major?.id) {
      updateCols.push("`major_id`=?");
      updateValues.push(updatedClass.major.id);
    }

    // Conditionally add the 'tutor_id' column if a valid tutor ID is provided
    if (updatedClass.tutor?.id) {
      updateCols.push("`tutor_id`=?");
      updateValues.push(updatedClass.tutor.id);
    }

    // Conditionally add the 'price' column if a price is provided
    if (updatedClass.price) {
      updateCols.push("`price`=?");
      updateValues.push(updatedClass.price);
    }

    // Conditionally add the 'class_creation_fee' column if it is provided
    if (updatedClass.class_creation_fee) {
      updateCols.push("`class_creation_fee`=?");
      updateValues.push(updatedClass.class_creation_fee);
    }

    // Conditionally add the 'class_level_id' column if a valid class level ID is provided
    if (updatedClass.class_level?.id) {
      updateCols.push("`class_level_id`=?");
      updateValues.push(updatedClass.class_level.id);
    }

    // Conditionally add the 'max_learners' column if the maximum number of learners is provided
    if (updatedClass.max_learners) {
      updateCols.push("`max_learners`=?");
      updateValues.push(updatedClass.max_learners);
    }

    // Conditionally add the 'started_at' column if the start date is provided
    if (updatedClass.started_at) {
      updateCols.push("`started_at`=?");
      updateValues.push(updatedClass.started_at);
    }

    // Conditionally add the 'ended_at' column if the end date is provided
    if (updatedClass.ended_at) {
      updateCols.push("`ended_at`=?");
      updateValues.push(updatedClass.ended_at);
    }

    // Conditionally add address columns if they are provided
    if (updatedClass.address_1) {
      updateCols.push("`address_1`=?");
      updateValues.push(updatedClass.address_1);
    }

    // Conditionally add the 'address_2' column if the second address line is provided
    if (updatedClass.address_2) {
      updateCols.push("`address_2`=?"); // Add the 'address_2' column to the list of columns to update
      updateValues.push(updatedClass.address_2); // Add the corresponding value for 'address_2'
    }

    // Conditionally add the 'address_3' column if the third address line is provided
    if (updatedClass.address_3) {
      updateCols.push("`address_3`=?"); // Add the 'address_3' column to the list of columns to update
      updateValues.push(updatedClass.address_3); // Add the corresponding value for 'address_3'
    }

    // Conditionally add the 'address_4' column if the fourth address line is provided
    if (updatedClass.address_4) {
      updateCols.push("`address_4`=?"); // Add the 'address_4' column to the list of columns to update
      updateValues.push(updatedClass.address_4); // Add the corresponding value for 'address_4'
    }

    // Build the final SQL statement by appending updated columns and setting the updated timestamp
    sql += updateCols.map((col) => col + ", ").join(" ");
    sql += " `updated_at`=? WHERE id = ?";

    // Execute the SQL statement using a MySQL connection
    SMySQL.getConnection((connection) => {
      connection?.execute(
        sql,
        [...updateValues, new Date().getTime(), updatedClass.id],
        (error) => {
          // If an error occurs, log the error and invoke the callback with 'false'
          if (error) {
            onNext(false);
            SLog.log(
              LogType.Error,
              "updateClass",
              "Cannot update class",
              error
            );
            return;
          }

          // If the update is successful, log success and invoke the callback with 'true'
          onNext(true);
          SLog.log(LogType.Error, "updateClass", "Update class successfully");
          return;
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
    // SQL statement for performing a soft delete by updating the 'ended_at' and 'updated_at' fields
    const sql = "UPDATE classes SET ended_at = ?, updated_at = ? WHERE id = ?";
    const endedAt = new Date().getTime() - 1000; // Set the ended time to the current time minus one second
    const updatedAt = new Date().getTime(); // Set the updated time to the current time

    // Execute the SQL statement using a MySQL connection
    SMySQL.getConnection((connection) => {
      connection?.execute(sql, [endedAt, updatedAt, id], (error) => {
        // If an error occurs, log the error and invoke the callback with 'false'
        if (error) {
          onNext(false);
          SLog.log(
            LogType.Error,
            "softDeleteClass",
            "Cannot delete class",
            error
          );
          return;
        }

        // If the deletion is successful, log success and invoke the callback with 'true'
        onNext(true);
        SLog.log(LogType.Error, "softDeleteClass", "Delete class successfully");
        return;
      });
    });
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

    //class_level_id:  lấy danh sách cấp học -> lưu lại id
    // bỏ mô tả và yêu cầu trong giao diện

    SMySQL.getConnection((connection) => {
      connection?.query(
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
        (err, result) => {
          if (err) {
            // Xử lý khi có lỗi
            SLog.log(
              LogType.Error,
              "addNewClass",
              "Failed to insert new class",
              err
            );
            onNext(false);
            return;
          }
          // Trả về kết quả thành công và ID của lớp học vừa thêm
          const classId = (result as any).insertId || undefined;
          onNext(true, classId); // tìm cách trả về ID lớp vừa tạo

          // Chuẩn bị dữ liệu cho việc chèn nhiều dòng trong bảng lessons
          if (lessons.length > 0) {
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
            console.log("values: " + values);
            
            // Xây dựng câu truy vấn `INSERT` với nhiều giá trị
            const placeholders = lessons.map(() => "(?,?,?,?,?)").join(",");
            const sqlLesson = `INSERT INTO lessons (class_id, day, started_at, duration, is_online) VALUES ${placeholders}`;

            console.log("sql lesson: ", sqlLesson);
            
            connection.query(sqlLesson, values, (lessonErr) => {
              if (lessonErr) {
                SLog.log(
                  LogType.Error,
                  "addLessons",
                  "Failed to insert lessons",
                  lessonErr
                );
                onNext(false);
              } else {
                onNext(true, classId); // thanh cong tra ve id cho lop
              }
            });
          } else {
            onNext(true, classId);
          }
        }
      );
    });
  }

  // Join class by leaner
  public static joinClass(
    classId: number,
    userId: string,
    studentIds: number[],
    onSuccess: () => void,
    onError: (error: any) => void
  ) {
    console.log(">>> user id", userId);
    console.log(">>> class id", classId);
    console.log(">>> student ids", studentIds);

    const sql = `
          INSERT INTO in_class_members (class_id, user_id)
          VALUES (?, ?)
          `;

    // Câu SQL cho bảng in_class_students
    const studentSql = `
      INSERT INTO in_class_students (class_id, student_id)
      VALUES (?, ?)
      `;

    SMySQL.getConnection((connection) => {
      // Bắt đầu giao dịch
      connection?.beginTransaction((err) => {
        if (err) {
          return onError(err); // Gọi hàm lỗi nếu không thể bắt đầu giao dịch
        }

        //Bước 1: Chèn người dùng hiện tại (học sinh chính)
        connection.execute(sql, [classId, userId], (err) => {
          if (err) {
            connection.rollback(() => {
              return onError(err); // Gọi hàm lỗi nếu có lỗi khi chèn
            });
          }
        });

        //Bước 2:Kiểm tra xem danh sách học sinh có rỗng không
        if (studentIds.length === 0) {
          // Nếu danh sách rỗng, commit và gọi onSuccess
          connection.commit((err) => {
            if (err) {
              return onError(err); // Gọi hàm lỗi nếu không thể commit
            }
            onSuccess(); // Gọi hàm thành công
          });
          return;
        }

        //Bước 3: Chèn danh sách học sinh nếu không rỗng
        const inserPromises = studentIds.map((studentId) => {
          return new Promise((resolve, reject) => {
            connection.execute(studentSql, [classId, studentId], (err) => {
              if (err) {
                reject(err); // Nếu có lỗi, từ chối promise
              } else {
                resolve(true); // Nếu thành công, giải quyết promise
              }
            });
          });
        });

        //Bước 4: Chờ tất cả các phép chèn học sinh hoàn thành
        Promise.all(inserPromises)
          .then(() => {
            connection.commit((err) => {
              if (err) {
                return onError(err); // Gọi hàm lỗi nếu không thể commit
              }
              onSuccess(); // Gọi hàm thành công khi hoàn tất
            });
          })
          .catch(() => {
            connection.rollback(() => {
              return onError(err); // Gọi hàm lỗi nếu có lỗi khi chèn học sinh
            });
          });
      });
    });
  }

  // Accpet class to tech
  public static acceptClassToTeach(
    classId: number,
    tutorId: string,
    onSuccess: () => void,
    onError: (error: any) => void
  ) {
    // Truy vấn để kiểm tra xem lớp học đã có gia sư hoặc người tham gia hay chưa
    const checkSql = `SELECT classes.tutor_id FROM classes WHERE classes.id = ?; `;

    const updateSql = ` UPDATE classes SET tutor_id =?, updated_at = ?  WHERE id =?`;

    SMySQL.getConnection((connection) => {
      connection?.execute<any>(checkSql, [classId], (error, results) => {
        if (error) {
          onError(error);
          return;
        }

        const classInfo = results[0];
        if (classInfo && (classInfo.tutor_id || classInfo.member_count > 0)) {
          const errorMessage = "Class already has a tutor.";
          onError(new Error(errorMessage));
          console.log(">>> error:", errorMessage);
          return;
        }

        // Nếu lớp chưa có gia sư và không có thành viên tham gia, thực hiện cập nhật
        connection.execute<any>(
          updateSql,
          [tutorId, new Date().getTime(), classId],
          (updateError, updateResults) => {
            if (updateError) {
              onError(updateError);
              return;
            }

            if (updateResults && updateResults.affectedRows > 0) {
              onSuccess();
              console.log(">>> Class accepted by tutor successfully");
            } else {
              const errorMessage =
                "No class was updated. Possibly invalid class ID.";
              onError(new Error(errorMessage));
              console.log(">>> error:", errorMessage);
            }
          }
        );
      });
    });
  }
}
