import express, { query, Response } from 'express';
import SResponse, { ResponseStatus } from '../services/SResponse';
import SLog, { LogType } from '../services/SLog';
import Class from '../models/Class';
import SMySQL from '../services/SMySQL';
import SClass from '../services/SClass';
export default class ClassController {
    public static getSuggestedClasses(request: express.Request, response: express.Response) {

    }

    public static getTeachingClasses(request: express.Request, response: express.Response) {

    }

    public static getAttendingClasses(request: express.Request, response: express.Response) {
         // Lấy user_id từ request.params
         const user_id = request.query.user_id ?? "rong";
        SLog.log(LogType.Info, "getAttendingClasses", "user id", user_id)
        // SClass.getClassesLearning(user_id,(classes) => {
        //     response.json(classes);
        // })
    }

    public static getAllClasses(request: express.Request, response: express.Response) {

    }

    public static getClass(request: express.Request, response: express.Response) {

    }

    public static createClass(request: express.Request, response: express.Response) {

    }

    public static updateClass(request: express.Request, response: express.Response) {
        // SLog.log(LogType.Info, "updateClass", "body in request", request.body);
        // const _classDTO: ClassDTO = request?.body?.class;

        // if (!_classDTO) {
        //     SResponse.getResponse(ResponseStatus.Internal_Server_Error, null, "Class is not valid", response);
        //     return;
        // }

        // const _class = new Class().fromDTO(_classDTO);

        // SClass.updateClass(_class, (result) => {
        //     if (!result) {
        //         SResponse.getResponse(ResponseStatus.Internal_Server_Error, null, "Server cannot update", response);
        //         return;
        //     }

        //     SResponse.getResponse(ResponseStatus.OK, null, "Update class successfully", response);
        //     return;
        // });
    }

    public static deleteClass(request: express.Request, response: express.Response) {

    }

    public static requestToAttendClass(request: express.Request, response: express.Response) {

    }

    public static acceptToAttendClass(request: express.Request, response: express.Response) {

    }

    public static approveToAttendClass(request: express.Request, response: express.Response) {

    }

    public static getAllLevels(request: express.Request, response: express.Response) {

    }

    public static createLevel(request: express.Request, response: express.Response) {

    }

    public static updateLevel(request: express.Request, response: express.Response) {

    }

    public static deleteLevel(request: express.Request, response: express.Response) {

    }

}