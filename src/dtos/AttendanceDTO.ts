import { DTO } from "./DTO";
import Attendance from "../models/Attendance";
import Lesson from "../models/Lesson";
import User from "../models/User";

export default class AttendanceDTO implements DTO {
    //properties
    public id: number
    public lesson: Lesson |undefined
    public user: User |undefined
    public userPaid: boolean
    public tutorAcceptPaid: boolean
    public userAttended: boolean
    public tutorAcceptAttended: boolean
    public attendedAt: Date

    //constructor
    constructor(
        id = -1,
        lesion:Lesson|undefined = undefined,
        user: User|undefined = undefined,
        userPaid = false,
        tutorAcceptPaid = false,
        userAttended = false,
        tutorAcceptAttended = false,
        attendedAt = new Date()
    ){
        this.id = id
        this.lesson = lesion
        this.user = user
        this.userPaid = userPaid
        this.tutorAcceptPaid = tutorAcceptPaid
        this.userAttended = userAttended
        this.tutorAcceptAttended = tutorAcceptAttended
        this.attendedAt = attendedAt
    }
    public fromModel(attendance: Attendance) {
        if(attendance){
            const lesson = attendance.lesson instanceof Lesson ? attendance.lesson : undefined

            const user = attendance.user instanceof User ? attendance.user : undefined

            return new AttendanceDTO(
                attendance.id,
                lesson,
                user,
                attendance.userPaid,
                attendance.tutorAcceptPaid,
                attendance.userAttended,
                attendance.tutorAcceptAttended,
                attendance.attendedAt
            )
        }
    }
}