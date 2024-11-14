import express from "express";
import SUserReport from "../services/SUserReport";
import SResponse, { ResponseStatus } from "../services/SResponse";
import SClassReport from "../services/SClassReport";

export default class ReportController {
  public static getAllClassReports(
    request: express.Request,
    response: express.Response
  ) {
    SClassReport.getAllClassReport((classReport) => {
      SResponse.getResponse(
        ResponseStatus.OK,
        classReport,
        "get all classes reports",
        response
      );
    });
  }
  public static getClassReport(
    request: express.Request,
    response: express.Response
  ) {
    const reportId = request.params.id; // Lấy reportId từ tham số đường dẫn
    SClassReport.getClassReportById(reportId, (classReport) => {
      if (classReport) {
        SResponse.getResponse(
          ResponseStatus.OK,
          classReport,
          "get class report by id success",
          response
        );
      } else {
        SResponse.getResponse(
          ResponseStatus.Not_Found,
          null,
          "get class report by id unsuccessful",
          response
        );
      }
    });
  }

  public static createClassReport(
    request: express.Request,
    response: express.Response
  ) {}

  public static approveClassReport(
    request: express.Request,
    response: express.Response
  ) {}

  public static getAllUserReports(
    request: express.Request,
    response: express.Response
  ) {
    SUserReport.getAllUserReports((userReport) => {
      SResponse.getResponse(
        ResponseStatus.OK,
        userReport,
        "get all usersReport",
        response
      );
    });
  }

  public static getUserReport(
    request: express.Request,
    response: express.Response
  ) {
    const id = request.params.id;
    SUserReport.geUserReportsById(id, (userReport) => {
      if (userReport.length > 0) {
        SResponse.getResponse(
          ResponseStatus.OK,
          userReport,
          "get usersReport by id susscess",
          response
        );
      } else {
        SResponse.getResponse(
          ResponseStatus.Not_Found,
          userReport,
          "get usersReport by id unsusscess",
          response
        );
      }
    });
  }

  public static createUserReport(
    request: express.Request,
    response: express.Response
  ) {}

  public static approveUserReport(
    request: express.Request,
    response: express.Response
  ) {}
  // Khóa báo cáo người dùng
  public static LockUserReport(
    request: express.Request,
    response: express.Response
  ) {
    const reportId = request?.body?.reportId; // sửa lại để lấy trực tiếp `reportId`
    console.log("request: " + JSON.stringify(request.body));
    console.log("reportId: " + reportId);

    // Kiểm tra nếu `reportId` không tồn tại
    if (!reportId) {
      return response
        .status(400)
        .json({ success: false, message: "Report ID is required." });
    }

    // Gọi phương thức LockUserReport của SUser
    SUserReport.LockUserReport(reportId, (result) => {
      if (result) {
        // Nếu thành công, gửi phản hồi JSON
        response
          .status(200)
          .json({ success: true, message: "User report locked successfully." });
      } else {
        // Nếu thất bại, gửi phản hồi lỗi
        response
          .status(500)
          .json({ success: false, message: "Failed to lock user report." });
      }
    });
  }
  public static LockClassReport(
    request: express.Request,
    response: express.Response
  ) {
    const reportId = request.body.reportId;  // Thay vì `request?.body?.report?.id`
    console.log("request: " + JSON.stringify(request.body));
    console.log("reportId: " + reportId);
  
    // Kiểm tra nếu `reportId` không tồn tại
    if (!reportId) {
      return response
        .status(400)
        .json({ success: false, message: "Report ID is required." });
    }
  
    // Gọi phương thức LockClassReport của SClassReport
    SClassReport.LockClassReport(reportId, (result) => {
      if (result) {
        // Nếu thành công, gửi phản hồi JSON
        response
          .status(200)
          .json({ success: true, message: "Class report locked successfully." });
      } else {
        // Nếu thất bại, gửi phản hồi lỗi
        response
          .status(500)
          .json({ success: false, message: "Failed to lock class report." });
      }
    });
  }
}
