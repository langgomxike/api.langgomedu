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

    public static getTutorSchedule(user_id: string, onNext: (lesson: Lesson[]) => void) {
        let sql = `SELECT JSON_OBJECT(
                        'id',l.id,
                        'class',JSON_OBJECT(
                            'id', c.id,
                            'title', c.title,
                            'description', c.description,
                            'major', JSON_OBJECT(
                                'id', m.id,
                                'icon', JSON_OBJECT(
                                    'id', mf.id,
                                    'name', mf.name,
                                    'path', mf.path,
                                    'capacity', mf.capacity,
                                    'image_width', mf.image_with,
                                    'image_height', mf.image_height
                                ),
                                'vn_name', m.vn_name,
                                'en_name', m.en_name,
                                'ja_name', m.ja_name
                            ),
                            'tutor', JSON_OBJECT(
                                'id', tutor.id,
                                'full_name', tutor.full_name
                            ),
                            'class_level', JSON_OBJECT(
                                'id', cl.id,
                                'vn_name', cl.vn_name,
                                'en_name', cl.en_name,
                                'ja_name', cl.ja_name
                            ),
                            'started_at', c.started_at,
                            'ended_at', c.ended_at
                        ),
                        'day', l.day,
                        'started_at', l.started_at,
                        'duration', l.duration,
                        'is_online', l.is_online,
                        'note', l.note
                    ) AS lesson
                FROM lessons l
                JOIN classes c ON c.id = l.class_id
                JOIN majors m ON m.id = c.major_id
                JOIN files mf ON mf.id = m.icon_id
                JOIN users tutor ON tutor.id = c.tutor_id
                JOIN class_levels cl ON cl.id = c.class_level_id
            WHERE c.tutor_id = ?
            GROUP BY l.id, c.id, m.id, mf.id, tutor.id, cl.id;`;

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
    public static getLearnerSchedule(student_id: string, onNext:(Lesson: Lesson[]) => void){
        let sql = `SELECT JSON_OBJECT(
                        'id',l.id,
                        'class',JSON_OBJECT(
                            'id', c.id,
                            'title', c.title,
                            'description', c.description,
                            'major', JSON_OBJECT(
                                'id', m.id,
                                'icon', JSON_OBJECT(
                                    'id', mf.id,
                                    'name', mf.name,
                                    'path', mf.path,
                                    'capacity', mf.capacity,
                                    'image_width', mf.image_with,
                                    'image_height', mf.image_height
                                ),
                                'vn_name', m.vn_name,
                                'en_name', m.en_name,
                                'ja_name', m.ja_name
                            ),
                            'tutor', JSON_OBJECT(
                                'id', tutor.id,
                                'full_name', tutor.full_name
                            ),
                            'class_level', JSON_OBJECT(
                                'id', cl.id,
                                'vn_name', cl.vn_name,
                                'en_name', cl.en_name,
                                'ja_name', cl.ja_name
                            ),
                            'started_at', c.started_at,
                            'ended_at', c.ended_at
                        ),
                        'day', l.day,
                        'started_at', l.started_at,
                        'duration', l.duration,
                        'is_online', l.is_online,
                        'note', l.note
                    ) AS lesson
                FROM
                    lessons l
                JOIN in_class_students ics ON ics.class_id = l.class_id
                JOIN classes c ON c.id = l.class_id
                JOIN majors m ON m.id = c.major_id
                JOIN files mf ON mf.id = m.icon_id
                JOIN users tutor ON tutor.id = c.tutor_id
                JOIN class_levels cl ON cl.id = c.class_level_id
            WHERE ics.student_id = ?`;

        SLog.log(LogType.Info, "get student schedule", "student schedule", student_id)
        SMySQL.getConnection(connection=> {
            connection?.query<any[]>(sql, [student_id], (err, results)=> {
                if(err){
                    SLog.log(LogType.Info, "get student schedule", "can't not get student schedule")
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

    public static getUserSchedule(user_id: string, onNext:(lessons: Lesson[])=> void){
        let sql = `SELECT JSON_OBJECT(
                        'id',l.id,
                        'class',JSON_OBJECT(
                            'id', c.id,
                            'title', c.title,
                            'description', c.description,
                            'major', JSON_OBJECT(
                                'id', m.id,
                                'icon', JSON_OBJECT(
                                    'id', mf.id,
                                    'name', mf.name,
                                    'path', mf.path,
                                    'capacity', mf.capacity,
                                    'image_width', mf.image_with,
                                    'image_height', mf.image_height
                                ),
                                'vn_name', m.vn_name,
                                'en_name', m.en_name,
                                'ja_name', m.ja_name
                            ),
                            'tutor', JSON_OBJECT(
                                'id', tutor.id,
                                'full_name', tutor.full_name
                            ),
                            'class_level', JSON_OBJECT(
                                'id', cl.id,
                                'vn_name', cl.vn_name,
                                'en_name', cl.en_name,
                                'ja_name', cl.ja_name
                            ),
                            'started_at', c.started_at,
                            'ended_at', c.ended_at
                        ),
                        'day', l.day,
                        'started_at', l.started_at,
                        'duration', l.duration,
                        'is_online', l.is_online,
                        'note', l.note
                    ) AS lesson
                FROM
                    lessons l
                JOIN classes c ON c.id = l.class_id
                JOIN majors m ON m.id = c.major_id
                JOIN files mf ON mf.id = m.icon_id
                JOIN users tutor ON tutor.id = c.tutor_id
                JOIN class_levels cl ON cl.id = c.class_level_id
                JOIN in_class_members icm ON icm.class_id = c.id
            WHERE icm.user_id = ?
            GROUP BY l.id, c.id, m.id, mf.id, tutor.id, cl.id;`
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

}