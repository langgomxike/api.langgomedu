import express from "express";
import SUserReport from "../services/SUserReport";
import SResponse, { ResponseStatus } from "../services/SResponse";
import SClassReport from "../services/SClassReport";
import SLog, { LogType } from "../services/SLog";
import User from "../models/User";
import SMessage from "../services/SMessage";
import SUser from "../services/SUser";
import SFirebase, { FirebaseNode } from "../services/SFirebase";

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

  public static approveClassReport(
    request: express.Request,
    response: express.Response
  ) {
  }

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

  // public static createReport(
  //   request: express.Request,
  //   response: express.Response
  // ) {
  //   // In ra dữ liệu nhận được từ request để kiểm tra
  //   console.log("Request Body:", request.body);
  //   // console.log("Files:", request.files);

  //   // Lấy dữ liệu từ body của request (không cần truy cập qua report nếu không có trường này)
  //   const {reporter, reportee, class_id, content} = request.body;

  //   // Lấy đường dẫn file để upload từ request.files
  //   const files = (request as any).files;
  //   const filePaths: string[] = [];

  //   // Kiểm tra và lưu đường dẫn các file
  //   if (files && Array.isArray(files)) {
  //     files.forEach((file: any) => {
  //       const filePath = file ? `uploads/reports/${file.filename}` : null;
  //       if (filePath) {
  //         filePaths.push(filePath); // Thêm filePath vào mảng filePaths
  //         console.log("File path uploaded: ", filePath);
  //       }
  //     });
  //   }

  //   // Kiểm tra các tham số cần thiết
  //   if (!reporter || !reportee || !content) {
  //     return response
  //       .status(400)
  //       .json({success: false, message: "Missing required fields."});
  //   }

  //   // Gọi phương thức CreatedReport để tạo báo cáo
  //   SUserReport.CreatedReport(
  //     reporter,
  //     reportee,
  //     class_id,
  //     content,
  //     filePaths, // Truyền filePaths vào tham số files
  //     (result) => {
  //       if (result) {
  //         // Nếu thành công, trả về phản hồi JSON
  //         response
  //           .status(201)
  //           .json({success: true, message: "Report created successfully."});
  //       } else {
  //         // Nếu thất bại, trả về lỗi
  //         response
  //           .status(500)
  //           .json({success: false, message: "Failed to create report."});
  //       }
  //     }
  //   );
  // }
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
        const filePath = file ? `/uploads/reports/${file.filename}` : null;
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

    // Nếu không có class_id, gán nó là null
    const classId = class_id || "";

    // Gọi phương thức CreatedReport để tạo báo cáo
    SUserReport.CreatedReport(
      reporter,
      reportee,
      classId,
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
  ) {
  }

  // Khóa báo cáo
  public static performReport(
    request: express.Request,
    response: express.Response
  ) {
    const id: number = request.body?.id ?? -1;
    const reason: string = request.body?.reason ?? "";
    const level: number = request.body?.level ?? -1;
    const point: number = request.body?.point ?? 0;
    const reporterId: string = request.body?.reporter_id;
    const reporteeId: string = request.body?.reportee_id;

    // Kiểm tra nếu `reportId` hoặc `reason` không tồn tại
    if (!id || !level || !point) {
      SLog.log(LogType.Error, "performReport", "Invalid parameters");
      SResponse.getResponse(ResponseStatus.Internal_Server_Error, null, "Invalid parameters", response);
      return;
    }

    // Gọi phương thức LockUserReport để xử lý
    SUserReport.performReport(id, reason, level, (result) => {
      if (result) {
        const onNext = () => {
          SLog.log(LogType.Info, "performReport", "Performed report");
          SResponse.getResponse(ResponseStatus.OK, null, "Performed report", response);
        }

        // Cập nhật điểm cho user
        if (reason) {
          const vnNoti = `Một báo cáo của bạn với lý do [${reason}] đã không được duyệt. Tuy nhiên, vẫn cảm ơn bạn vì những đóng góp của bạn cho LanggomEdu. Trân trọng.`;
          const enNoti = `A report of yours with the reason: [${reason}] was not approved. However, thank you for your contributions to LanggomEdu. Best regards.`;
          const jaNoti = `あなたの「${reason}」という理由での報告は承認されませんでした。しかし、LanggomEduへの貢献に感謝します。よろしくお願いいたします。`;

          SMessage.createNotification(vnNoti, enNoti, jaNoti, reporterId, onNext);
        } else {
          const vnNoti = `Một báo cáo về bạn đã được duyệt. Do đó, bạn đã bị trừ một số điểm uy tín nhất định. Xin cảm ơn.`;
          const enNoti = `A report about you has been approved. As a result, a certain number of reputation points have been deducted. Thank you.`;
          const jaNoti = `あなたに関する報告が承認されました。そのため、一定の信頼ポイントが差し引かれました。ありがとうございます。`;

          SMessage.createNotification(vnNoti, enNoti, jaNoti, reporteeId, () => {
            const vnNoti = `Một báo cáo của bạn đã được duyệt. Cảm ơn bạn vì những đóng góp của bạn cho LanggomEdu. Trân trọng.`;
            const enNoti = `Your report has been approved. Thank you for your contributions to LanggomEdu. Best regards.`;
            const jaNoti = `あなたの報告が承認されました。LanggomEduへの貢献に感謝します。よろしくお願いいたします。`;

            SMessage.createNotification(vnNoti, enNoti, jaNoti, reporterId, () => {
              SUser.minusUserPoint(reporteeId, point, () => {
                SFirebase.getData(FirebaseNode.AppInfos, [], (infos) => {
                  const reportPoint = +(infos?.rater_report_point ?? 0);

                  SUser.plusPointForUser(reporterId, reportPoint, onNext);
                });
              });
            });
          });
        }
      } else {
        SLog.log(LogType.Error, "performReport", "Cannot perform report");
        SResponse.getResponse(ResponseStatus.Internal_Server_Error, null, "Cannot perform report", response);
      }
    });
  }
}
