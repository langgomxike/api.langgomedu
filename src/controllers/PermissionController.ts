// @ts-ignore
import express from "express";
import SPermission from "../services/SPermission";
import SResponse, {ResponseStatus} from "../services/SResponse";
import User from "../models/User";
import SLog, {LogType} from "../services/SLog";

export default class PermissionController {
    public static getAllPermissions(request: express.Request, response: express.Response) {
        //data lấy từ database sẽ viết trong service
        SPermission.getAllPermissions((permissions) => {
            return response.json(SResponse.getResponse(ResponseStatus.OK, permissions, "get all permissions", response));
        });
    }

    public static getPermissionsOfUser(request: express.Request, response: express.Response) {
        const user: User = request?.body?.user;

        if (!user || !user.id) {
            SLog.log(LogType.Error, "getPermissionsOfUser", "user not found");
            return response.json(SResponse.getResponse(ResponseStatus.Internal_Server_Error, null, "Invalid user", response));
        }

        SPermission.getPermissionsOfUser(user.id, (permissions) => {
            return response.json(SResponse.getResponse(ResponseStatus.OK, permissions, "get permissions of user", response));
        });
    }
}