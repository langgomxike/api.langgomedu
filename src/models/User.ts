import File from "./File";
import Role from "./Role";
import Information from "./Information";
import Student from "./Student";

export default class User {
    public id: string;
    public full_name: string;
    public email: string;
    public phone_number: string;
    public password: string;
    public information: Information | undefined;
    public student: Student | undefined;
    public is_reported: boolean;
    public token: string;
    public avatar: File | undefined;
    public role: Role | undefined;
    public created_at: number;
    public updated_at: number;

    constructor(
        id = "",
        full_name = "",
        email = "",
        phone_number = "",
        password = "",
        information: Information | undefined = undefined,
        student: Student | undefined = undefined,
        is_reported = false,
        token = "",
        created_at = new Date().getTime(),
        updated_at = new Date().getTime()
    ) {
        this.id = id;
        this.full_name = full_name;
        this.email = email;
        this.phone_number = phone_number;
        this.password = password;
        this.information = information;
        this.student = student;
        this.is_reported = is_reported;
        this.token = token;
        this.created_at = created_at;
        this.updated_at = updated_at;
    }
}
