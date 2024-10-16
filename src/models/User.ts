import File from "./File";
import Role from "./Role";
export default class User {
    public id: string;
    public fullName: string;
    public email: string;
    public phoneNumber: string;
    public password: string;
    public token: string;
    public avatar: File | undefined;
    public role: Role | undefined;
    public createdAt: Date;
    public updatedAt: Date;

    constructor(id = "", fullName = "", email = "", phoneNumber = "", password = "", token = "", createdAt: Date = new Date(), updatedAt: Date = new Date()) {
        this.id = id;
        this.fullName = fullName;
        this.email = email;
        this.phoneNumber = phoneNumber;
        this.password = password;
        this.token = token;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
}