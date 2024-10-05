import User from "./User";
import Permission from "./Permission";
export default class UserPermission {
    public user: User | undefined;
    public permission: Permission | undefined;

    constructor(user: User | undefined = undefined, permission: Permission | undefined = undefined){
        this.user = user;
        this.permission = permission;
    }
}