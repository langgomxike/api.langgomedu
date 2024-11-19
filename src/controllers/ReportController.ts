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

 public static createUserReport(
  request: express.Request,
  response: express.Response
) {
  // Lấy dữ liệu từ body của request
  const { reporter, reportee, class_id, content } = request?.body?.report || {};

  // Kiểm tra các tham số cần thiết
  if (!reporter || !reportee || !content) {
    return response
      .status(400)
      .json({ success: false, message: "Missing required fields." });
  }

  // Gọi phương thức CreatedReport để tạo báo cáo
  SUserReport.CreatedReport(reporter, reportee, class_id, content, (result) => {
    if (result) {
      // Nếu thành công, trả về phản hồi JSON
      response
        .status(201)
        .json({ success: true, message: "Report created successfully." });
    } else {
      // Nếu thất bại, trả về lỗi
      response
        .status(500)
        .json({ success: false, message: "Failed to create report." });
    }
  });
}

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

  public static createReport(
    request: express.Request,
    response: express.Response
  ) {
    // Lấy dữ liệu từ body của request
    const { reporter, reportee, class_id, content } = request?.body?.report || {};
  
    // Kiểm tra các tham số cần thiết
    if (!reporter || !reportee || !content) {
      return response
        .status(400)
        .json({ success: false, message: "Missing required fields." });
    }
  
    // Gọi phương thức CreatedReport để tạo báo cáo
    SUserReport.CreatedReport(reporter, reportee, class_id, content, (result) => {
      if (result) {
        // Nếu thành công, trả về phản hồi JSON
        response
          .status(201)
          .json({ success: true, message: "Report created successfully." });
      } else {
        // Nếu thất bại, trả về lỗi
        response
          .status(500)
          .json({ success: false, message: "Failed to create report." });
      }
    });
  }
  

  public static approveUserReport(
    request: express.Request,
    response: express.Response
  ) {}

  // Khóa báo cáo
  public static LockReport(
    request: express.Request,
    response: express.Response
  ) {
    const report = request?.body?.report;
    const id = report?.id;
    const reason = report?.reason;
    // sửa lại để lấy trực tiếp `reportId`
    console.log("request: " + JSON.stringify(request.body));
    console.log("reportId: " + id);

    // Kiểm tra nếu `reportId` không tồn tại
    if (!id) {
      return response
        .status(400)
        .json({ success: false, message: "Report ID is required." });
    }

    // Gọi phương thức LockUserReport của SUser
    SUserReport.LockReport(id, reason, (result) => {
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
}
