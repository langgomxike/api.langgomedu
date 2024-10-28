import Class from "./Class";
import Student from "./Student";

export default class InClassStudent {
    public class: Class | undefined;
    public student: Student | undefined;

    constructor(_class: Class | undefined = undefined, student: Student | undefined = undefined) {
        this.class = _class;
        this.student = student;
    }
}