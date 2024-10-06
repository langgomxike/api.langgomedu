import { DTO } from "./DTO";
import Permission from "../models/Permission";

export default class PermissionDTO implements DTO {
    //properties
    public id: number;
    public permission: string;
    //constructor
    constructor(id = -1, permission = "") {
        this.id = id;
        this.permission = permission;
    }
    //methods
    public fromModel(permission :Permission) {
        if(permission){
            return new PermissionDTO(
                permission.id,
                permission.permission,
            )
        }
    }
}