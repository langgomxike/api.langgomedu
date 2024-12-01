import express from "express";
import SMajor from "../services/SMajor";
import SResponse, { ResponseStatus } from "../services/SResponse";
import { messaging } from "firebase-admin";

export default class MajorController {
  public static getAllMajors(
    request: express.Request,
    response: express.Response
  ) {
    SMajor.getAllMajors((majors) => {
      response.json(majors);
      // Response.getResponse(ResponseStatus.OK, attendances, "get attendances with the class id " + 1, response);
    });
  }

  public static createMajor(request: express.Request, response: express.Response) {
    const { vn_name, ja_name, en_name, icon } = request.body;
  
    // Kiểm tra đầu vào
    if (
      !vn_name?.trim() ||
      !ja_name?.trim() ||
      !en_name?.trim() ||
      !icon?.trim()
    ) {
      return SResponse.getResponse(
        ResponseStatus.Internal_Server_Error,
        { message: "Dữ liệu đầu vào không hợp lệ." },
        "Invalid input data.",
        response
      );
    }
  
    // Gọi hàm service để xử lý tạo major
    SMajor.createMajor(vn_name, ja_name, en_name, icon, (result: boolean) => {
      if (result) {
        return SResponse.getResponse(
          ResponseStatus.OK,
          { message: "Tạo môn học thành công." },
          "Create major successfully!",
          response
        );
      } else {
        return SResponse.getResponse(
          ResponseStatus.Internal_Server_Error,
          { message: "Không thể tạo môn học." },
          "Create major failed!",
          response
        );
      }
    });
  }
  

  public static updateMajor(
    request: express.Request,
    response: express.Response
  ) {}

  public static deleteMajor(
    request: express.Request,
    response: express.Response
  ) {}
}
