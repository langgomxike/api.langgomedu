import express from 'express';
import SUserAdmin from '../../services/admin/SUserAdmin';
import SResponse, { ResponseStatus } from '../../services/SResponse';
import SClassAdmin from '../../services/admin/SClassAdmin';
import SLog, { LogType } from '../../services/SLog';
export default class ClassAdminController {
   
    public static getAllClasses(request: express.Request, response: express.Response) {
        const search = String(request.query.search);
        const page = Number(request.query.page) || 1;
        const perPage = Number(request.query.perPage) || 10;  
        const action = String(request.query.action);    
        
        SClassAdmin.getAllClasses(search, action, page, perPage,(classes, pagination) => {
            SResponse.getResponse(ResponseStatus.OK, {classes, pagination}, "get all classes", response);
        });
    }

    public static getDetailClass(request: express.Request, response: express.Response) {
        const class_id = parseInt(request.params.class_id);
        SClassAdmin.getClassById(class_id,(lessons, users) => {
            console.log(">>> getDetailClass",   lessons, users );
            
            SResponse.getResponse(ResponseStatus.OK, {lessons, users}, "get class by id", response);
        });
    }

    public static approveClass (request: express.Request, response: express.Response) {
        const class_id = parseInt(request.body.class_id);
        SClassAdmin.approveClass(class_id, (result, message) => {
            SResponse.getResponse(ResponseStatus.OK, {result, message}, "admin approve class", response);
        });
    }

    public static approvePaymentByAdmin (request: express.Request, response: express.Response) {
        const class_id = parseInt(request.body.class_id);
        SClassAdmin.approvePaymentByAdmin(class_id, (result, message) => {
            SResponse.getResponse(ResponseStatus.OK, {result, message}, "Approve payment by admin", response);
        });
    }

}