// @ts-ignore
import express, { Response } from 'express';
import SLog, { LogType } from '../services/SLog';
import SResponse, { ResponseStatus } from '../services/SResponse';
import SLesson from '../services/SLesson';
import Lesson from '../models/Lesson';
import { resolve } from 'path';
import db from '../configs/knex';
import { userJson } from '../models/User';
export default class LessonController {
    public static demoLesson(request: express.Request, response: express.Response) {
        SLesson.getAllLesson((lessons) => {
            SLog.log(LogType.Info, "getAllLesson", '', []);
            SResponse.getResponse(ResponseStatus.OK, lessons, "get all lessons", response);
        })
    }

    public static getLessonsInClass(request: express.Request, response: express.Response) {

    }

    public static getTutorSchedule(request: express.Request, response: express.Response) {
        const { id } = request.params;
        const userId = id?.toString();
        if (userId) {
            // SLog.log(LogType.Info, "getParam", "user_id", userId)
            SLesson.getTutorSchedule2(userId, (lessons) => {
                SResponse.getResponse(ResponseStatus.OK, lessons, "get tutor schedule", response);
            })
        } else {
            SResponse.getResponse(ResponseStatus.Internal_Server_Error, [userId], "can't get tutor with this ID", response)
        }
    }
    public static getLearnerSchedule(request: express.Request, response: express.Response) {
        const { id } = request.params;
        const userId = id?.toString();
        if (userId) {
            // SLog.log(LogType.Info, "getParam", "user_id", userId)
            SLesson.getUserSchedule2(userId, (lessons) => {
                SResponse.getResponse(ResponseStatus.OK, lessons, "get leaner schedule", response);
            })
        } else {
            SResponse.getResponse(ResponseStatus.Internal_Server_Error, [], "can't get learner with this ID", response)
        }
    }

    // public static getSchedule(request: express.Request, response: express.Response) {
    //     const { tutor_id, user_id } = request.query;
    //     const tutorId = tutor_id?.toString();
    //     const userId = user_id?.toString();

    //     if (tutorId) {
    //         // Gọi phương thức lấy lịch của tutor
    //         SLesson.getTutorSchedule2(tutorId, (lessons) => {
    //             SResponse.getResponse(ResponseStatus.OK, lessons, "get tutor schedule", response);
    //         });
    //     } else if (userId) {
    //         // Gọi phương thức lấy lịch của learner
    //         SLesson.getUserSchedule2(userId, (lessons) => {
    //             SResponse.getResponse(ResponseStatus.OK, lessons, "get learner schedule", response);
    //         });
    //     } else {
    //         // Không có tham số hợp lệ
    //         SResponse.getResponse(ResponseStatus.Internal_Server_Error, [], "Missing tutor_id or user_id", response);
    //     }
    // }

    public static getUserParentAndChildren(request: express.Request, response: express.Response) {
        const { id } = request.params;
        const userId = id?.toString();
        if(userId){
            SLesson.getUserParentandChildren(userId, (users) => {
                SResponse.getResponse(ResponseStatus.OK, [users], "parent and children", response);
            })
        }else {
            SResponse.getResponse(ResponseStatus.Internal_Server_Error, [], "can't get parent and chirkd with this ID", response)
        }
    }


    //   public static createLesson(
    //     request: express.Request,
    //     response: express.Response
    //   ) {
    //     // lay cac gia tri tu request body
    //     const { day, started_at, duration, is_online } = request.body;
    //     console.log("data: ", request.body);

    //     // goi ham createLesson tu SLesson
    //     SLesson.createLesson(
    //       day,
    //       started_at,
    //       duration,
    //       is_online,
    //       (result, insertId) => {
    //         if (result) {
    //           response.status(201).json({
    //             message: "Tao buoi hoc thanh cong",
    //             lessonId: insertId,
    //           });
    //         } else {
    //           response.status(500).json({
    //             message: "Không thể tạo lớp học",
    //           });
    //         }
    //       }
    //     );
    //   }

    public static updateLesson(
        request: express.Request,
        response: express.Response
    ) { }

    public static deleteLesson(
        request: express.Request,
        response: express.Response
    ) { }
}
