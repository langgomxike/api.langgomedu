import express, { Response } from "express";
import SResponse, { ResponseStatus } from "../services/SResponse";
import SGender from "../services/SGender";

export default class GenderController {
    public static getAllGender( request: express.Request,
        response: express.Response) {
        SGender.getAllGenders((genders) => {
            SResponse.getResponse(
                ResponseStatus.OK,
                genders,
                "get all gender",
                response
              );
        })
    }
}