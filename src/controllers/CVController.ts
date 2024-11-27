// @ts-ignore
import express, { query } from "express";
import SCV from "../services/SCV";
import SResponse, {ResponseStatus} from "../services/SResponse";
import { parseQueryString } from "../configs/QueryHelpers";
import Filters from "../models/Filters";

export default class CVController {
    public static getAllCVs(request: express.Request, response: express.Response) {
        SCV.getAllCVs((cvs)=>{
            SResponse.getResponse(ResponseStatus.OK, cvs, "get All CVs", response);
            return;
        })
    }

    public static getSuggestedCVs(request: express.Request, response: express.Response) {
        const query = request.query
        //Địa chỉ:
        const province =  parseQueryString(query.province);
        const district =  parseQueryString(query.district);
        const ward = parseQueryString(query.ward);

        const page = Number(request.query.page) || 1;
        const perPage = Number(request.query.perPage) || 2;

        SCV.getSugestedCVs(page, perPage, province, district, ward,(cvs, pagination)=>{
            SResponse.getResponse(ResponseStatus.OK, {cvs, pagination}, "get sugests CVs", response);
            return;
        })
    }

    public static getSuggestedCVsFilter(request: express.Request, response: express.Response) {
        const query = request.query

        const filter: Filters = {
            //Địa chỉ:
            province: parseQueryString(query.province),
            district: parseQueryString(query.district),
            ward: parseQueryString(query.ward),
        
            // Ngành học (nếu có)
            major: parseQueryString(query.major),
            // classLevelId: 
            classLevelId: parseQueryString(query.classLevelId),
          };

        const page = Number(request.query.page) || 1;
        const perPage = Number(request.query.perPage) || 2;

        SCV.getSugestedCVsFilter(page, perPage, filter ,(cvs, pagination)=>{
            SResponse.getResponse(ResponseStatus.OK, {cvs, pagination}, "get sugests CVs", response);
            return;
        })
    }

    public static getCV(request: express.Request, response: express.Response) {
        const user_id = request.params.id;
        const userId = user_id?.toString();
        // console.log(user_id);
        
        if(userId){
            SCV.getUserCV2(userId, (cv)=>{
                SResponse.getResponse(ResponseStatus.OK, cv, "get User CV", response);
            })
        }else{
            SResponse.getResponse(ResponseStatus.Internal_Server_Error, [], "can't get User with this ID", response)
        }

    }

    public static createCV(request: express.Request, response: express.Response) {

    }

    public static updateCV(request: express.Request, response: express.Response) {

    }

    public static deleteCV(request: express.Request, response: express.Response) {

    }

    public static approveCV(request: express.Request, response: express.Response) {

    }
}