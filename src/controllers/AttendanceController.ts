import express, { Request } from "express";
import SAttendance from "../services/SAttendance";
import Attendance from "../models/Attendance";
import SResponse, { ResponseStatus } from "../services/SResponse";

export default class AttendanceController {

    public static getAttendanceHistories(request: express.Request, response: express.Response) {
        SAttendance.getAttendanceHistoriesInClass(1, (attendances) => {
            SResponse.getResponse(ResponseStatus.OK, attendances, "get attendances with the class id " + 1, response);
        });
    }

    public static requestAttendance(request: express.Request, response: express.Response) {
    }

    public static acceptAttendance(request: express.Request, response: express.Response) {

    }

    public static getAttendance(request: express.Request, response: express.Response) {
        SAttendance.getAttendance(6, (attendance: Attendance | undefined) => {
            SResponse.getResponse(ResponseStatus.OK, attendance, "get attendance with the id " + 6, response);
        });
    }
}