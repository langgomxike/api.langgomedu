import express from 'express';
import SUserAdmin from '../../services/admin/SUserAdmin';
import SResponse, { ResponseStatus } from '../../services/SResponse';
import SClassAdmin from '../../services/admin/SClassAdmin';
import SLog, { LogType } from '../../services/SLog';
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
        const userId = parseInt(request.params.user_id);
        SUserAdmin.getAllReportUserOfUser(userId,(users) => {
            SResponse.getResponse(ResponseStatus.OK, users, "get all report user of user", response);
        });
    }

    public static async getUsers(request: express.Request, response: express.Response){
        await SUserAdmin.getAllUsers2((users)=>{
            SResponse.getResponse(ResponseStatus.OK, {users}, 'get all users 2', response)
        });
    }

}