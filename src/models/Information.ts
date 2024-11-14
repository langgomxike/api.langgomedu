import Gender from "./Gender";
import User from "./User";

export default class Information {
    public user: User | undefined;
    public hometown: string;
    public address_1: string;
    public address_2: string;
    public address_3: string;
    public address_4: string;
    public birthday: Date;
    public gender: Gender | undefined;
    public point: number;
    public bankingNumber: string;
    public bankingCode: string;

    constructor(user: User | undefined = undefined, hometown = "", address1 = "", address2 = "", address3 = "", address4 = "", birthday: Date = new Date(), gender: Gender | undefined = undefined, point = 0, bankingNumber = "", bankingCode = "") {
        this.user = user;
        this.hometown = hometown;
        this.address_1 = address1;
        this.address_2 = address2;
        this.address_3 = address3;
        this.address_4 = address4;
        this.birthday = new Date(birthday);
        this.gender = gender;
        this.point = point;
        this.bankingNumber = bankingNumber;
        this.bankingCode = bankingCode;
    }
}