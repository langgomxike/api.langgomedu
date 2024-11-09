import express, { Response } from "express";
import SLesson from "../services/SLesson";
export default class LessonController {
  public static getLessonsInClass(
    request: express.Request,
    response: express.Response
  ) {}

  public static getSchedule(
    request: express.Request,
    response: express.Response
  ) {}

  public static createLesson(
    request: express.Request,
    response: express.Response
  ) {
    // lay cac gia tri tu request body
    const { day, started_at, duration, is_online } = request.body;
    console.log("data: ", request.body);

    // goi ham createLesson tu SLesson
    SLesson.createLesson(
      day,
      started_at,
      duration,
      is_online,
      (result, insertId) => {
        if (result) {
          response.status(201).json({
            message: "Tao buoi hoc thanh cong",
            lessonId: insertId,
          });
        } else {
          response.status(500).json({
            message: "Không thể tạo lớp học",
          });
        }
      }
    );
  }

  public static updateLesson(
    request: express.Request,
    response: express.Response
  ) {}

  public static deleteLesson(
    request: express.Request,
    response: express.Response
  ) {}
}
