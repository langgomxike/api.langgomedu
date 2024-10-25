import express from 'express';
import SUserAdmin from '../../services/admin/SUserAdmin';
import SResponse, { ResponseStatus } from '../../services/SResponse';
import SClassAdmin from '../../services/admin/SClassAdmin';
export default class AdminController {
   
    public static getAllUsers(request: express.Request, response: express.Response) {
        SUserAdmin.getAllUsers((users) => {
            SResponse.getResponse(ResponseStatus.OK, users, "get all users", response);
        });
    }

    public static getAllClasses(request: express.Request, response: express.Response) {
        SClassAdmin.getAllClasses((classes) => {
            SResponse.getResponse(ResponseStatus.OK, classes, "get all classes", response);
        });
    }

    public static getDetailClass(request: express.Request, response: express.Response) {
        const class_id = parseInt(request.params.class_id);
        SClassAdmin.getClassById(class_id,(data) => {
            SResponse.getResponse(ResponseStatus.OK, data, "get class by id", response);
        });
    }

}