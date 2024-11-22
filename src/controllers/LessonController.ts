import express, { Response } from 'express';
import SLog, { LogType } from '../services/SLog';
import SResponse, { ResponseStatus } from '../services/SResponse';
import SLesson from '../services/SLesson';
import Lesson from '../models/Lesson';
import { resolve } from 'path';
export default class LessonController {
   public static demoLesson(request: express.Request, response: express.Response){
      SLesson.getAllLesson((lessons)=> {
         SLog.log(LogType.Info, "getAllLesson", '', []);
         SResponse.getResponse(ResponseStatus.OK, lessons, "get all lessons", response);
      })
   }

   public static getLessonsInClass(request: express.Request, response: express.Response) {

   }

   public static getTutorSchedule(request : express.Request, response: express.Response) {
      const { user_id } = request.query;
      const userId = user_id?.toString();
      if(userId){
         // SLog.log(LogType.Info, "getParam", "user_id", userId)
         SLesson.getTutorSchedule(userId, (lessons)=>{
             SResponse.getResponse(ResponseStatus.OK, lessons, "get tutor schedule", response);
         })
     }else{
         SResponse.getResponse(ResponseStatus.Internal_Server_Error, [], "can't get User with this ID", response)
     }
   }
   public static getLearnerSchedule(request :express.Request, response: express.Response) {
      const { user_id } = request.query;
      const userId = user_id?.toString();
      if(userId){
         // SLog.log(LogType.Info, "getParam", "user_id", userId)
         SLesson.getUserSchedule(userId, (lessons)=>{
             SResponse.getResponse(ResponseStatus.OK, lessons, "get tutor schedule", response);
         })
     }else{
         SResponse.getResponse(ResponseStatus.Internal_Server_Error, [], "can't get User with this ID", response)
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
  ) {}

  public static deleteLesson(
    request: express.Request,
    response: express.Response
  ) {}
}
