import User from './../models/User';
import SMySQL from './SMySQL';
import SLog, {LogType} from './SLog';
import {v4} from "uuid";
import SFirebase, {FirebaseNode} from "./SFirebase";
import Inbox from "../models/Inbox";
import Message from "../models/Message";
import SMessage from "./SMessage";
import SInformation from "./SInformation";
import SFile from "./SFile";
import SRole from "./SRole";
import Role from "../models/Role";
import RoleList from "../configs/RoleConfig";
import SPermission from "./SPermission";

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

                SLog.log(LogType.Info, "getAllUsers", "", users);
                onNext(users);
            });
        });
    }

    public static getContactUsers(userId: string, onNext: (users: User[]) => void) {
        SMessage.getInboxes(userId, inboxes => {
            const contacts = inboxes.map(inbox => inbox.user);

            SLog.log(LogType.Info, "getContactUsers", "", contacts.length);

            contacts.sort((a,b) => a.full_name > b.full_name? 1 : -1);

            onNext(contacts);
        });
    }

    public static getUserById(id: string, onNext: (user: User | undefined) => void) {
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
                            ) AS avatar,
                            JSON_OBJECT(
                                    'hometown', informations.hometown,
                                    'address_1', informations.address_1,
                                    'address_2', informations.address_2,
                                    'address_3', informations.address_3,
                                    'address_4', informations.address_4,
                                    'birthday', informations.birthday,
                                    'gender', JSON_OBJECT(
                                            'vn_gender', genders.vn_gender,
                                            'ja_gender', genders.ja_gender,
                                            'en_gender', genders.en_gender
                                              )
                            ) AS information
                     FROM users
                              INNER JOIN roles ON roles.id = users.role_id
                              INNER JOIN files ON files.id = users.avatar_id
                              INNER JOIN informations ON informations.user_id = users.id
                              INNER JOIN genders ON genders.id = informations.gender_id
                     WHERE users.id = ?`;

        SMySQL.getConnection(connection => {
            connection?.execute<any>(sql, [id], (error, result) => {
                if (error) {
                    onNext(undefined);
                    SLog.log(LogType.Error, "getUserById", "", error);
                    return;
                } else {
                    const user: User | undefined = result && result[0] || undefined;

                    SLog.log(LogType.Info, "getUserById", "", user);
                    onNext(user);
                }
            });
        });
    }

    public static getUserByEmail(email: string, onNext: (user: User | undefined) => void) {
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
                              INNER JOIN roles ON roles.id = users.role_id
                              INNER JOIN files ON files.id = users.avatar_id
                     WHERE email = ?`;

        SMySQL.getConnection(connection => {
            connection?.execute<any>(sql, [email], (error, result) => {
                if (error) {
                    onNext(undefined);
                    SLog.log(LogType.Error, "getUserByEmail", "", error);
                    return;
                } else {
                    const user: User | undefined = result && result[0] || undefined;

                    SLog.log(LogType.Info, "getUserByEmail", "", user);
                    onNext(user);
                }
            });
        });
    }

    public static getUserByToken(token: string, onNext: (user: User | undefined) => void) {
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
                              INNER JOIN roles ON roles.id = users.role_id
                              INNER JOIN files ON files.id = users.avatar_id
                     WHERE token = ?`;

        SMySQL.getConnection(connection => {
            connection?.execute<any>(sql, [token], (error, result) => {
                if (error) {
                    onNext(undefined);
                    SLog.log(LogType.Error, "getUserByToken", "", error);
                    return;
                } else {
                    const user: User | undefined = result && result[0] || undefined;
                    SLog.log(LogType.Info, "getUserByToken", "", user?.full_name);
                    onNext(user);
                }
            });
        });
    }

    public static getUserByPhoneNumber(phoneNumber: string, onNext: (user: User | undefined) => void) {
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
                              INNER JOIN roles ON roles.id = users.role_id
                              INNER JOIN files ON files.id = users.avatar_id
                     WHERE phone_number = ?`;

        SMySQL.getConnection(connection => {
            connection?.execute<any>(sql, [phoneNumber], (error, result) => {
                if (error) {
                    onNext(undefined);
                    SLog.log(LogType.Error, "getUserByPhoneNumber", "", error);
                    return;
                } else {
                    const user: User | undefined = result && result[0] || undefined;
                    SLog.log(LogType.Info, "getUserByPhoneNumber", "", user);
                    onNext(user);
                }
            });
        });
    }

    public static checkUserPassword(userId: string, password: string, onNext: (result: boolean) => void) {
        const sql = "SELECT password FROM users WHERE id = ?";

        SMySQL.getConnection(connection => {
            connection?.execute<any>(sql, [userId ?? -1], (error, result) => {
                if (error) {
                    SLog.log(LogType.Error, "checkUserPassword", "", error);
                    onNext(false);
                    return;
                } else {
                    const userPassword: string = result && result[0] || "";
                    const flag = /*SEncrypt.decrypt(userPassword, "")*/ userPassword === password;
                    SLog.log(LogType.Warning, "checkUserPassword", "", flag);
                    onNext(flag);
                }
            });
        });
    }

    public static storeUser(user: User, onNext: (result: boolean) => void) {
        const sql = "INSERT INTO `users`(`id`, `full_name`, `email`, `phone_number`, `password`, `token`, `avatar_id`, `role_id`, `created_at`) VALUES (?,?,?,?,?,?,?,?,?)";

        SMySQL.getConnection(connection => {
            connection?.execute<any>(sql, [
                user.id,
                user.full_name,
                user.email,
                user.phone_number,
                /*SEncrypt.encrypt(user.password, "")*/ user.password,
                v4(),
                user.avatar?.id ?? 1,
                RoleList.USER_ROLE,
                new Date().getTime()
            ], (error, result) => {
                if (error) {
                    onNext(false);
                    SLog.log(LogType.Error, "storeUser", "failed to execute", error);
                    return;
                }

                if (user.information) {
                    SInformation.storeInformation(user.id, user.information, () => {
                        //update into firebase
                        SFirebase.push(FirebaseNode.USER, user.id, () => {
                            SLog.log(LogType.Info, "storeUser", "store user successfully");
                            onNext(true);
                        });
                    });
                } else {
                    SFirebase.push(FirebaseNode.USER, user.id, () => {
                        SLog.log(LogType.Info, "storeUser", "store user successfully");
                        onNext(true);
                    });
                }
            });
        });
    }

    public static updateUserInfo(user: User, onNext: (result: boolean) => void) {
        let sql = "UPDATE `users` SET ";
        const params = [];

        if (user.full_name) {
            sql += "`full_name` = ?,";
            params.push(user.full_name)
        }

        if (user.email) {
            sql += "`email` = ?,";
            params.push(user.email)
        }

        if (user.phone_number) {
            sql += "`phone_number` = ?,";
            params.push(user.phone_number)
        }

        if (user.password) {
            sql += "`password` = ?,";
            params.push(user.password)
        }

        if (user.token) {
            sql += "`token` = ?,";
            params.push(user.token)
        }

        if (user.role?.id) {
            sql += "`role_id` = ?,";
            params.push(user.role?.id);
        }

        if (user.avatar?.id) {
            sql += "`avatar_id` = ?,";
            params.push(user.avatar?.id);
        }

        sql += "`updated_at` = ? WHERE id = ?";

        SMySQL.getConnection(connection => {
            connection?.execute<any>(sql, [
                ...params,
                new Date().getTime(),
                user.id,
            ], (error, result) => {
                if (error) {
                    onNext(false);
                    SLog.log(LogType.Error, "updateUser", "failed to execute", error);
                    return;
                }

                //update into firebase
                SFirebase.push(FirebaseNode.USER, user.id, () => {
                    SLog.log(LogType.Info, "updateUser", "update user successfully");
                    onNext(true);
                });
            });
        });
    }

    public static softDeleteUser(id: string, onNext: (result: boolean) => void) {
        SPermission.removePermissionsOfUser(id, (result) => {
            if (!result) {
                SLog.log(LogType.Error, "softDeleteUser", "failed to remove permissions");
                onNext(false);
                return;
            }

            SLog.log(LogType.Info, "softDeleteUser", "success to remove permissions");
            onNext(true);
        });
    }
}