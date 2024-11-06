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
    const { lesson_id, user_id, student_id, attended, confirm_attendance } =
      request.body;
    const attended_at = new Date().getTime();

    SAttendance.requestAttendance(
      lesson_id,
      user_id,
      student_id,
      attended,
      confirm_attendance,
      attended_at,
      (message, result) => {
        SResponse.getResponse(
          ResponseStatus.OK,
          { message, result },
          "request attendances for class in lesson",
          response
        );
      }
    );
  }

  public static acceptAttendance(
    request: express.Request,
    response: express.Response
  ) {
    // Chấp nhận điểm danh (Phụ huynh, học sinh)
    const { lesson_id, user_id, confirm_attendance } = request.body;
    const confirmed_at = new Date().getTime();
    SAttendance.acceptAttendance(
      lesson_id,
      user_id,
      confirm_attendance,
      confirmed_at,
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
  public static async updatePaymentOfLeaner(request: express.Request, response: express.Response) {
    const { lesson_id, user_id, paid } = request.body;

    console.log("data:", request.body);

    // Lấy đường dẫn file đã upload
    const file = (request as any).file;
    const filePath = `uploads/payments/${file.filename}`;
    
    // Chuyển đổi `paid` từ chuỗi sang boolean
    const paidBoolean = paid === 'true';

    SAttendance.updatePaymentOfLeaner(
      lesson_id, user_id, paidBoolean, filePath,
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

  public static confirmPaymentByTutor(request: express.Request, response: express.Response) {
    const { lesson_id, user_id, confirmed_by_tutor } = request.body;
    const confirmedByTutor = confirmed_by_tutor === 'true';

    SAttendance.confirmPaymentByTutor(
        lesson_id, user_id, confirmedByTutor,
        (message, result) => {
          SResponse.getResponse(
            ResponseStatus.OK,
            { message, result },
            "confirm payment by tutor",
            response
          );
        }
      );

  }

  public static getAttendanceByLeanerClassLesson(
    request: express.Request,
    response: express.Response
  ) {
    const classId = request.params.class_id;
    const lessonId = request.params.lesson_id;
    const userId = request.params.user_id;

    console.log(">>> getAttendanceByUserClassLesson", request.params);

    SAttendance.getAttendanceByLeanerClassLesson(
      classId,
      lessonId,
      userId,
      (classDetail, attendStudents) => {
        // Xử lý thành công
        SResponse.getResponse(
          ResponseStatus.OK,
          { classDetail, attendStudents },
          `Get attendance for user id: ${userId} in class id: ${classId} of lesson: ${lessonId}`,
          response
        );
      },
      (message) => {
        // Xử lý lỗi
        SResponse.getResponse(ResponseStatus.Error, null, message, response);
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
      (classDetail, attendStudents) => {
        // Xử lý thành công
        SResponse.getResponse(
          ResponseStatus.OK,
          { classDetail, attendStudents },
          `Get attendance for tutor id: ${userId} in class id: ${classId} of lesson: ${lessonId}`,
          response
        );
      },
      (message) => {
        // Xử lý lỗi
        SResponse.getResponse(ResponseStatus.Error, null, message, response);
      }
    );
  }
}
