import Lesson from "./Lesson";
import User from "./User";

export default class Attendance {
    public id: number;
    public lesson: Lesson | undefined;
    public user: User | undefined;
    public attended: boolean;
    public attended_at: number;
    public paid: boolean;
    public paid_at: number;
    public confirm_paid: boolean;
    public confirm_paid_at: number;
    public payment_path: string;
    public type: string;
    public deferred: boolean;


    constructor(id = 0,lesson: Lesson|undefined, user: User| undefined, attended = false, attended_at = 0, paid = false, paid_at = 0, confirm_paid = false, confirm_paid_at = 0, payment_path = "", type = "", deferred = false){
        this.id = id
        this.lesson = lesson
        this.user = user
        this.attended = attended
        this.attended_at = attended_at
        this.paid = paid
        this.paid_at = paid_at
        this.confirm_paid = confirm_paid
        this.confirm_paid_at = confirm_paid_at
        this.payment_path = payment_path
        this.type = type
        this.deferred = deferred
    }
}