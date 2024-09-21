import { Response } from "express";

export enum ReponseStatus {
  "OK",
  "Forbidden",
  "Not_Found",
  "Internal_Server_Error",
  "Unauthorized",
}
const statuses = [200, 403, 404, 500, 401];
type ResponseType = {
  status: string;
  status_code: number;
  message: string;
  data: object;
};
export default class SResponse {
  public static getResponse(
    status: ReponseStatus = ReponseStatus.OK,
    data: unknown,
    message: string = "",
    res: Response
  ) {
    const re: ResponseType = {
      status: ReponseStatus[status].replace("_", " "),
      status_code: statuses[status],
      message: message,
      data: data ? (data as object) : {},
    };
    res.status(statuses[status]).json(re);
  }
}
