import Lesson from "../models/Lesson";
import SLog, { LogType } from "./SLog";
import SMySQL from "./SMySQL";

export default class SLesson {
    /**
     * viết thêm 1 api để lưu danh sách buổi học
     */

    /**
     * @param onNext
     */

    public static createLesson(newLesson: Lesson, onNext: (result: boolean, insertId?: number) => void) {
        const sql = "INSERT INTO lessons(class_id, day, started_at, duration, is_online) VALUES (?,?,?,?,?)";

        const values = [
            newLesson.day,
            newLesson.started_at,
            newLesson.duration,
            newLesson.is_online,
        ]

        SMySQL.getConnection(connection => {
            connection?.query(sql, values, (err, result) => {
                if (err) {
                    // Xử lý khi có lỗi
                    SLog.log(LogType.Error, 'addNewLesson', 'Failed to insert new class', err);
                    onNext(false,);
                }
                const insertId = (result as any).insertId || undefined;
                onNext(true, insertId);
            })
        })
    }
}