import express from "express";
import SStudent from "../services/SStudent";
import SResponse, { ResponseStatus } from "../services/SResponse";

export default class StudentController {

    public static getAllStudents(request: express.Request, response: express.Response) {
        SStudent.getAllStudents((cvs)=>{
            SResponse.getResponse(ResponseStatus.OK, cvs, "get All Students", response);
            return;
        })
    }
    public static getStudentsBelongToUser(request: express.Request, response: express.Response) {

    }

    public static getStudentsInClass(request: express.Request, response: express.Response) {

    }

    public static createStudent(request: express.Request, response: express.Response) {

    }

    public static updateStudent(request: express.Request, response: express.Response) {

    }

    public static deleteStudent(request: express.Request, response: express.Response) {
        
    }
}