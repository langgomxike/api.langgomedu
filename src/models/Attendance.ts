import Lesson from "./Lesson";
import User from "./User";

export default class Attendance {
    public id: number;
    public lesson: Lesson | undefined;
    public user: User | undefined;
    public userPaid: boolean;
    public tutorAcceptPaid: boolean;
    public userAttended: boolean;
    public tutorAcceptAttended: boolean;
    public attendedAt: Date;

    constructor(id = -1, lesson: Lesson | undefined = undefined, user: User | undefined = undefined, userPaid = false, tutorAcceptPaid: false, userAttended = false, tutorAcceptAttended = false, attendedAt = new Date()) {
        this.id = id;
        this.lesson = lesson;
        this.user = user;
        this.userPaid = userPaid;
        this.tutorAcceptPaid = tutorAcceptPaid;
        this.userAttended = userAttended;
        this.tutorAcceptAttended = tutorAcceptAttended;
        this.attendedAt = attendedAt;
    }
}