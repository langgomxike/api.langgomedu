import { DTO } from "./DTO";
import Lesson from "../models/Lesson";
import Class from "../models/Class";

export default class LessonDTO implements DTO {
    //properties
    public id: number;
    public class: Class | undefined;
    public day: number; //[note: "thứ, monday: 0, ..."]
    public startedAt: Date;
    public duration: Date;
    public isOnline: boolean;  //[note: "hình thức học, online: 1, offline: 0"]
    public note: string;

    //constructor
    constructor(
        id = -1, 
        _class: Class | undefined = undefined, 
        day = 0, startedAt = new Date(), 
        duration = new Date(), 
        isOnline = false, 
        note = ""
    ) {
        this.id = id;
        this.class = _class;
        this.day = day;
        this.startedAt = startedAt;
        this.duration = duration;
        this.isOnline = isOnline;
        this.note = note;
    }

    //methods
    public fromModel(lesson : Lesson) {
        if(lesson){
            return new LessonDTO(
                lesson.id,
                lesson.class,
                lesson.day,
                lesson.startedAt,
                lesson.duration,
                lesson.isOnline,
                lesson.note
            )
        }
    }
}