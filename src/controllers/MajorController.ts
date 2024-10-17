import express from "express";
import SMajor from "../services/SMajor";

export default class MajorController {
    public static getAllMajors(request: express.Request, response: express.Response) {
        SMajor.getAllMajors((majors) => {
            response.json(majors);
            // Response.getResponse(ResponseStatus.OK, attendances, "get attendances with the class id " + 1, response);
        })
    }

    public static createMajor(request: express.Request, response: express.Response) {

    }

    public static updateMajor(request: express.Request, response: express.Response) {

    }

    public static deleteMajor(request: express.Request, response: express.Response) {
        
    }
}