import Class from "../models/Class";
import LearnerAtendance from "../models/LearnerAtendance";
import Lesson from "../models/Lesson";
import User from "../models/User";
import Attendance from "./../models/Attendance";
import SFirebase, { FirebaseNode } from "./SFirebase";
import SLog, { LogType } from "./SLog";
import SMySQL from "./SMySQL";
export default class SAttendance {
  public static getAttendanceHistoriesInClass(
    classId: number,
    onNext: (attendances: Attendance[]) => void
  ) {
    const sql = `SELECT *, attendances.id as id FROM attendances
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

  // Hàm lấy chi tiết lớp học và danh sách học sinh thuộc user (leaner)
  public static getAttendanceByLeanerClassLesson(
    classId, lessonId, userId, attendedAt,
    onNext: (lessonDetail: Lesson, attendStudents: Attendance[]) => void,
    onError: (message) => void
  ) {

    const sqlClassDetails =  `
        SELECT
            JSON_OBJECT(
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
                    'address', JSON_OBJECT (
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

  //   const sqlStudentAttendance = `
  //   SELECT
	// JSON_OBJECT(
  //       "id", a.id,
  //       "lesson_id", a.lesson_id,
  //       "user", JSON_OBJECT (
  //           "id", users.id,
  //           "full_name", users.full_name
  //       ),
  //       "student", JSON_OBJECT (
  //            "id", s.id,
  //           "full_name", s.full_name
  //       ),
  //       "attended", a.attended,
  //       "confirm_attendance", a.confirm_attendance,
  //      	"attended_at", a.attended_at,
  //       "attendance_payment", JSON_OBJECT(
  //           "id", ap.id,
  //           "paid", ap.paid,
  //           "confirmed_by_tutor", ap.confirmed_by_tutor,
  //           "payment_path", ap.payment_path,
  //           "paid_at", ap.paid_at,
  //           "confirmed_at", ap.confirmed_at,
  //           "type", ap.type,
  //           "deferred", ap.deferred
  //       )    
  //   ) as attendance

  //     FROM attendances a
  //     LEFT JOIN students s ON s.id = a.student_id
  //     LEFT JOIN users ON users.id = a.user_id
  //     LEFT JOIN attendance_payments ap ON ap.attendance_id = a.id
      
  //   WHERE a.lesson_id = ? 
  //   AND a.user_id = ? 
  //   AND DATE(FROM_UNIXTIME(a.attended_at / 1000)) = DATE(FROM_UNIXTIME(? / 1000));
  // `;
  

    SMySQL.getConnection((connection) => {
      connection?.execute<any[]>(sqlClassDetails, [lessonId], (error, resultClass) => {
        if (error) {
          // SLog.log(LogType.Error, "getAttendance", "get attendance error", error);
          console.log(">>> get student Attendance: ", error);
          onError("Error get detail class!");
          return;
        }

        const lessonDetail = resultClass[0].lesson;
        
        onNext(lessonDetail, []);

        // connection.execute<any>(sqlStudentAttendance, [lessonId, userId, attendedAt], (err, resultAttendances) => {
        //   if (error) {
        //     console.log(">>> Error fetching student attendance:", error);
        //     onError("Error read student attendance!")
        //     return;
        //   }
          
        //   const attendances: Attendance[] = resultAttendances.map((result) => ({
        //     ...result.attendance,
        //     attended: Boolean(result.attendance.attended),
        //     confirm_attendance: Boolean(result.attendance.confirm_attendance),
        //     attendance_payment: {
        //       ...result.attendance.attendance_payment,
        //       paid: Boolean(result.attendance.attendance_payment?.paid),
        //       deferred: Boolean(result.attendance.attendance_payment?.deferred),
        //       confirmed_by_tutor: Boolean(result.attendance.attendance_payment?.confirmed_by_tutor),
        //     }
        //   }));

        //   // Trả kết quả với cấu trúc gồm chi tiết lớp học và danh sách học sinh
        //   onNext(lessonDetail, attendances);


        // })
      });
    });
  }

  // Hàm lấy chi tiết lớp học và danh sách học sinh thuộc user (tutor)
  public static getAttendanceByTutorClassLesson(
    classId, lessonId, userId,
    onNext: (lessonDetail: Lesson, attendStudents: Attendance[], learner: User[]) => void,
    onError: (message) => void
  ) {

    // Câu truy vấn lấy chi tiết lesson của lớp họcs
    const sqlLessonDetail =  `
         SELECT
            JSON_OBJECT(
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
                    'address', JSON_OBJECT (
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
        WHERE lessons.id = ? AND  c.id = ?;
    `;

    // Lấy danh sách học sinh đã được điểm danh trong lớp đó nếu có
  const sqlStudentAttendance = `
  SELECT
	JSON_OBJECT(
        "lesson_id", a.lesson_id,
        "user", JSON_OBJECT (
            "id", users.id,
            "full_name", users.full_name,
            "avatar", users.avatar
        ),
        "attended", a.attended,
       	"attended_at", a.attended_at,
        "paid", a.paid,
        "paid_at", a.paid_at,
        "confirm_paid", a.confirm_paid,
        "confirmed_at", a.confirm_paid_at,
        "payment_path", a.payment_path,
        "type", a.type,
        "deferred", a.deferred
    ) as attendance

      FROM attendances a
      LEFT JOIN users ON users.id = a.user_id
      WHERE a.lesson_id = ?;
  `;

  // Lấy danh sách học sinh trong lớp này
  const sqlLearner = `
    SELECT 
    JSON_OBJECT(
        "id", IFNULL(parent.id, learner.id),
        "full_name", IFNULL(parent.full_name, learner.full_name),
        "email", IFNULL(parent.email, learner.email),
        "phone_number", IFNULL(parent.phone_number, learner.phone_number),
        "avatar", IFNULL(parent.avatar, learner.avatar),
        "children", JSON_ARRAYAGG(
            CASE 
                WHEN learner.id IS NOT NULL AND learner.parent_id = parent.id THEN 
                    JSON_OBJECT(
                        'id', learner.id,
                        'full_name', learner.full_name,
                        'email', learner.email,
                        'phone_number', learner.phone_number,
                        'avatar', learner.avatar
                    )
                ELSE NULL
            END
        )
    ) AS learner
    FROM classes c
    LEFT JOIN class_members cm ON cm.class_id = c.id
    LEFT JOIN users learner ON learner.id = cm.user_id -- Lấy danh sách tất cả học viên
    LEFT JOIN users parent ON parent.id = learner.parent_id -- Liên kết cha mẹ nếu có
    WHERE c.id = ? -- Lọc theo lớp
    GROUP BY IFNULL(parent.id, learner.id);

  `


    SMySQL.getConnection(async (connection) => {
      try {
        const resultLesson = await new Promise<any>((resolve, reject) =>{
          connection?.execute<any>(sqlLessonDetail, [lessonId, classId], (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          });
        })

        const lessonDetail = resultLesson[0].lesson;
        lessonDetail.is_online = lessonDetail.is_online === 1;

        const resultAttendances = await new Promise<any[]>((resolve, reject) =>{
          connection?.execute<any[]>(sqlStudentAttendance, [lessonId], (err, result) => {
            if (err) {
              reject(err);
            } else {
              resolve(result);
            }
          });
        })

        const attendances: Attendance[] = resultAttendances.map((result) => ({
          ...result.attendance,
          attended: Boolean(result.attendance.attended),
          attended_at: Number(result.attendance.attended_at),
          paid: Boolean(result.attendance.paid) ?? false,
          confirm_paid: Boolean(result.attendance.confirm_paid) ?? false,
        }));

        // // console.log(">>> attendancce", attendances);

        const resultLearners = await new Promise<any[]>((resolve, reject) => {
          connection?.execute<any[]>(sqlLearner, [classId], (err, result) => {
            if (err) {
              reject(err);
            } else {
              resolve(result);
            }
          });
        });

        const learners = resultLearners
        // console.log(">>> learner: ", JSON.stringify(resultLearners[0].learners, null, 2));

         // Trả kết quả với cấu trúc gồm chi tiết lớp học và danh sách học sinh
        onNext(lessonDetail, attendances, learners);
        
      } catch (error) {
        console.log("Error: ", error);
        
      }
    
    });
  }

  // Hàm gửi yêu cầu điểm danh từ tutor đến learner
  public static requestAttendance(
    learnerAttendance: LearnerAtendance[],
    onNext: (messages: string, result: boolean) => void
  ) {
     // Tạo mảng giá trị để chèn vào bảng attendances 
     const attendanceValues = learnerAttendance.map((attendance) =>{
     return  [
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

            onNext("All attendance records and payments have been inserted successfully!", true);
          
          }
        );
      });
    });
  }

  // Hàm cho phép learner chấp nhận điểm danh của tutor
  public static acceptAttendance(
    lessonId: number,
    userId: string,
    confirmAttendance: boolean,
    attendedAt: number,
    onNext: (messages: string, result: boolean) => void
  ) {

    const confirmedAt = new Date().getTime();

    const sql = `
      UPDATE attendances a
      SET confirm_attendance = ?, confirmed_at = ?
      WHERE a.lesson_id = ? 
      AND a.user_id = ? 
      AND DATE(FROM_UNIXTIME(a.attended_at / 1000)) = DATE(FROM_UNIXTIME(? / 1000));
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
  public static updatePaymentOfLearner(
    lessonId: number,
  userIds: number[], 
  paid: boolean, 
  paymentPath: string | null, 
  type: string, 
  deferred: boolean,
  onNext: (message: string, result: boolean) => void
  ) {

    console.log("lessonId: ", lessonId);
  console.log("userIds: ", userIds);
  console.log("paid: ", paid);
  console.log("deferred: ", deferred);
  console.log("paymentPath: ", paymentPath);
    
   // Tạo placeholders cho danh sách userIds
  const userPlaceholders = userIds.map(() => '?').join(', ');
  const sql = `
  UPDATE attendances 
  SET paid = ?, payment_path = ?, paid_at = ?, type = ?, deferred = ?
  WHERE lesson_id = ? AND user_id IN (${userPlaceholders});
`;

    const paidAt = new Date().getTime();
    const values = [paid, paymentPath, paidAt, type, deferred, lessonId, ...userIds];
    console.log("values: ", values);
    

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
            onNext('Payment update successful', true);
          }

        });
    })


  }

   // Hàm cập nhật thanh toán cho learner
   public static confirmPaymentByTutor(
    lessonId: number, userIds: number[], confirmPaid: boolean,
    onNext: (message: string, result: boolean) => void
  ) {
  
   // Tạo placeholders cho danh sách userIds
    const userPlaceholders = userIds.map(() => '?').join(', ');
    const sql = `
      UPDATE attendances SET confirm_paid = ?, confirm_paid_at = ?
      WHERE lesson_id = ? AND user_id IN (${userPlaceholders});
    `;

    const confirmedAt = new Date().getTime();
    const values = [confirmPaid, confirmedAt, lessonId , ...userIds];

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
            onNext('Confirmed by tutor update successful', true);
          }

        });
    })
  }
}
