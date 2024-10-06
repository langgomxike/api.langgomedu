import { DTO } from "./DTO";
import Attendance from "../models/Attendance";
import File from "../models/File";

export default class AttendanceFileDTO {
    
    //properties
    public attendance: Attendance | undefined
    public file: File | undefined

    //constructor
    constructor(
        attendance: Attendance |undefined = undefined,
        file: File| undefined = undefined
    ){
        this.attendance = attendance
        this.file = file
    }
}