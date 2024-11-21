import File from "./File";
import Role from "./Role";
import Address, { addressJson } from "./Address";
import Gender, { genderJson } from "./Gender";

export default class User {
    public id: string;
    public full_name: string;
    public user_name: string;
    public email: string;
    public phone_number: string;
    public password: string;
    public token: string;
    public avatar: string;
    public role: Role | undefined;
    public hometown: string;
    public address: Address | undefined;
    public birthday: number;
    public gender: Gender | undefined;
    public point: number;
    public bankingNumber: string;
    public bankingCode: string;
    public created_at: number;
    public updated_at: number;
    public roles: Role[];

    constructor(
        id = "",
        full_name = "",
        user_name = "",
        email = "",
        phone_number = "",
        password = "",
        token = "",
        avatar = "",
        role: Role | undefined = undefined,
        hometown: string = "",
        address: Address | undefined = undefined,
        birthday = 0,
        gender: Gender | undefined = undefined,
        point: number = 0,
        bankingNumber: string = "",
        bankingCode: string = "",
        created_at = 0,
        updated_at = 0,
        roles = []
    ) {
        this.id = id;
        this.full_name = full_name;
        this.user_name = user_name;
        this.email = email;
        this.phone_number = phone_number;
        this.password = password;
        this.token = token;
        this.avatar = avatar;
        this.role = role;
        this.hometown = hometown;
        this.address = address;
        this.birthday = birthday;
        this.gender = gender;
        this.point = point;
        this.bankingNumber = bankingNumber;
        this.bankingCode = bankingCode;
        this.created_at = created_at;
        this.updated_at = updated_at;
        this.roles = roles;
    }
}

export const userJson = (asName: string, asAddressName: string, asGendername: string): string => {
    return `JSON_OBJECT(
    'id', ${asName}.id,
    'full_name', ${asName}.full_name,
    'user_name',${asName}.user_name,
    'email', ${asName}.email,
    'phone_number', ${asName}.phone_number,
    'password', ${asName}.password,
    'token', ${asName}.token,
    'avatar', ${asName}.avatar,
    'birthday', ${asName}.birthday,
    'point', ${asName}.point,
    'banking_number', ${asName}.banking_number,
    'banking_code', ${asName}.banking_code,
    'hometown', ${asName}.hometown,
    'gender', ${genderJson(asGendername)},
    'address', ${addressJson(asAddressName)},
    'created_at', ${asName}.created_at,
    'updated_at', ${asName}.updated_at
) as user`;
}

export const userJsonwithoutName = (asName: string, asAddressName: string, asGendername: string): string => {
    return `JSON_OBJECT(
    'id', ${asName}.id,
    'full_name', ${asName}.full_name,
    'user_name',${asName}.user_name,
    'email', ${asName}.email,
    'phone_number', ${asName}.phone_number,
    'password', ${asName}.password,
    'token', ${asName}.token,
    'avatar', ${asName}.avatar,
    'birthday', ${asName}.birthday,
    'point', ${asName}.point,
    'banking_number', ${asName}.banking_number,
    'banking_code', ${asName}.banking_code,
    'hometown', ${asName}.hometown,
    'gender', ${genderJson(asGendername)},
    'address', ${addressJson(asAddressName)},
    'created_at', ${asName}.created_at,
    'updated_at', ${asName}.updated_at
)`;
}