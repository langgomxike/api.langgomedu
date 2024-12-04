import express from "express";
import SUserReport from "../services/SUserReport";
import SResponse, { ResponseStatus } from "../services/SResponse";
import SClassReport from "../services/SClassReport";
import SUser from "../services/SUser";

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

  // public static createUserReport(
  //   request: express.Request,
  //   response: express.Response
  // ) {
  //   // Lấy dữ liệu từ body của request
  //   const { reporter, reportee, class_id, content } =
  //     request?.body?.report || {};

  //   // Kiểm tra các tham số cần thiết
  //   if (!reporter || !reportee || !content) {
  //     return response
  //       .status(400)
  //       .json({ success: false, message: "Missing required fields." });
  //   }

  //   // Gọi phương thức CreatedReport để tạo báo cáo
  //   SUserReport.CreatedReport(
  //     reporter,
  //     reportee,
  //     class_id,
  //     content,
  //     (result) => {
  //       if (result) {
  //         // Nếu thành công, trả về phản hồi JSON
  //         response
  //           .status(201)
  //           .json({ success: true, message: "Report created successfully." });
  //       } else {
  //         // Nếu thất bại, trả về lỗi
  //         response
  //           .status(500)
  //           .json({ success: false, message: "Failed to create report." });
  //       }
  //     }
  //   );
  // }

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
    // In ra dữ liệu nhận được từ request để kiểm tra
    console.log("Request Body:", request.body);
    // console.log("Files:", request.files);
  
    // Lấy dữ liệu từ body của request (không cần truy cập qua report nếu không có trường này)
    const { reporter, reportee, class_id, content } = request.body;
  
    // Lấy đường dẫn file để upload từ request.files
    const files = (request as any).files;
    const filePaths: string[] = [];
  
    // Kiểm tra và lưu đường dẫn các file
    if (files && Array.isArray(files)) {
      files.forEach((file: any) => {
        const filePath = file ? `uploads/reports/${file.filename}` : null;
        if (filePath) {
          filePaths.push(filePath); // Thêm filePath vào mảng filePaths
          console.log("File path uploaded: ", filePath);
        }
      });
    }
  
    // Kiểm tra các tham số cần thiết
    if (!reporter || !reportee || !content) {
      return response
        .status(400)
        .json({ success: false, message: "Missing required fields." });
    }
  
    // Gọi phương thức CreatedReport để tạo báo cáo
    SUserReport.CreatedReport(
      reporter,
      reportee,
      class_id,
      content,
      filePaths, // Truyền filePaths vào tham số files
      (result) => {
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
      }
    );
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
    const { reportId, reason } = request.body;

    console.log("Payload received:", request.body);

    // Kiểm tra nếu `reportId` hoặc `reason` không tồn tại
    if (!reportId || !reason) {
      return response.status(400).json({
        success: false,
        message: "Report ID and reason are required.",
      });
    }

    // Gọi phương thức LockUserReport để xử lý
    SUserReport.LockReport(reportId, reason, (result) => {
      if (result) {
        response
          .status(200)
          .json({ success: true, message: "User report locked successfully." });
      } else {
        response
          .status(500)
          .json({ success: false, message: "Failed to lock user report." });
      }
    });
  }
  public static updateUserProfile(
  request: express.Request,
  response: express.Response
) {
  console.log("Request Body:", request.body);

  // Lấy dữ liệu từ body của request
  const {
    id,
    full_name,
    hometown,
    birthday,
    gender_id,
    province,
    district,
    ward,
    detail,
    majors,
  } = request.body;

  // Lấy file được tải lên từ request.file (chỉ 1 file)
  const file = (request as any).file;
  let avatarPath: string | null = null;

  if (file) {
    avatarPath = `uploads/users/${file.filename}`; // Lưu đường dẫn file vào avatarPath
    console.log("Uploaded file path:", avatarPath);
  }

  // Kiểm tra tham số bắt buộc
  if (!id) {
    return response
      .status(400)
      .json({ success: false, message: "Missing required user ID." });
  }

  // Gọi phương thức SUser.updateUserProfile để cập nhật thông tin người dùng
  SUser.updateUserProfile(
    id,
    (result) => {
      if (result) {
        // Nếu thành công, trả về phản hồi JSON
        response
          .status(200)
          .json({ success: true, message: "User profile updated successfully." });
      } else {
        // Nếu thất bại, trả về lỗi
        response
          .status(500)
          .json({ success: false, message: "Failed to update user profile." });
      }
    },
    full_name, // Tên đầy đủ
    avatarPath, // Đường dẫn file avatar
    hometown, // Quê quán
    birthday ? parseInt(birthday) : undefined, // Ngày sinh (số)
    gender_id ? parseInt(gender_id) : undefined, // Giới tính (số)
    province, // Tỉnh
    district, // Huyện
    ward, // Xã
    detail, // Địa chỉ chi tiết
    majors ? JSON.parse(majors) : undefined // Mảng majors (parse từ JSON nếu là chuỗi)
  );
}
}
