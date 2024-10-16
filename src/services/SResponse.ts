import { Response } from "express";

export enum ResponseStatus {
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
    status: ResponseStatus = ResponseStatus.OK,
    data: unknown,
    message: string = "",
    res: Response
  ) {
    const re: ResponseType = {
      status: ResponseStatus[status].replace("_", " "),
      status_code: statuses[status],
      message: message,
      data: data ? (data as object) : {},
    };
    res.status(statuses[status]).json(re);
  }
}
