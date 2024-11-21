
// import User from '../../entities/User';
import User, { userJson } from '../../models/User';
import SMySQL from '../SMySQL';
// import {AppDataSource} from "../../configs/dataSource";
import 'reflect-metadata';
// import knex from "knex";
import db from "../../configs/knex";



export default class SUserAdmin {
    public static getAllUsers(onNext: (users: User[]) => void) {
        const sql = `
        SELECT 
        JSON_OBJECT(
            'id', users.id,
            'full_name', users.full_name,
            'email', users.email,
            'phone_number', users.phone_number,
            'avatar', JSON_OBJECT(
                'id', files.id,
                'name', files.name,
                'path', files.path
            ),
            'information', JSON_OBJECT(
                'hometown', i.hometown,
                'address_1', i.address_1,
                'address_2', i.address_2,
                'address_3', i.address_3,
                'address_4', i.address_4,
                'birthday', i.birthday,
                'gender', JSON_OBJECT(
                    'id', genders.id,
                    'vn_gender',genders.vn_gender,
                    'en_gender', genders.en_gender, 
                    'ja_gender', genders.ja_gender
                ) ,
                'point', i.point,
                'banking_number', i.banking_number,
                'banking_code', i.banking_code
            ),
            'is_reported', CASE 
                WHEN user_reports.to_user_id IS NOT NULL THEN true 
                ELSE false 
            END
        ) AS user
        FROM users
        LEFT JOIN files ON files.id = users.avatar_id
        LEFT JOIN user_reports ON user_reports.to_user_id = users.id
        LEFT JOIN informations i ON i.user_id = users.id
        LEFT JOIN genders ON i.gender_id = genders.id;
        `;

        SMySQL.getConnection((connection) => {
           connection?.execute<any[]>(sql, (err, results) => {
                if (err) {
                    onNext([]);
                    return;
                }

                const users:User[] = [];

                results.forEach((result) => {
                    const user = result.user;
                    user.is_reported = result.user.is_reported === 1 ? true : false;
                    users.push(user);
                });
                
                onNext(users);
            });
        });
    }

    public static getAllReportUserOfUser(userId: number, onNext: (user: User[] | undefined) => void) {
        const sql = `
        SELECT 
        JSON_OBJECT(
            'id', from_user.id,
            'full_name', from_user.full_name,
            'email', from_user.email,
            'phone_number', from_user.phone_number,
            'avatar', (
                SELECT JSON_OBJECT(
                    'id', ffu.id,
                    'name', ffu.name,
                    'path', ffu.path
                )
                FROM files AS ffu
                WHERE ffu.id = from_user.avatar_id
            )
        ) as user
FROM user_reports AS ur 
LEFT JOIN users AS from_user ON from_user.id = ur.from_user_id
WHERE ur.to_user_id = 089204010902;
        `;

        SMySQL.getConnection((connection) => {
            connection?.execute<any[]>(sql, [userId] ,(err, results) => {
                 if (err) {
                     onNext([]);
                     return;
                 }
 
                 const users:User[] = [];
                //  console.log(">>> user_reports", JSON.stringify(results[0].user, null, 2));
                 
                 
 
                 results.forEach((result) => {
                     const user = result.user;
                     users.push(user);
                 });
                 
                 onNext(users);
             });
         });
    }

    public static async getAllUsers2(onNext: (users: User[])=> void) {
        const results = await db('users')
        .join('addresses as ad', 'ad.id', '=', 'users.address_id')
        .join('genders', 'genders.id', '=', 'users.gender_id')
        .select(db.raw(userJson('users', 'ad', 'genders')));
        
        onNext(results as User[])
    }
}

