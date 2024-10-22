import { RowDataPacket } from 'mysql2';
import User from './../models/User';
import SMySQL from './SMySQL';
import SFile from './SFile';
import SRole from './SRole';
import SEncrypt from './SEncrypt';

interface IUser extends RowDataPacket {
    id: string,
    full_name: string,
    email: string
    phone_number: string,
    password: string,
    token: string,
    avatar_id: number,
    role_id: number,
    created_at: number,
    updated_at: number
}

export default class SUser {
    public static getAllUsers(onNext: (users: User[]) => void) {
        const sql = "SELECT * FROM users";

        SMySQL.getConnection((connection) => {
            connection?.execute<IUser[]>(sql, (err, results) => {
                if (err) {
                    onNext([]);
                    return;
                }

                SRole.getRolesByIds(results.map(result => result.role_id), (roles) => {
                    // SLog.log(LogType.Info, "getRolesByIds", "ids: " + results.map(result => result.role_id).join(", "), roles);
                    SFile.getFilesByIds(results.map(result => result.avatar_id), (files) => {
                        const users: User[] = [];
                        results.forEach(iUser => {
                            const user = new User();
                            user.id = iUser.id;
                            user.full_name = iUser.full_name;
                            user.email = iUser.email;
                            user.password = iUser.password;
                            user.token = iUser.token;
                            user.avatar = files.find(file => file.id === iUser.avatar_id);
                            user.role = roles.find(role => role.id === iUser.role_id);
                            user.created_at = new Date(iUser.created_at);
                            user.updated_at = new Date(iUser.updated_at);
                            users.push(user);
                        });

                        onNext(users);
                        // SLog.log(LogType.Info, "getAllUsers", "", { err: err, results: results });
                    });
                });
            });
        });
    }

    public static getUserById(id: number, onNext: (user: User | undefined) => void) {
        const sql = "SELECT * FROM users WHERE id = ?";

        SMySQL.getConnection(connection => {
            connection?.execute<any>(sql, [id], (error, result) => {
                if (error) {
                    onNext(undefined);
                    return;
                } else {
                    const user: User | undefined = result;
                    onNext(user);
                }
            });
        });
    }

    public static getUserByEmail(email: string, onNext: (user: User | undefined) => void) {
        const sql = "SELECT * FROM users WHERE email = ?";

        SMySQL.getConnection(connection => {
            connection?.execute<any>(sql, [email], (error, result) => {
                if (error) {
                    onNext(undefined);
                    return;
                } else {
                    const user: User | undefined = result;
                    onNext(user);
                }
            });
        });
    }

    public static getUserByToken(token: string, onNext: (user: User | undefined) => void) {
        const sql = "SELECT * FROM users WHERE token = ?";

        SMySQL.getConnection(connection => {
            connection?.execute<any>(sql, [token], (error, result) => {
                if (error) {
                    onNext(undefined);
                    return;
                } else {
                    const user: User | undefined = result;
                    onNext(user);
                }
            });
        });
    }

    public static getUserByPhoneNumber(phoneNumber: string, onNext: (user: User | undefined) => void) {
        const sql = "SELECT * FROM users WHERE phone_number = ?";

        SMySQL.getConnection(connection => {
            connection?.execute<any>(sql, [phoneNumber], (error, result) => {
                if (error) {
                    onNext(undefined);
                    return;
                } else {
                    const user: User | undefined = result;
                    onNext(user);
                }
            });
        });
    }

    public static checkUserPassword(userId: string, password: string, onNext: (result: boolean) => void) {
        const sql = "SELECT password FROM users WHERE id = ?";

        SMySQL.getConnection(connection => {
            connection?.execute<any>(sql, [userId], (error, result) => {
                if (error) {
                    onNext(false);
                    return;
                } else {
                    const userPassword: string = result;
                    onNext(SEncrypt.decrypt(userPassword, "") === password);
                }
            });
        });
    }

    public static storeUser(user: User, onNext: (id: number | undefined) => void) { }

    public static updateUserInfo(id: number, onNext: (result: boolean) => void) { }

    public static softDeleteUser(id: number, onNext: (result: boolean) => void) {

    }
}