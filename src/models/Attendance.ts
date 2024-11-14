import AttendancePayment from "./AttendancePayment";
import Lesson from "./Lesson";
import Student from "./Student";
import User from "./User";

export default class Attendance {
    public id: number;
    public lesson: Lesson | undefined;
    public user: User | undefined;
    public students: Student[] | undefined;
    public attended: boolean;
    public confirm_attendance: boolean;
    public attended_at: number;
    public confirmed_at: number;

    public attendance_payment: AttendancePayment | undefined;


    constructor(id = -1, lesson: Lesson | undefined = undefined, user: User | undefined = undefined, students: Student[] | undefined = undefined ,attended = false, confirm_attendance: false, attended_at = 0, confirmed_at = 0,
        attendance_payment: AttendancePayment | undefined = undefined
    ) {
        this.id = id;
        this.lesson = lesson;
        this.user = user;
        this.students = students;
        this.attended = attended;
        this.confirm_attendance = confirm_attendance;
        this.attended_at = attended_at;
        this.confirmed_at = confirmed_at
        this.attendance_payment = attendance_payment;
    }
}