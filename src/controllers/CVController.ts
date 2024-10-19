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