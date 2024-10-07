import express, { Request } from "express";

export default class AttendanceController {

    public static getAttendanceHistories(request: express.Request, response: express.Response) {
        return response.send("getAttendanceHistories");
    }

    public static requestAttendance(request: express.Request, response: express.Response) {

    }

    public static acceptAttendance(request: express.Request, response: express.Response) {

    }

    public static getAttendance(request: express.Request, response: express.Response) {

    }
}