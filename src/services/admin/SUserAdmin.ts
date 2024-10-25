
import User from '../../models/User';
import SMySQL from '../SMySQL';
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
}