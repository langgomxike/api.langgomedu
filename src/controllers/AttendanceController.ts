import express, { Request } from "express";
import SAttendance from "../services/SAttendance";
import Attendance from "../models/Attendance";
import SResponse, { ResponseStatus } from "../services/SResponse";
import Class from "../models/Class";
import Student from "../models/Student";
import { uploadPayment } from "../configs/MulterConfig";
import e from "express";

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
    let { attendance_ids, paid, type, deferred } = request.body;

    console.log("data:", request.body);

    // Lấy đường dẫn file đã upload
    const file = (request as any).file;
    const filePath = file ? `/uploads/payments/${file.filename}` : null;

    // Chuyển đổi `paid` từ chuỗi sang boolean
    paid = paid === "true";
    deferred = deferred === "true";

    const attendanceIds = typeof attendance_ids === 'string' ? JSON.parse(attendance_ids) : attendance_ids;

    SAttendance.updatePaymentOfLearner(
      attendanceIds,
      paid,
      filePath,
      type,
      deferred,
      (message, result) => {
        SResponse.getResponse(
          ResponseStatus.OK,
          { message, result },
          "update payment of leaner",
          response
        );
      }
    );
  }

  public static confirmPaymentByTutor(
    request: express.Request,
    response: express.Response
  ) {
    const { attendance_ids, confirmed_by_tutor } = request.body;

    console.log(request.body);


    SAttendance.confirmPaymentByTutor(
      attendance_ids, confirmed_by_tutor,
      (message, result) => {
        SResponse.getResponse(ResponseStatus.OK, { message, result }, "confirm payment by tutor", response);
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
