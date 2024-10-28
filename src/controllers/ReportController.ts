import express from "express";
import SUserReport from "../services/SUserReport";
import SResponse, { ResponseStatus } from "../services/SResponse";

export default class ReportController {
  public static getAllClassReports(
    request: express.Request,
    response: express.Response
  ) {}

  public static getClassReport(
    request: express.Request,
    response: express.Response
  ) {}

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
  ) {}

  public static createUserReport(
    request: express.Request,
    response: express.Response
  ) {}

  public static approveUserReport(
    request: express.Request,
    response: express.Response
  ) {}
}
