import express from "express";
import SClassLevel from "../services/SClassLevel";
import SResponse, { ResponseStatus } from "../services/SResponse";

export class ClassLevelController {
    public static getAllClassLevels(request: express.Request, response: express.Response) {
        SClassLevel.getAllClassLevels((classLevels) => {
            SResponse.getResponse(ResponseStatus.OK, classLevels,  "get All class level", response);
            return;
        })
    }
}