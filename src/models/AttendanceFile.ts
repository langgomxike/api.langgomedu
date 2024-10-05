import Attendance from "./Attendance";
import File from "./File";

export default class AttendanceFile {
    public attendance: Attendance | undefined;
    public file: File | undefined;

    constructor(attendance: Attendance | undefined = undefined, file: File | undefined = undefined) {
        this.attendance = attendance;
        this.file = file;
    }
}