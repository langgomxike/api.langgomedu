import express, { query } from "express";
import SEducation from "../services/SEducation";
import SResponse, { ResponseStatus } from "../services/SResponse";
import SExperience from "../services/SExperience";
import SCertificate from "../services/SCertificate";

export default class UploadFileController {
    //EDUCATIONS
    public static async uploadEducationsFiles(request: express.Request, response : express.Response) {
        const files = (request as any).files;
        // console.log(files);
        
        await SEducation.uploadEducationFiles(files, (data)=>{
            SResponse.getResponse(ResponseStatus.OK, data, "Upload Education files Successfully", response);
        })
    }

    public static async uploadExperienceFiles(request: express.Request, response : express.Response) {
        const files = (request as any).files;
        // console.log(files);
        
        await SExperience.uploadExperienceFiles(files, (data)=>{
            SResponse.getResponse(ResponseStatus.OK, data, "Upload experience files Successfully", response);
        })
    }
    
    public static async uploadCertificateFiles(request: express.Request, response : express.Response) {
        const files = (request as any).files;
        // console.log(files);
        
        await SCertificate.uploadCertificateFiles(files, (data)=>{
            SResponse.getResponse(ResponseStatus.OK, data, "Upload certificate files Successfully", response);
        })
    }

}