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
      }
      else {
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
}
