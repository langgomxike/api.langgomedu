import Student from "../models/Student";
import SMySQL from "./SMySQL";

export default class SStudent {
    public static getStudentByUserId(userId: string, onNext: (students: Student[]) => void){
        const sql = `SELECT 
    JSON_OBJECT(
        'id', students.id,
        'full_name', students.full_name,
        'learning_capacity', students.learning_capacity,
        'note', students.note,
        'user_id', students.user_id,
        'gender', JSON_OBJECT(
            'id', genders.id,
            'vn_gender', genders.vn_gender,
            'ja_gender', genders.ja_gender,
            'en_gender', genders.en_gender
        )
    ) AS student
    FROM students
    LEFT JOIN genders ON students.gender_id = genders.id
    WHERE students.user_id = ?;
`;

        SMySQL.getConnection((connection) => {
            connection?.execute<any[]>(sql, [userId] ,(err, results) => {
                if (err) {
                    return;
                }

                const students:Student[] = [];

                results.forEach(result => {
                    const student = result.student;
                    students.push(student);
                });

                onNext(students);
            })

        })
    }

    public static getStudentsInClass(classId: string, onNext: (students: Student[]) => void){
        const sql = `SELECT 
            JSON_OBJECT(
                'id', students.id,
                'full_name', students.full_name,
                'learning_capacity', students.learning_capacity,
                'note', students.note,
                'user_id', students.user_id,
                'gender', JSON_OBJECT(
                    'id', genders.id,
                    'vn_gender', genders.vn_gender,
                    'ja_gender', genders.ja_gender,
                    'en_gender', genders.en_gender
                )
            ) AS student
            FROM students
            LEFT JOIN genders ON students.gender_id = genders.id
             LEFT JOIN in_class_students ics ON ics.student_id = students.id
            WHERE ics.class_id = ?;
        `;

        SMySQL.getConnection((connection) => {
            connection?.execute<any[]>(sql, [classId] ,(err, results) => {
                if (err) {
                    return;
                }

                const students:Student[] = [];

                results.forEach(result => {
                    const student = result.student;
                    students.push(student);
                });

                onNext(students);
            })

        })
    }
}