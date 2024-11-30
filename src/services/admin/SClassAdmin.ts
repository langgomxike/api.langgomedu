
import Class from '../../models/Class';
import Lesson from '../../models/Lesson';
import Pagination from '../../models/Pagination';
import User from '../../models/User';
import SMySQL from '../SMySQL';
import mysql from "mysql2";

const classJsonSql = `
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
                'avatar', author.avatar
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
`
export default class SClassAdmin {
    public static getAllClasses(search, action, page, perPage, onNext: (classes: Class[], pagination: Pagination) => void) {
        const TAB = {
            ALL: "all",
            PENDING_APPROVAL: "pendingApproval",
            PENDING_PAY: "pendingPay",
            REPORTED: "reported",
          };
    
          let additionalCondition = "";
        // Điều kiện tìm kiếm tùy thuộc vào `userType`
        switch (action) {
            case TAB.REPORTED : {
                additionalCondition = "AND reports.class_id IS NOT NULL";
                break;
            }
            case TAB.PENDING_APPROVAL : {
                additionalCondition = "AND classes.admin_accepted = 0";
                break;
            }
            case TAB.PENDING_PAY : {
                additionalCondition = "AND classes.admin_accepted != 0 AND classes.paid != 0";
                break;
            }
            default: {
                break;
            }
        }
        
        const searchCondition = search !== undefined
        ? `CONCAT(
            classes.title, ' ',
            majors.vn_name, ' ', majors.en_name, ' ', majors.ja_name, ' ',
            class_levels.vn_name, ' ', class_levels.en_name, ' ', class_levels.ja_name, ' ',
            addresses.province, ' ', addresses.district, ' ', addresses.ward, ' ', addresses.detail
        ) LIKE CONCAT('%', ?, '%')`
        : "1=1";

        const sql = `
        SELECT
        ${classJsonSql}
        FROM
            classes
        LEFT JOIN users AS author ON author.id = classes.author_id
        LEFT JOIN users AS tutor ON tutor.id = classes.tutor_id
        LEFT JOIN majors ON majors.id = classes.major_id
        LEFT JOIN class_levels ON class_levels.id = classes.class_level_id
        LEFT JOIN addresses ON addresses.id = classes.address_id
        LEFT JOIN reports ON reports.class_id = classes.id
        WHERE ${searchCondition} ${additionalCondition} 
        `;

        const countSQL = ` 
        SELECT
        COUNT(classes.id) AS total
        FROM
            classes
        LEFT JOIN users AS author ON author.id = classes.author_id
        LEFT JOIN users AS tutor ON tutor.id = classes.tutor_id
        LEFT JOIN majors ON majors.id = classes.major_id
        LEFT JOIN class_levels ON class_levels.id = classes.class_level_id
        LEFT JOIN addresses ON addresses.id = classes.address_id
        LEFT JOIN reports ON reports.class_id = classes.id
        WHERE ${searchCondition} ${additionalCondition} 
        `;

        const params = search !== undefined ?  [search] : [];

        console.log(mysql.format(sql, params));
        

        SMySQL.getConnection((connection) => {
           connection?.execute<any[]>(sql, params ,(err, results) => {
                if (err) {
                    console.log("getAllClasses", err);
                    
                    onNext([], new Pagination);
                    return;
                }
                const classes:Class[] = [];

                results.forEach((result) => {
                    const _class = result.class;
                    _class.is_reported = result.class.is_reported === 1 ? true : false;
                    classes.push(_class);
                });

                connection.execute(countSQL, params, (err, countResults) => {
                    if (err) {
                      console.log("get total", err);
                      onNext([], new Pagination);
                      return;
                    }
                    const total = countResults[0].total;
                    const pagination: Pagination = {
                      page: page,
                      per_page: perPage,
                      total_pages: Math.ceil(total / perPage),
                      total_items: total,
                    };
          
                    onNext(classes, pagination);
                  });
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
            FROM (
                SELECT *
                FROM lessons 
                WHERE lessons.class_id = classes.id
                GROUP BY day
                ORDER BY day ASC
            ) l
        ) AS lessons,

            (
                SELECT JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'id', users.id,
                        'full_name', users.full_name,
                        'avatar',users.avatar
                    )
                ) 
                FROM class_members cm
                LEFT JOIN users ON users.id = cm.user_id
                WHERE cm.class_id = classes.id
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