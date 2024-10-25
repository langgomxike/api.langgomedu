import { QueryResult, RowDataPacket } from 'mysql2';
import User from './../models/User';
import SLog, { LogType } from './SLog';
import SMySQL from './SMySQL';
import SFile from './SFile';
import SRole from './SRole';


export default class SUser {

    public static getUserById(id: number, onNext: (user: User | undefined) => void) {

    }

    public static getUserByEmail(email: string, onNext: (user: User | undefined) => void) {

    }

    public static getUserByToken(token: string, onNext: (user: User | undefined) => void) { }

    public static storeUser(user: User, onNext: (id: number | undefined) => void) { }

    public static updateUserInfo(id: number, onNext: (result: boolean) => void) { }

    public static softDeleteUser(id: number, onNext: (result: boolean) => void) {

    }
}