import User from "../models/User";
import Gender from "../models/Gender";
import { DTO } from "./DTO";
import Information from "../models/Information";

export default class InformationDTO implements DTO {
    //propẻties
    public user: User | undefined;
    public hometown: string;
    public address1: string;
    public address2: string;
    public address3: string;
    public address4: string;
    public birthday: Date;
    public gender: Gender | undefined;
    public point: number;
    public bankingNumber: string;
    public bankingCode: string;

    //constructor
    constructor(user: User | undefined = undefined, hometown = "", address1 = "", address2 = "", address3 = "", address4 = "", birthday: Date = new Date(), gender: Gender | undefined = undefined, point = 0, bankingNumber = "", bankingCode = "") {
        this.user = user;
        this.hometown = hometown;
        this.address1 = address1;
        this.address2 = address2;
        this.address3 = address3;
        this.address4 = address4;
        this.birthday = new Date(birthday);
        this.gender = gender;
        this.point = point;
        this.bankingNumber = bankingNumber;
        this.bankingCode = bankingCode;
    }
    //method
    public fromModel(information: Information) {
        if(information){
            return new InformationDTO(
                information.user,
                information.hometown,
                information.address1,
                information.address2,
                information.address3,
                information.address4,
                information.birthday,
                information.gender,
                information.point,
                information.bankingNumber,
                information.bankingCode,
            )
        }
    }

}