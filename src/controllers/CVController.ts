// @ts-ignore
import express from "express";
import SCV from "../services/SCV";
import SResponse, {ResponseStatus} from "../services/SResponse";

export default class CVController {
    public static getAllCVs(request: express.Request, response: express.Response) {
        SCV.getAllCVs((cvs)=>{
            SResponse.getResponse(ResponseStatus.OK, cvs, "get All CVs", response);
            return;
        })
    }

    public static getSuggestedCVs(request: express.Request, response: express.Response) {

    }

    public static getCV(request: express.Request, response: express.Response) {
        const user_id = request.params.id;
        // const userId = user_id?.toString();
        if(user_id){
            SCV.getUserCV(user_id, (cv)=>{
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