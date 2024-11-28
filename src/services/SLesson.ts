import Lesson, { lessonJson, scheduleJson } from "../models/Lesson";
import SLog, { LogType } from "./SLog";
import SMySQL from "./SMySQL";
import db from '../configs/knex';
import User, { simpleUserJson, userJson } from "../models/User";


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

    public static async getTutorSchedule2(tutor_id: string, onNext: (lesson: Lesson[])=> void){
        
        await db('lessons as l')
        .leftJoin('classes as c', 'c.id', 'l.class_id')
        .leftJoin('users as tutor', 'tutor.id', 'c.tutor_id')
        .leftJoin('majors as major', 'major.id', 'c.major_id')
        .leftJoin('class_levels', 'class_levels.id', 'c.class_level_id')
        .leftJoin('addresses as address', 'address.id', 'c.address_id')
        .leftJoin('addresses as tutor_address', 'tutor_address.id', 'tutor.address_id')
        .leftJoin('genders as tutor_gender', 'tutor_gender.id', 'tutor.gender_id')
        .select(db.raw(scheduleJson('l', 'c')))
        .where('c.tutor_id', tutor_id)
        .then((results)=>{
            const lessons : Lesson[] =[];
            results.forEach(result => {
                lessons.push(result.lesson)
            });
            onNext(lessons);
        }).catch((err)=> {
            SLog.log(LogType.Error, "Schedule", "getSchedulefortutor2", err);
        })
    }

    public static async getUserSchedule2(tutor_id: string, onNext: (lesson: Lesson[])=> void){
  
        await db('lessons as l')
        .leftJoin('classes as c', 'c.id', 'l.class_id')
        .leftJoin('users as tutor', 'tutor.id', 'c.tutor_id')
        .leftJoin('majors as major', 'major.id', 'c.major_id')
        .leftJoin('class_levels', 'class_levels.id', 'c.class_level_id')
        .leftJoin('addresses as address', 'address.id', 'c.address_id')
        .leftJoin('addresses as tutor_address', 'tutor_address.id', 'tutor.address_id')
        .leftJoin('genders as tutor_gender', 'tutor_gender.id', 'tutor.gender_id')
        .leftJoin('class_members as cm', 'cm.class_id', 'c.id')
        .select(db.raw(scheduleJson('l', 'c')))
        .where('cm.user_id', tutor_id)
        .then((results)=>{
            const lessons : Lesson[] =[];
            results.forEach(result => {
                lessons.push(result.lesson)
            });
            onNext(lessons);
            
        }).catch((err)=> {
            SLog.log(LogType.Error, "Schedule", "getSchedulefortutor2", err);
        })
    }

    public static async getUserParentandChildren(user_id, onNext: (users: any[])=> void){
        await db('users')
        .leftJoin('user_role as ur', 'ur.user_id', 'users.id')
        .join('roles', 'roles.id', 'ur.role_id')
        // .leftJoin('genders as gender', 'gender.id', 'users.gender_id')
        .select(db.raw(simpleUserJson('users', 'roles')))
        .where('users.id', user_id)
        .orWhere('parent_id', user_id)
        .groupBy('users.id')
        .then((results)=> {
            const users : any[] =[];
            results.forEach(result => {
                users.push(result.user)
            });
            // console.log(users);
            
            onNext(users);
          
        })
        .catch((err)=> {
          SLog.log(LogType.Error,"getUserParentandChildren", " can't get parent and children", err);
        })
      }


}
