import { DTO } from "./DTO";
import User from "../models/User";
import FileDTO from './FileDTO';
import RoleDTO from "./RoleDTO";

export default class UserDTO {
    //properties
    public id: string;
    public full_name: string;
    public email: string;
    public phone_number: string;
    public password: string;
    public token: string;
    public avatar: FileDTO | undefined;
    public role: RoleDTO | undefined;

    //constructor
    constructor(user: User) {
        this.id = user.id;
        this.full_name = user.fullName;
        this.email = user.email;
        this.phone_number = user.phoneNumber;
        this.token = user.token;
        this.avatar = user.avatar && new FileDTO().fromModel(user.avatar) || undefined;
        this.role = user.role && new RoleDTO().fromModel(user.role) || undefined;
    }
}
