import express, {Request} from "express";
import SAttendance from "../services/SAttendance";
import SResponse, {ResponseStatus} from "../services/SResponse";
import SLog, {LogType} from "../services/SLog";

export default class AttendanceController {
  public static getAttendanceHistories(
    request: express.Request,
    response: express.Response
  ) {
    const userId: string = request.body.user_id ?? "-1";

    SAttendance.getAttendanceHistoriesOfUser(userId, (attendances) => {
      SResponse.getResponse(
        ResponseStatus.OK,
        attendances,
        "get attendances",
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
        {message, result},
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
    const {lesson_id, user_id, confirm_attendance, attended_at} =
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
          {message, result},
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
    let {lesson_id, user_id, paid, type, deferred, deferred_lessons} = request.body;

    // console.log("data:", request.body);

    // Lấy đường dẫn file đã upload
    const file = (request as any).file;
    const filePath = file ? `/uploads/payments/${file.filename}` : null;

    // Chuyển đổi `paid` từ chuỗi sang boolean
    paid = paid === "true";
    deferred = deferred === "true";
    deferred_lessons = deferred_lessons ? JSON.parse(deferred_lessons) : [];

    SAttendance.updatePaymentOfLearner(
      lesson_id, user_id, paid, filePath, type, deferred,deferred_lessons,
      (message, result) => {
        SResponse.getResponse(ResponseStatus.OK, {message, result}, "update payment of leaner", response);
      }
    );
  }

  public static confirmPaymentByTutor(
    request: express.Request,
    response: express.Response
  ) {
    const {lesson_id, user_id, action, value} = request.body;

    console.log("Request body:", request.body);

    // Cập nhật thanh toán xác nhận từ tutor
    SAttendance.confirmPaymentByTutor(
      lesson_id,
      user_id,
      action,
      value,
      (message, result) => {
        SResponse.getResponse(
          ResponseStatus.OK,
          {message, result},
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

    SAttendance.getAttendanceByLeanerClassLesson(
      classId,
      lessonId,
      userId,
      (lesson, learner) => {
        // Xử lý thành công
        SResponse.getResponse(
          ResponseStatus.OK,
          {lesson, learner},
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

  public static getAttendanceByLearnerLesson(
    request: express.Request,
    response: express.Response
  ) {
    const lessonId = request.params.lesson_id;
    const userId = request.params.user_id;
    const classId = Number(request.query.class_id);

    SAttendance.getAttendanceByLeanerLesson(
      lessonId,
      userId,
      classId,
      (attendance, deferredAttendances) => {
        // Xử lý thành công
        SResponse.getResponse(
          ResponseStatus.OK,
          {attendance, deferredAttendances},
          `Get attendance for user id: ${userId} in lesson: ${lessonId}`,
          response
        );
      },
    );
  }

  // Lấy danh sách học sinh trong lớp của buổi học đó và thông tin điểm danh của họ
  public static getAttendanceByTutorClassLesson(
    request: express.Request,
    response: express.Response
  ) {
    const classId = request.params.class_id;
    const lessonId = request.params.lesson_id;
    SAttendance.getAttendanceByTutorClassLesson(
      classId,
      lessonId,
      (learners) => {
        // Xử lý thành công
        SResponse.getResponse(
          ResponseStatus.OK,
          {learners},
          `Get attendance for tutor class id: ${classId} of lesson: ${lessonId}`,
          response
        );
      },
    );
  }
}
