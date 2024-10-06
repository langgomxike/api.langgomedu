import { DTO } from "./DTO";
import User from "../models/User";
import Permission from "../models/Permission";
import UserPermission from "../models/UserPermission";

export default class UserPermissionDTO implements DTO{
    //properties
    public user: User | undefined;
    public permission: Permission | undefined;

    //constructor
    constructor(user: User | undefined = undefined, permission: Permission | undefined = undefined){
        this.user = user;
        this.permission = permission;
    }

    //methods
    public fromModel(userPermission : UserPermission) {
         if(userPermission){
            return new UserPermissionDTO(
                userPermission.user,
                userPermission.permission
            )
         }
    }
}