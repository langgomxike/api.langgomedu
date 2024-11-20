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
        const userId = request.params.user_id;
        console.log("getStudentsBelongToUser");
        
        SStudent.getStudentByUserId(userId, (students) => {
            SResponse.getResponse(ResponseStatus.OK, students, "get student by user id", response);
        });
    }

    public static getStudentsInClass(request: express.Request, response: express.Response) {
        console.log("getStudentsInClass");
        const classId = Number(request.params.class_id);
        SStudent.getStudentsInClass(classId, (students) => {
            SResponse.getResponse(ResponseStatus.OK, students, "get student in class", response);
        });
    }

    public static createStudent(request: express.Request, response: express.Response) {

    }

    public static updateStudent(request: express.Request, response: express.Response) {

    }

    public static deleteStudent(request: express.Request, response: express.Response) {
        
    }
}