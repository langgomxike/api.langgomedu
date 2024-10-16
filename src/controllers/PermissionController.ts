import express from "express";
import SPermission from "../services/SPermission";
import SResponse, { ResponseStatus } from "../services/SResponse";

export default class PermissionController {
    // public static getAllPermissions(request: express.Request, response: express.Response) {

    //     //data lấy từ database sẽ viết trong service 
    //     SPermission.getAllPermissions((permissions) => {
    //         const permissionDTOs: PermissionDTO[] = [];

    //         permissions.forEach(permission => {
    //             const permissionDTO = new PermissionDTO().fromModel(permission);
    //             permissionDTOs.push(permissionDTO);
    //         });

    //         return response.json(SResponse.getResponse(ResponseStatus.OK, permissionDTOs, "get all permissions", response));
    //     });
    // }
}