import Lesson from "./Lesson";
import User from "./User";

export default class Attendance {
    public id: number;
    public lesson: Lesson | undefined;
    public user: User | undefined;
    public user_paid: boolean;
    public tutor_accept_paid: boolean;
    public user_attended: boolean;
    public tutor_accept_attended: boolean;
    public attended_at: number;

    constructor(id = -1, lesson: Lesson | undefined = undefined, user: User | undefined = undefined, userPaid = false, tutorAcceptPaid: false, userAttended = false, tutorAcceptAttended = false, attendedAt = new Date()) {
        this.id = id;
        this.lesson = lesson;
        this.user = user;
        this.user_paid = userPaid;
        this.tutor_accept_paid = tutorAcceptPaid;
        this.user_attended = userAttended;
        this.tutor_accept_attended = tutorAcceptAttended;
        this.attended_at = attendedAt.getTime();
    }

    ["constructor"]: { name: "RowDataPacket"; };
}