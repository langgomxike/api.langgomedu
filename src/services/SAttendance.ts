import Attendance from './../models/Attendance';
export default class SAttendance {
    public static getAttendanceHistoriesInClass(classId: number, onNext: (attendances: Attendance[]) => void) { }

    public static getAttendance(id: number, onNext: (attendance: Attendance | undefined) => void) { }

    public static storeAttendance(attendance: Attendance, onNext: (id: number | undefined) => void) { }

    public static updateAttendance(id: number, onNext: (result: boolean) => void) { }
}