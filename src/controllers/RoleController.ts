// @ts-ignore
import express from "express";
import SRole from "../services/SRole";
import SResponse, {ResponseStatus} from "../services/SResponse";

export default class RoleController {
    public static getAllRoles(request: express.Request, response: express.Response) {
        SRole.getAllRoles(roles => {
            SResponse.getResponse(ResponseStatus.OK, roles, "Get all roles", response);
        });
    }
}