import Class from "../models/Class";
import LearnerAtendance from "../models/LearnerAtendance";
import Lesson from "../models/Lesson";
import Student from "../models/Student";
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
                        'avatar', JSON_OBJECT(
                            'id', tutor_avatar.id,
                            'name', tutor_avatar.name,
                            'path', tutor_avatar.path
                        ), 
                        'information', JSON_OBJECT(
                            'banking_number', tutor_info.banking_number,
                            'banking_code', tutor_info.banking_code
                        )
                    ),
                    'author', JSON_OBJECT(
                        'id', author.id,
                        'full_name', author.full_name,
                        'email', author.email,
                        'phone_number', author.phone_number,
                        'avatar', JSON_OBJECT(
                            'id', author_avatar.id,
                            'name', author_avatar.name,
                            'path', author_avatar.path
                        )
                    ),
                    'major', JSON_OBJECT(
                        'id', majors.id,
                        'icon', JSON_OBJECT(
                            'id', major_icon.id,
                            'name', major_icon.name,
                            'path', major_icon.path
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
                    'class_creation_fee', c.class_creation_fee,
                    'max_learners', c.max_learners,
                    'started_at', c.started_at,
                    'ended_at', c.ended_at,
                    'created_at', c.created_at,
                    'updated_at', c.updated_at,
                    'address_1', c.address_1,
                    'address_2', c.address_2,
                    'address_3', c.address_3,
                    'address_4', c.address_4
                )
            ) AS lesson
        FROM lessons
        LEFT JOIN classes c ON c.id = lessons.class_id
        -- Các thông tin user
        LEFT JOIN users tutor ON tutor.id = c.tutor_id
        LEFT JOIN users author ON author.id = c.author_id
        -- Lấy avatar của user
        LEFT JOIN files tutor_avatar ON tutor_avatar.id = tutor.avatar_id
        LEFT JOIN informations tutor_info ON tutor_info.user_id = tutor.id
        LEFT JOIN files author_avatar ON author_avatar.id = author.avatar_id
        -- Lấy tên môn học và hình ảnh môn học
        LEFT JOIN majors ON majors.id = c.major_id
        LEFT JOIN files major_icon ON major_icon.id = majors.icon_id
        -- Cấp cấp độ của lớp học
        LEFT JOIN class_levels cl ON cl.id = c.class_level_id
        WHERE c.id = ? AND lessons.id = ?;
    `;

    const sqlStudentAttendance = `
    SELECT
	JSON_OBJECT(
        "id", a.id,
        "lesson_id", a.lesson_id,
        "user", JSON_OBJECT (
            "id", users.id,
            "full_name", users.full_name
        ),
        "student", JSON_OBJECT (
             "id", s.id,
            "full_name", s.full_name
        ),
        "attended", a.attended,
        "confirm_attendance", a.confirm_attendance,
       	"attended_at", a.attended_at,
        "attendance_payment", JSON_OBJECT(
            "id", ap.id,
            "paid", ap.paid,
            "confirmed_by_tutor", ap.confirmed_by_tutor,
            "payment_path", ap.payment_path,
            "paid_at", ap.paid_at
        )    
    ) as attendance

      FROM attendances a
      LEFT JOIN students s ON s.id = a.student_id
      LEFT JOIN users ON users.id = a.user_id
      LEFT JOIN attendance_payments ap ON ap.attendance_id = a.id
      
    WHERE a.lesson_id = ? 
    AND a.user_id = ? 
    AND DATE(FROM_UNIXTIME(a.attended_at / 1000)) = DATE(FROM_UNIXTIME(? / 1000));
  `;
  

    SMySQL.getConnection((connection) => {
      connection?.execute<any[]>(sqlClassDetails, [classId, lessonId], (error, resultClass) => {
        if (error) {
          // SLog.log(LogType.Error, "getAttendance", "get attendance error", error);
          console.log(">>> get student Attendance: ", error);
          onError("Error get detail class!");
          return;
        }

        const lessonDetail = resultClass[0].lesson;
        
        connection.execute<any>(sqlStudentAttendance, [lessonId, userId, attendedAt], (err, resultAttendances) => {
          if (error) {
            console.log(">>> Error fetching student attendance:", error);
            onError("Error read student attendance!")
            return;
          }
          
          const attendances: Attendance[] = resultAttendances.map((result) => ({
            ...result.attendance,
            attended: Boolean(result.attendance.attended),
            confirm_attendance: Boolean(result.attendance.confirm_attendance),
            attendance_payment: {
              ...result.attendance.attendance_payment,
              paid: Boolean(result.attendance.attendance_payment?.paid),
              confirmed_by_tutor: Boolean(result.attendance.attendance_payment?.confirmed_by_tutor),
            }
          }));

          // Trả kết quả với cấu trúc gồm chi tiết lớp học và danh sách học sinh
          onNext(lessonDetail, attendances);


        })
      });
    });
  }

  // Hàm lấy chi tiết lớp học và danh sách học sinh thuộc user (tutor)
  public static getAttendanceByTutorClassLesson(
    classId, lessonId, userId,
    onNext: (lessonDetail: Lesson, attendStudents: Attendance[], learner: User[]) => void,
    onError: (message) => void
  ) {

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
                        'avatar', JSON_OBJECT(
                            'id', tutor_avatar.id,
                            'name', tutor_avatar.name,
                            'path', tutor_avatar.path
                        )
                    ),
                    'author', JSON_OBJECT(
                        'id', author.id,
                        'full_name', author.full_name,
                        'email', author.email,
                        'phone_number', author.phone_number,
                        'avatar', JSON_OBJECT(
                            'id', author_avatar.id,
                            'name', author_avatar.name,
                            'path', author_avatar.path
                        )
                    ),
                    'major', JSON_OBJECT(
                        'id', majors.id,
                        'icon', JSON_OBJECT(
                            'id', major_icon.id,
                            'name', major_icon.name,
                            'path', major_icon.path
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
                    'class_creation_fee', c.class_creation_fee,
                    'max_learners', c.max_learners,
                    'started_at', c.started_at,
                    'ended_at', c.ended_at,
                    'created_at', c.created_at,
                    'updated_at', c.updated_at,
                    'address_1', c.address_1,
                    'address_2', c.address_2,
                    'address_3', c.address_3,
                    'address_4', c.address_4
                )
            ) AS lesson
        FROM lessons
        LEFT JOIN classes c ON c.id = lessons.class_id
        -- Các thông tin user
        LEFT JOIN users tutor ON tutor.id = c.tutor_id
        LEFT JOIN users author ON author.id = c.author_id
        -- Lấy avatar của user
        LEFT JOIN files tutor_avatar ON tutor_avatar.id = tutor.avatar_id
        LEFT JOIN files author_avatar ON author_avatar.id = author.avatar_id
        -- Lấy tên môn học và hình ảnh môn học
        LEFT JOIN majors ON majors.id = c.major_id
        LEFT JOIN files major_icon ON major_icon.id = majors.icon_id
        -- Cấp cấp độ của lớp học
        LEFT JOIN class_levels cl ON cl.id = c.class_level_id
        WHERE c.id = ? AND lessons.id = ?;

    `;

  const sqlStudentAttendance = `
  SELECT
	JSON_OBJECT(
        "id", a.id,
        "lesson_id", a.lesson_id,
        "user", JSON_OBJECT (
            "id", users.id,
            "full_name", users.full_name
        ),
        "student", JSON_OBJECT (
             "id", s.id,
            "full_name", s.full_name
        ),
        "attended", a.attended,
        "confirm_attendance", a.confirm_attendance,
       	"attended_at", a.attended_at,
        "attendance_payment", JSON_OBJECT(
            "id", ap.id,
            "paid", ap.paid,
            "confirmed_by_tutor", ap.confirmed_by_tutor,
            "payment_path", ap.payment_path,
            "paid_at", ap.paid_at
        )    
    ) as attendance

      FROM attendances a
      LEFT JOIN students s ON s.id = a.student_id
      LEFT JOIN users ON users.id = a.user_id
      LEFT JOIN attendance_payments ap ON ap.attendance_id = a.id
      
      WHERE a.lesson_id = ?;
  `;

  const sqlLearner = `
    SELECT 
    JSON_ARRAYAGG(
        JSON_OBJECT(
                'id', learner.id,
                'full_name', learner.full_name,
                'email', learner.email,
                'phone_number', learner.phone_number,
                'avatar', JSON_OBJECT(
                                    'path', lf.path
                          ),
                'students', (
                SELECT JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'id', students.id,
                        'full_name', students.full_name
                    )
                )
                FROM in_class_students ics
                JOIN students ON students.id = ics.student_id
                WHERE ics.class_id = c.id AND students.user_id = learner.id
              ) 
        ) 
    ) AS learners
    FROM lessons
    LEFT JOIN classes c ON c.id = lessons.class_id
    LEFT JOIN in_class_members icm ON icm.class_id = c.id
    LEFT JOIN users learner ON learner.id = icm.user_id
    LEFT JOIN files lf ON lf.id = learner.avatar_id
    WHERE c.id = ? AND lessons.id = ?
  `

    SMySQL.getConnection(async (connection) => {
      // connection?.execute<any[]>(sqlLessonDetail, [classId, lessonId], (error, resultLesson) => {
      //   if (error) {
      //     // SLog.log(LogType.Error, "getAttendance", "get attendance error", error);
      //     console.log(">>> get student Attendance: ", error);
      //     onError("Error get detail class!");
      //     return;
      //   }

      //   const lessonDetail = resultLesson[0].lesson;
      //   lessonDetail.is_online = lessonDetail.is_online === 1;
        
      //   connection.execute<any>(sqlStudentAttendance, [lessonId], (err, resultAttendances) => {
      //     if (error) {
      //       console.log(">>> Error fetching student attendance:", error);
      //       onError("Error read student attendance!")
      //       return;
      //     }

      //     const attendances:Attendance[] = []
      //     resultAttendances.forEach((resultAttendance) => {
      //       const attendance = resultAttendance.attendance;
      //       attendances.push(attendance);

      //     })

      //     // Trả kết quả với cấu trúc gồm chi tiết lớp học và danh sách học sinh
      //     onNext(lessonDetail, attendances);


      //   })
      // });
    
      try {
        const resultLesson = await new Promise<any>((resolve, reject) =>{
          connection?.execute<any>(sqlLessonDetail, [classId, lessonId], (error, result) => {
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
          confirm_attendance: Boolean(result.attendance.confirm_attendance),
          attendance_payment: {
            ...result.attendance.attendance_payment,
            paid: Boolean(result.attendance.attendance_payment?.paid),
            confirmed_by_tutor: Boolean(result.attendance.attendance_payment?.confirmed_by_tutor),
          }
        }));

        const resultLearners = await new Promise<any[]>((resolve, reject) => {
          connection?.execute<any[]>(sqlLearner, [classId, lessonId], (err, result) => {
            if (err) {
              reject(err);
            } else {
              resolve(result);
            }
          });
        });

        const learners = resultLearners[0].learners
        // console.log(">>> learner: ", JSON.stringify(resultLearners[0].learners, null, 2));

        


         // Trả kết quả với cấu trúc gồm chi tiết lớp học và danh sách học sinh
        onNext(lessonDetail, attendances, learners);


      } catch (error) {
        
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

      // Kiểm tra nếu parent_id là null, nếu có thì dùng user_id, còn không thì dùng parent_id làm user_id
     const userId = attendance.parent_id === null ? attendance.id : attendance.parent_id;
     const studentId = attendance.parent_id === null ? null : Number(attendance.id);

     return  [
       attendance.lesson_id,
       userId,
       studentId,
       attendance.attended,
       attendance.confirm_attendance,
       new Date().getTime() // attended_at
     ]
   });

   const numberOfRecords = learnerAttendance.length;  // Số lượng bản ghi cần chèn

  const allPlaceholders = new Array(numberOfRecords).fill(`(?, ?, ?, ?, ?, ?)`).join(', ');
  const allPaymentPlaceholders = new Array(numberOfRecords).fill(`(?, ?, ?, ?)`).join(', ');

    const attendanceSql = `INSERT INTO attendances 
                          (lesson_id, user_id, student_id, attended, confirm_attendance, attended_at)
                          VALUES ${allPlaceholders};`;

    const paymentSql = `INSERT INTO attendance_payments (attendance_id, paid, confirmed_by_tutor, payment_path)
                        VALUES ${allPaymentPlaceholders}`;
  

    console.log(">>> attendanceValues", attendanceValues.flat());
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

            // Get the last insert ID for attendance
            const attendanceIds = Array.from({ length: learnerAttendance.length }, (_, index) => result.insertId + index);
            console.log("Attendance ID after insert: ", attendanceIds);

            // Step 2: Insert into attendance_payments
            // Tạo mảng giá trị để chèn vào bảng attendance_payments
            const paymentValues = attendanceIds.map((attendanceId) => [
              attendanceId,
              false, // paid
              false, // confirmed_by_tutor
              null   // payment_path
          ]);
            connection.execute(
              paymentSql,
              paymentValues.flat(),
              (paymentError) => {
                if (paymentError) {
                  connection.rollback(() => {
                    onNext("Failed to insert into attendance_payments", false);
                  });
                  return;
                }

                 // Cam kết transaction nếu mọi thứ thành công
                connection.commit((commitErr) => {
                  if (commitErr) {
                    connection.rollback(() => {
                      onNext("Transaction commit failed", false);
                    });
                    return;
                  }

                  onNext("All attendance records and payments have been inserted successfully!", true);
                });
              }
            );

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
    attendanceIds: [], paid: boolean, paymentPath: string | null, type: string, deferred: boolean,
    onNext: (messages: string, result: boolean) => void
  ) {

    console.log("attendanceIds: ", attendanceIds);
    console.log("paid: ", paid);
    console.log("paymentPath: ", paymentPath);
    
    const placeholders = attendanceIds.map(() => '?').join(', ');
    const sql = `
      UPDATE attendance_payments 
      SET paid = ?, payment_path = ?, paid_at = ?, type = ?, deferred = ?
      WHERE attendance_id IN (${placeholders});
    `;

    const paidAt = new Date().getTime();
    const values = [paid, paymentPath, paidAt, type, deferred,  ...attendanceIds];
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
    lessonId:string, userId:string, confirmedByTutor: boolean,
    onNext: (messages: string, result: boolean) => void
  ) {
  
    const sql = `
      UPDATE attendance_payments SET confirmed_by_tutor = ?, confirmed_at = ?
      WHERE attendance_id IN (
        SELECT id
        FROM attendances
        WHERE lesson_id =? AND user_id =?
      )
    `;

    const confirmedAt = new Date().getTime();

    SMySQL.getConnection((connection) => {
        connection?.execute<any>(sql, [confirmedByTutor, confirmedAt ,lessonId, userId], (err, results) => {
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




  public static storeAttendance(
    attendance: Attendance,
    onNext: (id: number | undefined) => void
  ) {}

  public static updateAttendance(
    id: number,
    onNext: (result: boolean) => void
  ) {}
}
