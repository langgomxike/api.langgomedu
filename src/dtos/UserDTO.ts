import { DTO } from "./DTO";
import User from "../models/User";
import FileDTO from './FileDTO';
import RoleDTO from "./RoleDTO";

export default class UserDTO implements DTO {
    //properties
    public id: string;
    public full_name: string;
    public email: string;
    public phone_number: string;
    public token: string;
    public avatar: FileDTO | undefined;
    public role: RoleDTO | undefined;

    //constructor
    constructor(
        id: string = "",
        fullName: string = "",
        email: string = "",
        phoneNumber: string = "",
        token: string = "",
        avatar: FileDTO | undefined = undefined,
        role: RoleDTO | undefined = undefined) {
        this.id = id;
        this.full_name = fullName;
        this.email = email;
        this.phone_number = phoneNumber;
        this.token = token;
        this.avatar = avatar;
        this.role = role;
    }

    public fromModel(user: User) {
        this.id = user.id;
        this.full_name = user.fullName;
        this.email = user.email;
        this.phone_number = user.phoneNumber;
        this.token = user.token;
        this.avatar = user.avatar && new FileDTO().fromModel(user.avatar) || undefined;
        this.role = user.role && new RoleDTO().fromModel(user.role) || undefined;
    }
}
