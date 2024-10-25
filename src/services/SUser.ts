import { RowDataPacket } from 'mysql2';
import User from './../models/User';
import SMySQL from './SMySQL';
import SEncrypt from './SEncrypt';
import SLog, { LogType } from './SLog';

export default class SUser {
    public static getAllUsers(onNext: (users: User[]) => void) {
        const sql = `SELECT users.*,
                        JSON_OBJECT(
                            'id', roles.id,
                            'role', roles.name
                        ) AS role, 
                        JSON_OBJECT(
                            'id', files.id,
                            'path', files.path,
                            'image_width', files.image_with,
                            'image_height', files.image_height
                        ) AS avatar
                    FROM users 
                    LEFT JOIN roles ON roles.id = users.role_id
                    LEFT JOIN files ON files.id = users.avatar_id
                    GROUP BY users.id
        `;

        SMySQL.getConnection((connection) => {
            connection?.execute<any[]>(sql, (err, results) => {
                if (err) {
                    SLog.log(LogType.Error, "get all users", "failed to execute", err);
                    onNext([]);
                    return;
                }

                const users: User[] = [];

                results.forEach(result => {
                    const user: User = result;
                    users.push(user);
                });

                onNext(users);
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