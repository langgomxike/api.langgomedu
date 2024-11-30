import File from "./File";
import Role, { arrayRoleJson } from "./Role";
import Address, { addressJson } from "./Address";
import Gender, { genderJson } from "./Gender";
import ClassLevel, { classLevelSubquery } from "./ClassLevel";
import Major, { majorsSubquery } from "./Major";
import db from "../configs/knex";
import {Knex } from "knex";
import Attendance from "./Attendance";

export default class User {
    public id: string;
    public full_name: string;
    public username: string;
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
    public banking_number: string;
    public banking_code: string;
    public parent: User | undefined;
    public created_at: number;
    public updated_at: number;
    public roles: Role[];
    public interested_class_levels: ClassLevel[];
    public interested_majors: Major[];
    public children: User[] | undefined;
    public attendance: Attendance | undefined;
    public is_reported: boolean;

    constructor(
        id = "",
        full_name = "",
        username = "",
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
        parent: User |  undefined = undefined,
        created_at = 0,
        updated_at = 0,
        roles = [],
        children: User[] | undefined = undefined,
        attendance: Attendance | undefined = undefined,
        is_reported: boolean = false,
    ) {
        this.id = id;
        this.full_name = full_name;
        this.username = username;
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
        this.banking_number = bankingNumber;
        this.banking_code = bankingCode;
        this.parent = parent;
        this.created_at = created_at;
        this.updated_at = updated_at;
        this.roles = roles;
        this.children = children;
        this.attendance = attendance;
        this.is_reported = is_reported;
    }
}

export const userJson = (asName: string, asAddressName: string, asGendername: string): string => {
    return `JSON_OBJECT(
    'id', ${asName}.id,
    'full_name', ${asName}.full_name,
    'username',${asName}.user_name,
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
    'username',${asName}.user_name,
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

export const subqueryUser = (alias: string) => {
    return db('users')
    .select(db.raw(userJsonwithoutName('users', 'address', 'gender')))
    .leftJoin('addresses as address', 'address.id', `users.address_id`)
    .leftJoin('genders as gender', 'gender.id', 'users.gender_id')
    .where('users.id', 'c.tutor_id')
}

export const simpleUserJson = (asName: string, roleAlias: string): string => {
    return `JSON_OBJECT(
        'id', ${asName}.id,
        'full_name', ${asName}.full_name,
        'avatar', ${asName}.avatar,
        'point', ${asName}.point,
        'parent', ${asName}.parent_id,
        'roles', ${arrayRoleJson(roleAlias)}
    ) as user`;
}

export const userForCVJSON = (alias: string, addressAlias: string, genderAlias: string): string => {
    return `JSON_OBJECT(
    'id', ${alias}.id,
    'full_name', ${alias}.full_name,
    'username',${alias}.user_name,
    'phone_number', ${alias}.phone_number,
    'password', ${alias}.password,
    'token', ${alias}.token,
    'avatar', ${alias}.avatar,
    'birthday', ${alias}.birthday,
    'point', ${alias}.point,
    'banking_number', ${alias}.banking_number,
    'banking_code', ${alias}.banking_code,
    'hometown', ${alias}.hometown,
    'gender', ${genderJson(genderAlias)},
    'address', ${addressJson(addressAlias)},
    'created_at', ${alias}.created_at,
    'updated_at', ${alias}.updated_at,
    'interested_class_levels', (${classLevelSubquery(alias)}),
    'interested_majors', (${majorsSubquery(alias)})
    )`
}

export const cvJoin = (reference: string, alias: string, addressAlias: string, genderAlias: string, classLevelAlias:string, majorsAlias: string, query : Knex.QueryBuilder): Knex.QueryBuilder => {
    return query
    .leftJoin(`users as ${alias}`, `${alias}.id`, `${reference}.id`)
    .leftJoin(`addresses as ${addressAlias}`, `${addressAlias}.id`, `${alias}.address_id`)
    .leftJoin(`genders as ${genderAlias}`, `${genderAlias}.id`, `${alias}.gender_id`)
    .leftJoin(`interested_class_levels as ${classLevelAlias}`, `${classLevelAlias}.user_id`, `${alias}.id`)
    .leftJoin(`interested_majors as ${majorsAlias}`, `${majorsAlias}.user_id`, `${alias}.id`)
}