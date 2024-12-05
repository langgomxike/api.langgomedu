import express from 'express';
import SUserAdmin from '../../services/admin/SUserAdmin';
import SResponse, {ResponseStatus} from '../../services/SResponse';
import SLog, {LogType} from '../../services/SLog';
import User from "../../models/User";

export default class UserAdminController {
   
    public static getAllUsers(request: express.Request, response: express.Response) {
        const search = String(request.query.search);
        const page = Number(request.query.page) || 1;
        const perPage = Number(request.query.perPage) || 10;  
        const action = String(request.query.action);    
        
        console.log("request", request.query);
        

        SUserAdmin.getAllUsers(search, action ,page, perPage, (users, pagination) => {
            SResponse.getResponse(ResponseStatus.OK, {users, pagination}, "get all users", response);
        });
    }

    public static getAllReportUserOfUser(request: express.Request, response: express.Response) {
        const user: User = request?.body?.user;

        if(!user || !user.id){
            SLog.log(LogType.Error, "getAllReportUserOfUser", "Invalid user");
            SResponse.getResponse(ResponseStatus.Internal_Server_Error, null, "Invalid user", response);
            return;
        }

        SUserAdmin.getAllReportUserOfUser(user.id, (reports) => {
            SLog.log(LogType.Info, "getAllReportUserOfUser", "get all report user of user successfully");
            SResponse.getResponse(ResponseStatus.OK, reports, "get all report user of user successfully", response);
        });
    }

    public static getReport(request: express.Request, response: express.Response) {
        const id: number = request.params.id ?? -1;

        if(!id){
            SLog.log(LogType.Error, "getReport", "Invalid report id");
            SResponse.getResponse(ResponseStatus.Internal_Server_Error, null, "Invalid report id", response);
            return;
        }

        SUserAdmin.getReportById(id, (report) => {
            SLog.log(LogType.Info, "getReport", "get report successfully");
            SResponse.getResponse(ResponseStatus.OK, report, "get report successfully", response);
        });
    }

    public static getReportEvidences(request: express.Request, response: express.Response) {
        const id: number = request.params.id ?? -1;

        if(!id){
            SLog.log(LogType.Error, "getReportEvidences", "Invalid report id");
            SResponse.getResponse(ResponseStatus.Internal_Server_Error, null, "Invalid report id", response);
            return;
        }

        SUserAdmin.getReportEvidences(id, (evidences) => {
            SLog.log(LogType.Info, "getReportEvidences", "get evidences successfully");
            SResponse.getResponse(ResponseStatus.OK, evidences, "get evidences successfully", response);
        });
    }

    public static async getUsers(request: express.Request, response: express.Response){
        await SUserAdmin.getAllUsers2((users)=>{
            SResponse.getResponse(ResponseStatus.OK, {users}, 'get all users 2', response)
        });
    }

}