import express, { Request } from "express";
import SAttendance from "../services/SAttendance";
import SResponse, { ResponseStatus } from "../services/SResponse";
export default class AttendanceController {
  public static getAttendanceHistories(
    request: express.Request,
    response: express.Response
  ) {
    SAttendance.getAttendanceHistoriesInClass(1, (attendances) => {
      SResponse.getResponse(
        ResponseStatus.OK,
        attendances,
        "get attendances with the class id " + 1,
        response
      );
    });
  }

  public static requestAttendance(
    request: express.Request,
    response: express.Response
  ) {
    // console.log(">>> request body attendance: ", request.body);

    const learnerAttendance = request.body.learners;

    SAttendance.requestAttendance(learnerAttendance, (message, result) => {
      SResponse.getResponse(
        ResponseStatus.OK,
        { message, result },
        "request attendances for class in lesson",
        response
      );
    });
  }

  public static acceptAttendance(
    request: express.Request,
    response: express.Response
  ) {
    // Chấp nhận điểm danh (Phụ huynh, học sinh)
    const { lesson_id, user_id, confirm_attendance, attended_at } =
      request.body;
    console.log(">>> acceptAttendance", request.body);
    SAttendance.acceptAttendance(
      lesson_id,
      user_id,
      confirm_attendance,
      attended_at,
      (message, result) => {
        SResponse.getResponse(
          ResponseStatus.OK,
          { message, result },
          "accept attendances for class in lesson",
          response
        );
      }
    );
  }

  // Hàm cập nhật thanh toán cho leaner
  public static async updatePaymentOfLearner(
    request: express.Request,
    response: express.Response
  ) {
    let { lesson_id, user_ids, paid, type, deferred } = request.body;

    console.log("data:", request.body);

    // Lấy đường dẫn file đã upload
    const file = (request as any).file;
    const filePath = file ? `/uploads/payments/${file.filename}` : null;

    // Chuyển đổi `paid` từ chuỗi sang boolean
    paid = paid === "true";
    deferred = deferred === "true";

     // Chuyển đổi `user_ids` từ chuỗi sang mảng nếu là chuỗi
  const userIds = typeof user_ids === 'string' ? JSON.parse(user_ids) : user_ids;

    SAttendance.updatePaymentOfLearner(
      lesson_id, userIds, paid, filePath,  type, deferred,
      (message, result) => {
        SResponse.getResponse(ResponseStatus.OK, { message, result }, "update payment of leaner", response);
      }
    );
  }

  public static confirmPaymentByTutor(
    request: express.Request,
    response: express.Response
  ) {
    const { lesson_id, user_ids, confirm_paid } = request.body;
  
    console.log("Request body:", request.body);
  
    // Cập nhật thanh toán xác nhận từ tutor
    SAttendance.confirmPaymentByTutor(
      lesson_id,
      user_ids,
      confirm_paid,
      (message, result) => {
        SResponse.getResponse(
          ResponseStatus.OK,
          { message, result },
          "Confirm payment by tutor",
          response
        );
      }
    );
  }

  public static getAttendanceByLearnerClassLesson(
    request: express.Request,
    response: express.Response
  ) {
    const classId = request.params.class_id;
    const lessonId = request.params.lesson_id;
    const userId = request.params.user_id;
    const attendedAt: number = Number(request.query.attended_at);

    console.log(">>> getAttendanceByUserClassLesson", request.params);

    SAttendance.getAttendanceByLeanerClassLesson(
      classId,
      lessonId,
      userId,
      attendedAt,
      (lesson, attendStudents) => {
        // Xử lý thành công
        SResponse.getResponse(
          ResponseStatus.OK,
          { lesson, attendStudents },
          `Get attendance for user id: ${userId} in class id: ${classId} of lesson: ${lessonId}`,
          response
        );
      },
      (message) => {
        // Xử lý lỗi
        SResponse.getResponse(ResponseStatus.Internal_Server_Error, null, message, response);
      }
    );
  }

  public static getAttendanceByTutorClassLesson(
    request: express.Request,
    response: express.Response
  ) {
    const classId = request.params.class_id;
    const lessonId = request.params.lesson_id;
    const userId = request.params.user_id;

    console.log(">>> getAttendanceByTutorClassLesson", request.params);

    SAttendance.getAttendanceByTutorClassLesson(
      classId,
      lessonId,
      userId,
      (lessonDetail, attendStudents, learners) => {
        // Xử lý thành công
        SResponse.getResponse(
          ResponseStatus.OK,
          { lessonDetail, attendStudents, learners },
          `Get attendance for tutor id: ${userId} in class id: ${classId} of lesson: ${lessonId}`,
          response
        );
      },
      (message) => {
        // Xử lý lỗi
        SResponse.getResponse(ResponseStatus.Internal_Server_Error, null, message, response);
      }
    );
  }
}
