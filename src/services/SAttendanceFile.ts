export default class SAttendanceFile {
    public static getAllFilesInAttendance(attendanceId: number, onNext: (files: File[]) => void) { }

    public static storeFilesInAttendance(attendanceId: number, files: File[], onNext: (stored: number) => void) { }

    public static deleteFilsInAttendance(attendanceId: number, files: File[], onNext: (deleted: number) => void) { }
}