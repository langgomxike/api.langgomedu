import Class from "../models/Class";
import LearnerAtendance from "../models/LearnerAtendance";
import Lesson from "../models/Lesson";
import User from "../models/User";
import Attendance from "./../models/Attendance";
import SFirebase, {FirebaseNode} from "./SFirebase";
import SLog, {LogType} from "./SLog";
import SMySQL from "./SMySQL";
import mysql from "mysql2";

export default class SAttendance {
  public static getAttendanceHistoriesInClass(
    classId: number,
    onNext: (attendances: Attendance[]) => void
  ) {
    const sql = `SELECT *, attendances.id as id
                 FROM attendances
                          INNER JOIN lessons
                                     ON attendances.lesson_id = lessons.id
                          INNER JOIN users
                                     ON attendances.user_id = users.id
                 WHERE attendances.class_id = ?`;

    SMySQL.getConnection((connection) => {
      connection?.execute<any[]>(sql, [classId], (error, result) => {
        if (error) {
          // SLog.log(LogType.Error, "getAttendanceHistoriesInClass", "get attendances error", error);
          onNext([]);
          return;
        }

        // SLog.log(LogType.Info, "getAttendanceHistoriesInClass", "get attendance", result);
        const attendances: Attendance[] = [];
        result.forEach((data) => {
          const attendance = new Attendance(
            data?.id,
            undefined,
            undefined,
            undefined,
            data?.user_paid,
            data?.tutor_accept_paid
          );
          attendance.lesson = new Lesson(data?.lesson_id, undefined, data?.day);
          attendance.user = new User(data?.user_id, data?.full_name);
          attendances.push(attendance);
        });

        onNext(attendances);
      });
    });
  }

  public static getAttendanceHistoriesOfUser(
    userId: string,
    onNext: (attendances: Attendance[]) => void
  ) {
    const sql = `SELECT attendances.attended,
                        attendances.paid,
                        JSON_OBJECT(
                                'id', lessons.id,
                                'started_at', lessons.started_at
                        ) as lesson,
                        JSON_OBJECT(
                                'title', classes.title,
                                'major', JSON_ObJECT(
                                        'icon', majors.icon
                                         )
                        ) as class
                 FROM attendances
                          INNER JOIN lessons
                                     ON attendances.lesson_id = lessons.id
                          INNER JOIN classes
                                     ON classes.id = lessons.class_id
                          INNER JOIN majors
                                     ON majors.id = classes.major_id
                 WHERE attendances.user_id = ?
                 ORDER BY lessons.started_at DESC;`;



    SMySQL.getConnection((connection) => {
      connection?.execute<any[]>(sql, [userId], (error, result) => {
        if (error) {
          SLog.log(LogType.Error, "getAttendanceHistoriesOfUser", "get attendances error", error);
          onNext([]);
          return;
        }

        SLog.log(LogType.Info, "getAttendanceHistoriesOfUser", "get attendance", result);
        const attendances: Attendance[] = result as Attendance[] ?? [];
        onNext(attendances);
      });

    });
  }

// Hàm lấy chi tiết lớp học và danh sách học sinh thuộc user (leaner)
  public static

  getAttendanceByLeanerClassLesson(
    classId, lessonId, userId,
    onNext
      :
      (lessonDetail: Lesson, leaner: User) => void,
    onError
      :
      (message) => void
  ) {

    // Lấy chi tiết buổi học của lớp học
    const sqlClassDetails = `
        SELECT JSON_OBJECT(
                       'id', lessons.id,
                       'day', lessons.day,
                       'duration', lessons.duration,
                       'is_online', lessons.is_online,
                       'started_at', lessons.started_at,
                       'note', lessons.note,
                       'class', JSON_OBJECT(
                               'id', c.id,
                               'title', c.title,
                               'description', c.description,
                               'price', c.price,
                               'tutor', JSON_OBJECT(
                                       'id', tutor.id,
                                       'full_name', tutor.full_name,
                                       'email', tutor.email,
                                       'phone_number', tutor.phone_number,
                                       'avatar', tutor.avatar,
                                       'banking_number', tutor.banking_number,
                                       'banking_code', tutor.banking_code
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
                               'class_creation_fee', c.class_creation_fee,
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
                                          )
                                )
               ) AS lesson
        FROM lessons
                 LEFT JOIN classes c ON c.id = lessons.class_id
            -- Các thông tin user
                 LEFT JOIN users tutor ON tutor.id = c.tutor_id
                 LEFT JOIN users author ON author.id = c.author_id
            -- Lấy tên môn học và hình ảnh môn học
                 LEFT JOIN majors ON majors.id = c.major_id
            -- Cấp cấp độ của lớp học
                 LEFT JOIN class_levels cl ON cl.id = c.class_level_id
                 LEFT JOIN addresses ON addresses.id = c.address_id
        WHERE lessons.id = ?;
    `;

    // Thông tin người học nếu nó là cha
    const sqlStudentAttendance = `
        SELECT JSON_OBJECT(
                       "id", IFNULL(parent.id, learner.id),
                       "full_name", IFNULL(parent.full_name, learner.full_name),
                       "email", IFNULL(parent.email, learner.email),
                       "phone_number", IFNULL(parent.phone_number, learner.phone_number),
                       "avatar", IFNULL(parent.avatar, learner.avatar),
                       "attendance",
                       CASE
                           WHEN att.lesson_id IS NOT NULL THEN
                               JSON_OBJECT(
                                       "lesson_id", att.lesson_id,
                                       "attended", att.attended,
                                       "attended_at", att.attended_at,
                                       "paid", att.paid,
                                       "paid_at", att.paid_at,
                                       "confirm_paid", att.confirm_paid,
                                       "confirmed_at", att.confirm_paid_at,
                                       "payment_path", att.payment_path,
                                       "type", att.type,
                                       "deferred", att.deferred
                               )
                           ELSE NULL
                           END,
                       "children", CASE
                                       WHEN learner.id IS NOT NULL AND learner.parent_id = parent.id THEN
                                           JSON_ARRAYAGG(
                                                   JSON_OBJECT(
                                                           'id', learner.id,
                                                           'full_name', learner.full_name,
                                                           'email', learner.email,
                                                           'phone_number', learner.phone_number,
                                                           'avatar', learner.avatar,
                                                           "attendance",
                                                           CASE
                                                               WHEN child_att.lesson_id IS NOT NULL THEN
                                                                   JSON_OBJECT(
                                                                           "lesson_id", child_att.lesson_id,
                                                                           "attended", child_att.attended,
                                                                           "attended_at", child_att.attended_at,
                                                                           "paid", child_att.paid,
                                                                           "paid_at", child_att.paid_at,
                                                                           "confirm_paid", child_att.confirm_paid,
                                                                           "confirmed_at", child_att.confirm_paid_at,
                                                                           "payment_path", child_att.payment_path,
                                                                           "type", child_att.type,
                                                                           "deferred", child_att.deferred
                                                                   )
                                                               ELSE NULL
                                                               END
                                                   )
                                           )
                                       ELSE NULL
                           END
               ) AS learner
        FROM classes c
                 LEFT JOIN class_members cm ON cm.class_id = c.id
                 LEFT JOIN users learner ON learner.id = cm.user_id -- Lấy danh sách tất cả học viên
                 LEFT JOIN attendances att ON att.user_id = learner.id AND att.lesson_id = ?
                 LEFT JOIN users parent ON parent.id = learner.parent_id -- Liên kết cha mẹ nếu có
                 LEFT JOIN attendances child_att ON child_att.user_id = learner.id AND child_att.lesson_id = ?
        WHERE c.id = ?
          AND (learner.id = ? OR parent.id = ?)
        GROUP BY IFNULL(parent.id, learner.id);
    `;

    console.log(mysql.format(sqlStudentAttendance, [lessonId, lessonId, classId, userId, userId]));


    SMySQL.getConnection((connection) => {
      connection?.execute<any[]>(sqlClassDetails, [lessonId], (error, resultClass) => {
        if (error) {
          // SLog.log(LogType.Error, "getAttendance", "get attendance error", error);
          console.log(">>> get student Attendance: ", error);
          onError("Error get detail class!");
          return;
        }

        const lessonDetail = resultClass[0].lesson;

        connection.execute<any>(sqlStudentAttendance, [lessonId, lessonId, classId, userId, userId], (err, resultLearner) => {
          if (error) {
            console.log(">>> Error fetching student attendance:", error);
            onError("Error read student attendance!")
            return;
          }

          const learner = resultLearner[0].learner;

          if (learner.children && learner.children.filter(Boolean).length) {
            learner.children.map((child) => {
              if (child.attendance) {
                // Chuyển đổi 0/1 trong attendance thành true/false
                child.attendance.paid = !!child.attendance.paid;
                child.attendance.attended = !!child.attendance.attended;
                child.attendance.deferred = !!child.attendance.deferred;
                child.attendance.confirm_paid = !!child.attendance.confirm_paid;
              }
            })
          }

          // Chuyển đổi attendance của learner chính (nếu có)
          if (learner.attendance) {
            learner.attendance.paid = !!learner.attendance.paid;
            learner.attendance.attended = !!learner.attendance.attended;
            learner.attendance.deferred = !!learner.attendance.deferred;
            learner.attendance.confirm_paid = !!learner.attendance.confirm_paid;
          }

          // Trả kết quả với cấu trúc gồm chi tiết lớp học và danh sách học sinh
          onNext(lessonDetail, learner);


        })
      });
    });
  }

  public static

  getAttendanceByLeanerLesson(
    lessonId, userId,
    onNext
      :
      (attendancce: Attendance) => void,
  ) {

    const sql = `
        SELECT *
        FROM attendances
        WHERE user_id = ?
          AND lesson_id = ?;
    `

    SMySQL.getConnection((connection) => {
      connection?.execute<any[]>(sql, [userId, lessonId], (error, result) => {
        if (error) {
          console.log(">>> getAttendanceByLeanerLesson: ", error);
          return;
        }

        const attendance = result[0];
        if (attendance) {
          attendance.paid = !!attendance.paid;
          attendance.attended = !!attendance.attended;
          attendance.deferred = !!attendance.deferred;
          attendance.confirm_paid = !!attendance.confirm_paid;
        }
        onNext(attendance)

      })
    })

  }

// Hàm lấy chi tiết lớp học và danh sách học sinh thuộc user (tutor)
  public static

  getAttendanceByTutorClassLesson(
    classId, lessonId,
    onNext
      :
      (learner: User[]) => void
  ) {

    // Câu truy vấn lấy chi tiết lesson của lớp họcs
    // const sqlLessonDetail =  `
    //      SELECT
    //         JSON_OBJECT(
    //             'id', lessons.id,
    //             'day', lessons.day,
    //             'duration', lessons.duration,
    //             'is_online', lessons.is_online,
    //             'started_at', lessons.started_at,
    //             'note', lessons.note,
    //             'class', JSON_OBJECT(
    //                 'id', c.id,
    //                 'title', c.title,
    //                 'description', c.description,
    //                 'price', c.price,
    //                 'tutor', JSON_OBJECT(
    //                     'id', tutor.id,
    //                     'full_name', tutor.full_name,
    //                     'email', tutor.email,
    //                     'phone_number', tutor.phone_number,
    //                     'avatar', tutor.avatar,
    //                     'banking_number', tutor.banking_number,
    //                     'banking_code', tutor.banking_code
    //                 ),
    //                 'author', JSON_OBJECT(
    //                     'id', author.id,
    //                     'full_name', author.full_name,
    //                     'email', author.email,
    //                     'phone_number', author.phone_number,
    //                     'avatar', author.avatar
    //                 ),
    //                 'major', JSON_OBJECT(
    //                     'id', majors.id,
    //                     'icon', majors.icon,
    //                     'vn_name', majors.vn_name,
    //                     'en_name', majors.en_name,
    //                     'ja_name', majors.ja_name
    //                 ),
    //                 'class_level', JSON_OBJECT(
    //                     'id', cl.id,
    //                     'vn_name', cl.vn_name,
    //                     'en_name', cl.en_name,
    //                     'ja_name', cl.ja_name
    //                 ),
    //                 'class_creation_fee', c.class_creation_fee,
    //                 'max_learners', c.max_learners,
    //                 'started_at', c.started_at,
    //                 'ended_at', c.ended_at,
    //                 'created_at', c.created_at,
    //                 'updated_at', c.updated_at,
    //                 'address', JSON_OBJECT (
    //                     "id", addresses.id,
    //                     "province", addresses.province,
    //                     "district", addresses.district,
    //                     "ward", addresses.ward,
    //                     "detail", addresses.detail
    //                 )
    //             )
    //         ) AS lesson
    //     FROM lessons
    //     LEFT JOIN classes c ON c.id = lessons.class_id
    //     -- Các thông tin user
    //     LEFT JOIN users tutor ON tutor.id = c.tutor_id
    //     LEFT JOIN users author ON author.id = c.author_id
    //     -- Lấy tên môn học và hình ảnh môn học
    //     LEFT JOIN majors ON majors.id = c.major_id
    //     -- Cấp cấp độ của lớp học
    //     LEFT JOIN class_levels cl ON cl.id = c.class_level_id
    //     LEFT JOIN addresses ON addresses.id = c.address_id
    //     WHERE lessons.id = ? AND  c.id = ?;
    // `;

    // Lấy danh sách học sinh đã được điểm danh trong lớp đó nếu có
    const sqlLearner = `
        SELECT JSON_OBJECT(
                       "id", learner.id,
                       "full_name", learner.full_name,
                       "phone_number", learner.phone_number,
                       "avatar", learner.avatar,
                       "parent_id", learner.parent_id,
                       "attendance",
                       CASE
                           WHEN att.lesson_id IS NOT NULL THEN
                               JSON_OBJECT(
                                       "lesson_id", att.lesson_id,
                                       "attended", att.attended,
                                       "attended_at", att.attended_at,
                                       "paid", att.paid,
                                       "paid_at", att.paid_at,
                                       "confirm_paid", att.confirm_paid,
                                       "confirmed_at", att.confirm_paid_at,
                                       "payment_path", att.payment_path,
                                       "type", att.type,
                                       "deferred", att.deferred,
                                       "deferred", att.deferred,
                                       "confirm_deferred", att.confirm_deferred,
                                       "confirm_deferred_at", att.confirm_deferred_at
                               )
                           ELSE NULL
                           END
               ) AS learner
        FROM classes
                 LEFT JOIN class_members cm ON cm.class_id = classes.id
                 LEFT JOIN users learner ON learner.id = cm.user_id
                 LEFT JOIN attendances att
                           ON att.user_id = learner.id AND att.lesson_id = ? -- Chỉ lấy dữ liệu điểm danh cho bài học cụ thể
                 LEFT JOIN lessons ON lessons.class_id = classes.id AND lessons.id = ? -- Chỉ lấy bài học cụ thể
        WHERE classes.id = ?;

    `

    SMySQL.getConnection((connection) => {
      try {
        connection?.execute<any[]>(sqlLearner, [lessonId, lessonId, classId], (error, resultLearners) => {
          if (error) {
            console.log(">>> getAttendanceByLeanerLesson: ", error);
            return;
          }

          const learners: User[] = resultLearners.map((result) => {
            const learner = result.learner;
            if (learner && learner.attendance) {
              return {
                ...learner, // Giữ nguyên các thông tin khác
                attendance: {
                  ...learner.attendance,
                  paid: Boolean(learner.attendance.paid),
                  attended: Boolean(learner.attendance.attended),
                  deferred: Boolean(learner.attendance.deferred),
                  confirm_paid: Boolean(learner.attendance.confirm_paid),
                  confirm_deferred: Boolean(learner.attendance.confirm_deferred),
                },
              };
            }
            return learner; // Nếu không có attendance, trả về learner gốc
          });

          // Trả kết quả với cấu trúc gồm chi tiết lớp học và danh sách học sinh
          onNext(learners);

        })

      } catch (error) {

      }
    })


    // SMySQL.getConnection(async (connection) => {
    //   try {
    //     const resultLesson = await new Promise<any>((resolve, reject) =>{
    //       connection?.execute<any>(sqlLessonDetail, [lessonId, classId], (error, result) => {
    //         if (error) {
    //           reject(error);
    //         } else {
    //           resolve(result);
    //         }
    //       });
    //     })

    //     const lessonDetail = resultLesson[0].lesson;
    //     lessonDetail.is_online = lessonDetail.is_online === 1;

    //     const resultLearners = await new Promise<any[]>((resolve, reject) =>{
    //       connection?.execute<any[]>(sqlLearner, [lessonId, lessonId, classId], (err, result) => {
    //         if (err) {
    //           reject(err);
    //         } else {
    //           resolve(result);
    //         }
    //       });
    //     })

    //     const learners: User[] = resultLearners.map((result) => {
    //       const learner = result.learner;
    //       if (learner && learner.attendance) {
    //         return {
    //           ...learner, // Giữ nguyên các thông tin khác
    //           attendance: {
    //             ...learner.attendance,
    //             paid: Boolean(learner.attendance.paid),
    //             attended: Boolean(learner.attendance.attended),
    //             deferred: Boolean(learner.attendance.deferred),
    //             confirm_paid: Boolean(learner.attendance.confirm_paid),
    //           },
    //         };
    //       }
    //       return learner; // Nếu không có attendance, trả về learner gốc
    //     });


    //      // Trả kết quả với cấu trúc gồm chi tiết lớp học và danh sách học sinh
    //     onNext(lessonDetail, learners);

    //   } catch (error) {
    //     console.log("Error: ", error);

    //   }

    // });
  }

// Hàm gửi yêu cầu điểm danh từ tutor đến learner
  public static

  requestAttendance(
    learnerAttendance
      :
      LearnerAtendance[],
    onNext
      :
      (messages: string, result: boolean) => void
  ) {

    let lessonId = learnerAttendance[0].lesson_id
    // Tạo mảng giá trị để chèn vào bảng attendances
    const attendanceValues = learnerAttendance.map((attendance) => {
      return [
        attendance.lesson_id,
        attendance.id,
        attendance.attended,
        new Date().getTime() // attended_at
      ]
    });

    const numberOfRecords = learnerAttendance.length;

    const allPlaceholders = new Array(numberOfRecords).fill(`(?, ?, ?, ?)`).join(', ');

    const attendanceSql = `INSERT INTO attendances
                               (lesson_id, user_id, attended, attended_at)
                           VALUES ${allPlaceholders};`;


    console.log(">>> attendanceValues", attendanceValues.flat());
    console.log(">>> attendanceValues flat", attendanceValues);
    console.log("attendanceSql", attendanceSql);


    SMySQL.getConnection((connection) => {
      connection?.beginTransaction((err) => {
        if (err) {
          onNext("Transaction start failed", false);
          return;
        }

        // Step 1: Insert into attendances
        connection.execute<any>(
          attendanceSql,
          attendanceValues.flat(),
          (error, result) => {
            if (error) {
              connection.rollback(() => {
                console.log("Failed to insert into attendances", error);

                onNext("Failed to insert into attendances", false);
              });
              return;
            }

            SFirebase.push(
              FirebaseNode.Attendances,
              [{key: FirebaseNode.LessonId, value: lessonId}],
              () => {
                onNext("All attendance records and payments have been inserted successfully!", true);
              }
            );
          }
        );
      });
    });
  }

// Hàm cho phép learner chấp nhận điểm danh của tutor
  public static

  acceptAttendance(
    lessonId
      :
      number,
    userId
      :
      string,
    confirmAttendance
      :
      boolean,
    attendedAt
      :
      number,
    onNext
      :
      (messages: string, result: boolean) => void
  ) {

    const confirmedAt = new Date().getTime();

    const sql = `
        UPDATE attendances a
        SET confirm_attendance = ?,
            confirmed_at       = ?
        WHERE a.lesson_id = ?
          AND a.user_id = ?
          AND DATE (FROM_UNIXTIME(a.attended_at / 1000)) = DATE (FROM_UNIXTIME(? / 1000));
    `;

    // Thực thi truy vấn
    SMySQL.getConnection((connection) => {
      connection?.execute(
        sql,
        [confirmAttendance, confirmedAt, lessonId, userId, attendedAt],
        (error, result) => {
          if (error) {
            onNext("Failed to update attendance confirmation for all students", false);
            console.log("Error updating attendance confirmation:", error);
            return;
          }

          onNext("Attendance confirmation updated successfully for all students!", true);
        }
      );
    });

  }

// Hàm cập nhật thanh toán cho learner
  public static

  updatePaymentOfLearner(
    lessonId
      :
      number,
    userId
      :
      string,
    paid
      :
      boolean,
    paymentPath
      :
      string | null,
    type
      :
      string,
    deferred
      :
      boolean,
    onNext
      :
      (message: string, result: boolean) => void
  ) {

    console.log("lessonId: ", lessonId);
    console.log("userIds: ", userId);
    console.log("paid: ", paid);
    console.log("deferred: ", deferred);
    console.log("paymentPath: ", paymentPath);

    // Tạo placeholders cho danh sách userIds
    const sql = `
        UPDATE attendances
        SET paid         = ?,
            payment_path = ?,
            paid_at      = ?,
            type         = ?,
            deferred     = ?
        WHERE lesson_id = ?
          AND user_id IN (?);
    `;

    const paidAt = new Date().getTime();
    const values = [paid, paymentPath, paidAt, type, deferred, lessonId, userId];

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
          SFirebase.push(
            FirebaseNode.Attendances,
            [{key: FirebaseNode.LessonId, value: lessonId}],
            () => {
              onNext(`Payment update successful for ID: ${lessonId}`, true);
            }
          );
        }

      });
    })


  }

// Hàm cập nhật thanh toán cho learner
  public static

  confirmPaymentByTutor(
    lessonId
      :
      number, userId
      :
      string,
    action
      :
      string,
    value
      :
      boolean,
    onNext
      :
      (message: string, result: boolean) => void
  ) {

    // Tạo placeholders cho danh sách userId
    let sql = "";
    if (action === "confirm_paid") {
      sql = `
          UPDATE attendances
          SET confirm_paid    = ?,
              confirm_paid_at = ?
          WHERE lesson_id = ?
            AND user_id = ?;
      `;
    } else if (action === "confirm_deferred") {
      sql = `
          UPDATE attendances
          SET confirm_deferred    = ?,
              confirm_deferred_at = ?
          WHERE lesson_id = ?
            AND user_id = ?;
      `;
    }

    const date = new Date().getTime();
    const values = [value, date, lessonId, userId];

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
          SFirebase.push(
            FirebaseNode.Attendances,
            [{key: FirebaseNode.LessonId, value: lessonId}],
            () => {
              onNext(`Confirmed by tutor update successful: ${lessonId}`, true);
            }
          );
        }

      });
    })
  }
}
