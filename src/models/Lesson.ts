import Class from "./Class";

export default class Lesson {
    public id: number;
    public class: Class | undefined;
    public day: number; //[note: "thứ, monday: 0, ..."]
    public started_at: number;
    public duration: number;
    public is_online: boolean;  //[note: "hình thức học, online: 1, offline: 0"]
    public note: string;

    constructor(id = -1, _class: Class | undefined = undefined, day = 0, started_at = 0, duration = 0, is_online = false, note = "") {
        this.id = id;
        this.class = _class;
        this.day = day;
        this.started_at = started_at;
        this.duration = duration;
        this.is_online = is_online;
        this.note = note;
    }
}