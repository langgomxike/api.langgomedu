import Lesson from "../models/Lesson";
import SLog, { LogType } from "./SLog";
import SMySQL from "./SMySQL";


export default class SLesson {

    public static getAllLesson(onNext: (lessons: Lesson[]) => void) {
        let sql = `SELECT * FROM lessons`;

        SMySQL.getConnection(connection => {
            connection?.query<any[]>(sql, [], (err, result) => {
                if (err) {
                    SLog.log(LogType.Error, "get All lessons", "fail to fetch to database", err);
                    onNext([])
                }
                const lessons = result as Lesson[]

                onNext(lessons)
            })
        })
    }


    //lấy danh sách lớp dạy của gia sư
    public static getTutorSchedule(user_id: string, onNext: (lesson: Lesson[]) => void) {
        let sql = `SELECT JSON_OBJECT(
    'id', l.id, -- Thêm khóa 'id'
    'class', JSON_OBJECT( -- Đặt khóa 'class' cho JSON_OBJECT
        'id', c.id,
        'title', c.title,
        'description', c.description,
        'major', JSON_OBJECT( -- Đặt khóa 'major'
            'id', m.id,
            'vn_name', m.vn_name,
            'en_name', m.en_name,
            'ja_name', m.ja_name,
            'icon', m.icon
        ),
        'tutor', JSON_OBJECT( -- Đặt khóa 'tutor'
            'id', tutor.id,
            'full_name', tutor.full_name,
            'email', tutor.email,
            'phone_number', tutor.phone_number,
            'avatar', tutor.avatar,
            'gender', JSON_OBJECT( -- Đặt khóa 'gender'
                'id', g.id,
                'vn_name', g.vn_name,
                'en_name', g.en_name,
                'ja_name', g.ja_name
            )
        ),
        'started_at', c.started_at,
        'ended_at', c.ended_at,
        'created_at', c.created_at,
        'updated_at', c.updated_at
    ),
    'day', l.day,
    'started_at', l.started_at,
    'duration', l.duration,
    'is_online', l.is_online,
    'note', l.note
) AS lesson
FROM lessons l
LEFT JOIN classes c ON c.id = l.class_id
JOIN majors m ON m.id = c.major_id
JOIN users tutor ON tutor.id = c.tutor_id
JOIN addresses a ON a.id = c.address_id
JOIN genders g ON g.id = tutor.gender_id
JOIN class_levels cl ON cl.id = c.class_level_id 
WHERE c.tutor_id = ?
    ORDER BY class_id ASC;`;

        SMySQL.getConnection(connection=>{
            connection?.query<any[]>(sql, [user_id], (err, results)=> {
                if(err){
                    SLog.log(LogType.Error, "get Tutor schedule", "fail to get tutor schedule", err);
                    onNext([])
                }
                const lessons: Lesson[] = [];
                results.forEach(data => {
                    const lesson = data.lesson as Lesson;
                    lessons.push(lesson)
                });

                onNext(lessons);
            })
        })
    } //end func
    
    // lấy danh sách lớp học của người dùng
    public static getUserSchedule(user_id: string, onNext:(lessons: Lesson[])=> void){
        let sql = `SELECT JSON_OBJECT(
    'id', l.id, -- Thêm khóa 'id'
    'class', JSON_OBJECT( -- Đặt khóa 'class' cho JSON_OBJECT
        'id', c.id,
        'title', c.title,
        'description', c.description,
        'major', JSON_OBJECT( -- Đặt khóa 'major'
            'id', m.id,
            'vn_name', m.vn_name,
            'en_name', m.en_name,
            'ja_name', m.ja_name,
            'icon', m.icon
        ),
        'tutor', JSON_OBJECT( -- Đặt khóa 'tutor'
            'id', tutor.id,
            'full_name', tutor.full_name,
            'email', tutor.email,
            'phone_number', tutor.phone_number,
            'avatar', tutor.avatar,
            'gender', JSON_OBJECT( -- Đặt khóa 'gender'
                'id', g.id,
                'vn_name', g.vn_name,
                'en_name', g.en_name,
                'ja_name', g.ja_name
            )
        ),
        'started_at', c.started_at,
        'ended_at', c.ended_at,
        'created_at', c.created_at,
        'updated_at', c.updated_at
    ),
    'day', l.day,
    'started_at', l.started_at,
    'duration', l.duration,
    'is_online', l.is_online,
    'note', l.note
) AS lesson
FROM lessons l
LEFT JOIN classes c ON c.id = l.class_id
JOIN majors m ON m.id = c.major_id
JOIN users tutor ON tutor.id = c.tutor_id
JOIN addresses a ON a.id = c.address_id
JOIN genders g ON g.id = tutor.gender_id
JOIN class_levels cl ON cl.id = c.class_level_id 
WHERE c.tutor_id = ?
    ORDER BY class_id ASC;`
        SMySQL.getConnection(connection=>{
            connection?.query<any[]>(sql, [user_id], (err, results)=>{
                if(err){
                    SLog.log(LogType.Error, "get user schedule", "can't get user schedule", err);
                    onNext([])
                }

                const lessons: Lesson[] = [];
                results.forEach(data => {
                    const lesson = data.lesson as Lesson;
                    lessons.push(lesson)
                });

                onNext(lessons);
            })
        })
    }

    public static createLesson(){

    }

}
