
import Class from '../../models/Class';
import Lesson from '../../models/Lesson';
import User from '../../models/User';
import SMySQL from '../SMySQL';
export default class SClassAdmin {
    public static getAllClasses(onNext: (classes: Class[]) => void) {
        const sql = `
        SELECT
    JSON_OBJECT(
        'id', classes.id,
        'title', classes.title,
        'description', classes.description,
        'price', classes.price,
        'class_creation_fee', classes.class_creation_fee,
        'max_learners', classes.max_learners,
        'started_at', classes.started_at,
        'ended_at', classes.ended_at,
        'created_at', classes.created_at,
        'updated_at', classes.updated_at,
        'address', JSON_OBJECT (
                        "id", addresses.id,
                        "province", addresses.province,
                        "district", addresses.district,
                        "ward", addresses.ward,
                        "detail", addresses.detail
                    ),
        'major', JSON_OBJECT(
                    'id', majors.id,
                    'vn_name', majors.vn_name,
                    'en_name', majors.en_name,
                    'ja_name', majors.ja_name,
                    'icon', majors.icon
                    ),
        'author', JSON_OBJECT(
                'id', author.id,
                'full_name', author.full_name,
                'email', author.email,
                'phone_number', author.phone_number,
                'avatar', tutor.avatar
            ),
        'tutor', JSON_OBJECT(
                'id', tutor.id,
                'full_name', tutor.full_name,
                'email', tutor.email,
                'phone_number', tutor.phone_number,
                'avatar', tutor.avatar
            ),
         'class_level', JSON_OBJECT(
                'id', class_levels.id,
                'vn_name', class_levels.vn_name,
                'en_name', class_levels.en_name,
                'ja_name', class_levels.ja_name
            	),
        'is_reported', CASE 
                WHEN reports.class_id IS NOT NULL THEN true 
                ELSE false 
            END
        ) AS class
        FROM
            classes
        LEFT JOIN users AS author ON author.id = classes.author_id
        LEFT JOIN users AS tutor ON tutor.id = classes.tutor_id
        LEFT JOIN majors ON majors.id = classes.major_id
        LEFT JOIN class_levels ON class_levels.id = classes.class_level_id
        LEFT JOIN addresses ON addresses.id = classes.address_id
        LEFT JOIN reports ON reports.class_id = classes.id
        `;

        SMySQL.getConnection((connection) => {
           connection?.execute<any[]>(sql, (err, results) => {
                if (err) {
                    console.log("getAllClasses", err);
                    
                    onNext([]);
                    return;
                }

                const classes:Class[] = [];
                

                results.forEach((result) => {
                    const _class = result.class;
                    _class.is_reported = result.class.is_reported === 1 ? true : false;
                    classes.push(_class);
                });
                
                onNext(classes);
            });
        });
    }

    public static getClassById(class_id: number, onNext: (lessons: Lesson[], users: User[]) => void) {
        const sql = `
       SELECT
        (
            SELECT JSON_ARRAYAGG(
                JSON_OBJECT(
                    'id', l.id,
                    'day', l.day,
                    'started_at', l.started_at,
                    'duration', l.duration,
                    'is_online', l.is_online,
                    'note', l.note
                )
            )
            FROM lessons l
            WHERE l.class_id = classes.id
        ) AS lessons,

        (
            SELECT JSON_ARRAYAGG(
                JSON_OBJECT(
                    'id', users.id,
                    'full_name', users.full_name,
                    'students', (
                        SELECT JSON_ARRAYAGG(
                            JSON_OBJECT(
                                'id', s.id,
                                'full_name', s.full_name
                            )
                        )
                        FROM students s
                        LEFT JOIN in_class_students ics ON ics.student_id = s.id
                        WHERE s.user_id = users.id AND ics.class_id = classes.id
                    )
                )
            ) 
            FROM in_class_members icm
            LEFT JOIN users ON users.id = icm.user_id
            WHERE icm.class_id = classes.id
        ) AS users

    FROM classes
    WHERE classes.id = ?;
        `;

        SMySQL.getConnection((connection) => {
           connection?.execute<any>(sql, [class_id] ,(err, results) => {
                if (err) {
                    onNext([], []);
                    return;
                }
                
                const lessons = results[0].lessons
                const users = results[0].users
                
                onNext(lessons, users);
            });
        });
    }
}