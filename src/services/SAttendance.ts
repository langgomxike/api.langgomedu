import Class from "../models/Class";
import Lesson from "../models/Lesson";
import Student from "../models/Student";
import User from "../models/User";
import Attendance from "./../models/Attendance";
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
    classId, lessonId, userId,
    onNext: (classDetail: Class, attendStudents: Student[]) => void,
    onError: (message) => void
  ) {

    const sqlClassDetails =  `
                    SELECT
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
                            'path', tutor_avatar.path
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
                            'path', tutor_avatar.path
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
                    'class_creaton_fee', c.class_creation_fee,
                    'type', JSON_ARRAYAGG(
                       		CASE WHEN lessons.is_online = 1 THEN 'online'
                        		ELSE 'offline'
                        	END
                    ),
                    'lesson', JSON_OBJECT(
                        "id", lessons.id,
                        "day", lessons.day,
                        "duration", lessons.duration,
                        "is_online", lessons.is_online,
                        "started_at", lessons.started_at,
                        "note", lessons.note
                    ),
                    'max_learners', c.max_learners,
                    'started_at', c.started_at,
                    'ended_at', c.ended_at,
                    'created_at', c.created_at,
                    'updated_at', c.updated_at,
                    'address_1', c.address_1,
                    'address_2', c.address_2,
                    'address_3', c.address_3,
                    'address_4', c.address_4
               ) AS class
                FROM classes c
                -- Các thông tin user
                LEFT JOIN users tutor ON tutor.id = c.tutor_id
                LEFT JOIN users author ON author.id = c.author_id
                 -- Lấy avatart của user
                LEFT JOIN files tutor_avatar ON tutor_avatar.id = tutor.avatar_id
                LEFT JOIN files author_avatar ON author_avatar.id = author.avatar_id
                -- Lấy tên môn học và hình ảnh môn học
                LEFT JOIN majors ON majors.id = c.major_id
                LEFT JOIN files major_icon ON major_icon.id = majors.icon_id
                -- Cấp cấp độ của lớp học
                LEFT JOIN class_levels cl ON cl.id = c.class_level_id
                LEFT JOIN lessons ON lessons.class_id = c.id
                WHERE c.id = ? AND lessons.id = ?;
    `;

    const sqlStudentAttendance = `
    SELECT 
 JSON_ARRAYAGG(
      JSON_OBJECT(
        'id', students.id,
        'name', students.full_name,
        'attended', a.attended
      )
    ) AS students
FROM attendances a
LEFT JOIN students ON students.id = a.student_id
WHERE a.lesson_id = ? AND a.user_id = ?;
  `;

    SMySQL.getConnection((connection) => {
      connection?.execute<any[]>(sqlClassDetails, [classId, lessonId], (error, resultClass) => {
        if (error) {
          // SLog.log(LogType.Error, "getAttendance", "get attendance error", error);
          console.log(">>> get student Attendance: ", error);
          onError("Error get detail class!");
          return;
        }

        const classDetails = resultClass[0].class;
        
        connection.execute<any>(sqlStudentAttendance, [lessonId, userId], (err, resultStudents) => {
          if (error) {
            console.log(">>> Error fetching student attendance:", error);
            onError("Error read student attendance!")
            return;
          }
          const students = resultStudents[0]?.students || [];

          // Trả kết quả với cấu trúc gồm chi tiết lớp học và danh sách học sinh
          onNext(classDetails, students);


        })
      });
    });
  }

  // Hàm lấy chi tiết lớp học và danh sách học sinh thuộc user (tutor)
  public static getAttendanceByTutorClassLesson(
    classId, lessonId, userId,
    onNext: (classDetail: Class, attendStudents: Attendance[]) => void,
    onError: (message) => void
  ) {

    const sqlClassDetails =  `
                    SELECT
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
                            'path', tutor_avatar.path
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
                            'path', tutor_avatar.path
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
                    'class_creaton_fee', c.class_creation_fee,
                    'type', JSON_ARRAYAGG(
                       		CASE WHEN lessons.is_online = 1 THEN 'online'
                        		ELSE 'offline'
                        	END
                    ),
                    'lesson', JSON_OBJECT(
                        "id", lessons.id,
                        "day", lessons.day,
                        "duration", lessons.duration,
                        "is_online", lessons.is_online,
                        "started_at", lessons.started_at,
                        "note", lessons.note
                    ),
                    'max_learners', c.max_learners,
                    'started_at', c.started_at,
                    'ended_at', c.ended_at,
                    'created_at', c.created_at,
                    'updated_at', c.updated_at,
                    'address_1', c.address_1,
                    'address_2', c.address_2,
                    'address_3', c.address_3,
                    'address_4', c.address_4
               ) AS class
                FROM classes c
                -- Các thông tin user
                LEFT JOIN users tutor ON tutor.id = c.tutor_id
                LEFT JOIN users author ON author.id = c.author_id
                 -- Lấy avatart của user
                LEFT JOIN files tutor_avatar ON tutor_avatar.id = tutor.avatar_id
                LEFT JOIN files author_avatar ON author_avatar.id = author.avatar_id
                -- Lấy tên môn học và hình ảnh môn học
                LEFT JOIN majors ON majors.id = c.major_id
                LEFT JOIN files major_icon ON major_icon.id = majors.icon_id
                -- Cấp cấp độ của lớp học
                LEFT JOIN class_levels cl ON cl.id = c.class_level_id
                LEFT JOIN lessons ON lessons.class_id = c.id
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
  `

    SMySQL.getConnection((connection) => {
      connection?.execute<any[]>(sqlClassDetails, [classId, lessonId], (error, resultClass) => {
        if (error) {
          // SLog.log(LogType.Error, "getAttendance", "get attendance error", error);
          console.log(">>> get student Attendance: ", error);
          onError("Error get detail class!");
          return;
        }

        const classDetails = resultClass[0].class;
        
        connection.execute<any>(sqlStudentAttendance, [lessonId], (err, resultAttendances) => {
          if (error) {
            console.log(">>> Error fetching student attendance:", error);
            onError("Error read student attendance!")
            return;
          }

          const attendances:Attendance[] = []
          resultAttendances.forEach((resultAttendance) => {
            const attendance = resultAttendance.attendance;
            attendances.push(attendance);

          })

          // Trả kết quả với cấu trúc gồm chi tiết lớp học và danh sách học sinh
          onNext(classDetails, attendances);


        })
      });
    });
  }

  // Hàm gửi yêu cầu điểm danh từ tutor đến leaner
  public static requestAttendance(
    lessonId: number,
    userId: string,
    studnetId: number,
    attended: boolean,
    confirmAttendance: boolean,
    attendedAt: number,
    onNext: (messages: string, result: boolean) => void
  ) {

    const attendanceSql = `INSERT INTO attendances (lesson_id, user_id, student_id, attended, confirm_attendance, attended_at)
                           VALUES (?, ?, ?, ?, ?, ?)`;
    const paymentSql = `INSERT INTO attendance_payments (attendance_id, paid, confirmed_by_tutor, payment_path)
                        VALUES (?, ?, ?, ?)`;

    SMySQL.getConnection((connection) => {
      connection?.beginTransaction((err) => {
        if (err) {
          onNext("Transaction start failed", false);
          return;
        }

        // Step 1: Insert into attendances
        connection.execute<any>(
          attendanceSql,
          [
            lessonId,
            userId,
            studnetId,
            attended,
            confirmAttendance,
            attendedAt,
          ],
          (error, result) => {
            if (error) {
              connection.rollback(() => {
                onNext("Can't request attendance", false);
                console.log(">>> can't insert into attendances.");
              });
              return;
            }

            // Get the last insert ID for attendance
            const attendanceId = result.insertId;
            console.log("Attendance ID after insert: ", attendanceId);

            // Step 2: Insert into attendance_payments
            connection.execute(
              paymentSql,
              [attendanceId, false, false, null],
              (paymentError) => {
                if (paymentError) {
                  connection.rollback(() => {
                    onNext(`Can't insert into attendance_payments: ${paymentError}`, false);
                    console.log(">>> can't insert into attendance_payments.", paymentError);
                  });
                  return;
                }

                // Commit transaction if both inserts are successful
                connection.commit((commitErr) => {
                  if (commitErr) {
                    connection.rollback(() => {
                      onNext("Transaction commit failed", false);
                    });
                    return;
                  }

                  onNext(
                    "Request attendance and payment record created successfully!",
                    true
                  );
                });
              }
            );

          }
        );
      });
    });
  }

  // Hàm cho phép leaner chấp nhận điểm danh của tutor
  public static acceptAttendance(
    lessonId: number,
    userId: string,
    confirmAttendance: boolean,
    confirmedAt: number,
    onNext: (messages: string, result: boolean) => void
  ) {

    const sql = `
      UPDATE attendances
      SET confirm_attendance = ?, confirmed_at = ?
      WHERE lesson_id = ? AND user_id = ?
    `;

    // Thực thi truy vấn
    SMySQL.getConnection((connection) => {
      connection?.execute(
        sql,
        [confirmAttendance, confirmedAt, lessonId, userId],
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

  // Hàm cập nhật thanh toán cho leaner
  public static updatePaymentOfLeaner(
    lessonId:string, userId:string, paid: boolean, paymentPath: string,
    onNext: (messages: string, result: boolean) => void
  ) {

    console.log("lessonId: ", lessonId);
    console.log("userId: ", userId);
    console.log("paid: ", paid);
    console.log("paymentPath: ", paymentPath);
    

    const sql = `
      UPDATE attendance_payments SET paid =?, payment_path =?, paid_at = ?
      WHERE attendance_id IN (
        SELECT id
        FROM attendances
        WHERE lesson_id =? AND user_id =?
      )
    `;

    const paidAt = new Date().getTime();

    SMySQL.getConnection((connection) => {
        connection?.execute<any>(sql, [paid, paymentPath, paidAt ,lessonId, userId], (err, results) => {
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

   // Hàm cập nhật thanh toán cho leaner
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
