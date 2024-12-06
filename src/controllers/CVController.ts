// @ts-ignore
import express, { query } from "express";
import SCV from "../services/SCV";
import SResponse, {ResponseStatus} from "../services/SResponse";
import { parseQueryString } from "../configs/QueryHelpers";
import Filters from "../models/Filters";
import SEducation from "../services/SEducation";
import SAddress from "../services/SAddress";


export default class CVController {
    public static getAllCVs(request: express.Request, response: express.Response) {
        SCV.getAllCVs((cvs)=>{
            SResponse.getResponse(ResponseStatus.OK, cvs, "get All CVs", response);
            return;
        })
    }


    public static getSuggestedCVs(request: express.Request, response: express.Response) {
        const query = request.query

        const userId = request.params.user_id;
        console.log(userId);

        const address = String(request.query.address);
        console.log(typeof request.query.address );
        
        const page = Number(request.query.page) || 1;
        const perPage = Number(request.query.perPage) || 2;

        SCV.getSugestedCVs(userId ,page, perPage, address ,(cvs, pagination)=>{
            SResponse.getResponse(ResponseStatus.OK, {cvs, pagination}, "get sugests CVs", response);
            return;
        })
    }

    public static getFilterCVs(request: express.Request, response: express.Response) {
        const query = request.query

        const userId = request.params.user_id;
        console.log(userId);
        

        const filter: Filters = {
            //Địa chỉ:
            province: parseQueryString(query.province),
            district: parseQueryString(query.district),
            ward: parseQueryString(query.ward),
            genders: parseQueryString(query.genders),
          };

        const page = Number(request.query.page) || 1;
        const perPage = Number(request.query.perPage) || 2;

        SCV.getFilterCVs(userId ,page, perPage, filter ,(cvs, pagination)=>{
            SResponse.getResponse(ResponseStatus.OK, {cvs, pagination}, "get filter CVs", response);
            return;
        })
    }

    public static getCV(request: express.Request, response: express.Response) {
        const user_id = request.params.id;
        const userId = user_id?.toString();
        // console.log(user_id);
        
        if(userId){
            SCV.getAllUserCVs(userId, (cv)=>{
                SResponse.getResponse(ResponseStatus.OK, cv, "get User CV", response);
            })
        }else{
            SResponse.getResponse(ResponseStatus.Internal_Server_Error, [], "can't get User with this ID", response)
        }

    }

    public static createCV(request: express.Request, response: express.Response) {
        const body = request.body;
        // console.log(body);
        SCV.UpdateCV(body, (data)=> {
            // console.log("successfully", data);
            if(data){
                SResponse.getResponse(ResponseStatus.OK, [data], "Update CV", response);
            }else{
                SResponse.getResponse(ResponseStatus.Forbidden, [data], "Update CV fail", response);
            }
        })
    }

    public static updateCV(request: express.Request, response: express.Response) {
        
    }

    public static deleteCV(request: express.Request, response: express.Response) {

    }
    public static approveCV(request: express.Request, response: express.Response) {

    }

    // public static test(request: express.Request, response: express.Response){
    //     const param = request.query.detail;
    //     const detail = param ? param.toString() : "";
    //     console.log(detail);
    //     SAddress.getAddressByDetail(detail , (data)=> {
    //         SResponse.getResponse(ResponseStatus.OK, [data], "", response);
    //     })
    // }

    
}