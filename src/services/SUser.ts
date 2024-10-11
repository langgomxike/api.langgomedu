import { QueryResult, RowDataPacket } from 'mysql2';
import User from './../models/User';
import SLog, { LogType } from './SLog';
import SMySQL from './SMySQL';
import SFile from './SFile';
import SRole from './SRole';

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
                            user.fullName = iUser.full_name;
                            user.email = iUser.email;
                            user.password = iUser.password;
                            user.token = iUser.token;
                            user.avatar = files.find(file => file.id === iUser.avatar_id);
                            user.role = roles.find(role => role.id === iUser.role_id);
                            user.createdAt = new Date(iUser.created_at);
                            user.updatedAt = new Date(iUser.updated_at);
                            users.push(user);
                        });

                        onNext(users);
                        // SLog.log(LogType.Info, "getAllUsers", "", { err: err, results: results });
                    });
                });
            });
        });
    }
}