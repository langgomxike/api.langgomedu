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

   public static getSchedule(request: express.Request, response: express.Response) {
      const { user_id, student_id } = request.query;
      const studentId = student_id?.toString();
      const userId = user_id?.toString();
       
         if((user_id && student_id) || (!user_id && !student_id)){
           SResponse.getResponse(ResponseStatus.Internal_Server_Error, [], "can't not get schedule", response)
           return;
         }

         if(userId){
            const promises: Promise<Lesson[]>[] = [
               new Promise(resolve => {
                  SLesson.getTutorSchedule(userId, (lesson)=> resolve(lesson))
               }),
               new Promise(resolve => {
                  SLesson.getUserSchedule(userId, (lesson)=> resolve(lesson))
               })
            ]

            Promise.all(promises).then((result)=>{
               const lessons = result.flat();
               SResponse.getResponse(ResponseStatus.OK, lessons, "get user schedule", response)
            }).catch((err)=> {
               SLog.log(LogType.Error, "get schedule", "failed to get schedule", err);
            SResponse.getResponse(ResponseStatus.Internal_Server_Error, [], "can't get schedule", response);
            })
            // SLesson.getTutorSchedule(userId,(lessons)=>{
            //    SResponse.getResponse(ResponseStatus.OK, lessons, "get tutor schedule", response);
            // })
         }
         if(studentId){
            SLesson.getLearnerSchedule(studentId, (lessons)=>{
               SResponse.getResponse(ResponseStatus.OK, lessons, "get learner schedule", response);
            })
         }
      // SResponse.getResponse(ResponseStatus.OK, [userId, studentId], 'get Schedule', response)
   }

   public static createLesson(request: express.Request, response: express.Response) {

   }

   public static updateLesson(request: express.Request, response: express.Response) {

   }

   public static deleteLesson(request: express.Request, response: express.Response) {
    
   }

}