
import Class from '../../models/Class';
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
        'address_1', classes.address_1,
        'address_2', classes.address_2,
        'address_3', classes.address_3,
        'address_4', classes.address_4,
        'major', JSON_OBJECT(
                    'id', majors.id,
                    'vn_name', majors.vn_name,
                    'en_name', majors.en_name,
                    'ja_name', majors.ja_name,
                    'icon', JSON_OBJECT('path', files_major.path)
                    ),
        'author', JSON_OBJECT(
                'id', author.id,
                'full_name', author.full_name,
                'email', author.email,
                'phone_number', author.phone_number,
                'avatar', JSON_OBJECT('path', files_author.path)
            ),
         'class_level', JSON_OBJECT(
                'id', class_levels.id,
                'vn_name', class_levels.vn_name,
                'en_name', class_levels.en_name,
                'ja_name', class_levels.ja_name
            	)
        ) AS class
        FROM
            classes
        LEFT JOIN users AS author ON author.id = classes.author_id
        LEFT JOIN majors ON majors.id = classes.major_id
        LEFT JOIN class_levels ON class_levels.id = classes.class_level_id
        LEFT JOIN files AS files_author ON files_author.id = author.avatar_id
        LEFT JOIN files AS files_major ON files_major.id = majors.icon_id;
        `;

        SMySQL.getConnection((connection) => {
           connection?.execute<any[]>(sql, (err, results) => {
                if (err) {
                    onNext([]);
                    return;
                }

                const classes:Class[] = [];
                

                results.forEach((result) => {
                    const _class = result.class;
                    // user.is_reported = result.user.is_reported === 1 ? true : false;
                    classes.push(_class);
                });
                
                onNext(classes);
            });
        });
    }

    public static getClassById(class_id: number, onNext: (_class: Class) => void) {
        const sql = `
       SELECT
    JSON_OBJECT(
        'lessons', (
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
        ),
        'students', (
            SELECT JSON_ARRAYAGG(
                JSON_OBJECT(
                    'fullname', COALESCE(students.full_name, users.full_name),
                    'id', COALESCE(students.id, users.id)
                )
            )
            FROM in_class_members icm
            LEFT JOIN users ON users.id = icm.user_id
            LEFT JOIN students ON students.user_id = users.id
            WHERE icm.class_id = classes.id
        )
    ) AS class
FROM classes
WHERE classes.id = ?;


        `;

        SMySQL.getConnection((connection) => {
           connection?.execute<any>(sql, [class_id] ,(err, result) => {
                if (err) {
                    onNext(new Class);
                    return;
                }

                const _class:Class = result ;
                
                
                onNext(_class);
            });
        });
    }
}