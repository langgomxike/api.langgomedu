import { DTO } from "./DTO";
import User from "../models/User";
import Role from "../models/Role";

export default class UserDTO implements DTO {

    //properties
    public id: string
    public fullname: string
    public email: string
    public phoneNumber: string
    public token: string
    public avatar?: File
    public role?: Role

    //constructor
    constructor(
        id: string, 
        fullname: string,
        email: string,
        phoneNumber: string,
        token: string,
        avatar?: File,
        role?: Role ){
            this.id = id
            this.fullname = fullname
            this.email = email
            this.phoneNumber = phoneNumber
            this.token = token
            this.avatar = avatar
            this.role = role
        }

    public fromModel(user : User): UserDTO | string | undefined {
        if(user){

            // Kiểm tra kiểu của avatar
            const avatar = user.avatar instanceof File ? user.avatar : undefined;
            
            // Kiểm tra kiểu của role
            const role = user.role instanceof Role ? user.role : undefined;

            return new UserDTO(
                user.id,
                user.fullName,
                user.email,
                user.phoneNumber,
                user.token,
                avatar,
                role
            )
        }else{
            return "DTO is unvalid";
        }
    }
}
