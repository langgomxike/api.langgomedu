import Lesson from '../models/Lesson';
import User from '../models/User';
import Attendance from './../models/Attendance';
import SLog, { LogType } from './SLog';
import SMySQL from './SMySQL';
export default class SAttendance {
    public static getAttendanceHistoriesInClass(classId: number, onNext: (attendances: Attendance[]) => void) {
        const sql = `SELECT *, attendances.id as id FROM attendances
                        INNER JOIN lessons 
                        ON attendances.lesson_id = lessons.id
                        INNER JOIN users 
                        ON attendances.user_id = users.id
                        WHERE attendances.class_id = ?`;

        SMySQL.getConnection(connection => {
            connection?.execute<any[]>(sql, [classId], (error, result) => {
                if (error) {
                    // SLog.log(LogType.Error, "getAttendanceHistoriesInClass", "get attendances error", error);
                    onNext([]);
                    return;
                }

                // SLog.log(LogType.Info, "getAttendanceHistoriesInClass", "get attendance", result);
                const attendances: Attendance[] = [];
                result.forEach(data => {
                    const attendance = new Attendance(data?.id, undefined, undefined, data?.user_paid, data?.tutor_accept_paid);
                    attendance.lesson = new Lesson(data?.lesson_id, undefined, data?.day);
                    attendance.user = new User(data?.user_id, data?.full_name);
                    attendances.push(attendance);
                });

                onNext(attendances);
            });
        })
    }

    public static getAttendance(id: number, onNext: (attendance: Attendance | undefined) => void) {
        const sql = `SELECT *, attendances.id as id FROM attendances 
                        INNER JOIN lessons 
                        ON attendances.lesson_id = lessons.id
                        WHERE attendances.id = ?`;

        SMySQL.getConnection(connection => {
            connection?.execute<any>(sql, [id], (error, data) => {
                if (error) {
                    // SLog.log(LogType.Error, "getAttendance", "get attendance error", error);
                    onNext(undefined);
                    return;
                }

                // SLog.log(LogType.Info, "getAttendance", "get attendance", data);
                const attendance = new Attendance(data?.id, undefined, undefined, data?.user_paid, data?.tutor_accept_paid);
                attendance.lesson = new Lesson(data?.lesson_id, undefined, data?.day);
                onNext(attendance);
            });
        });
    }

    public static storeAttendance(attendance: Attendance, onNext: (id: number | undefined) => void) { }

    public static updateAttendance(id: number, onNext: (result: boolean) => void) { }
}