import { DTO } from "./DTO";
import Gender from "../models/Gender";
import User from "../models/User";
import Student from "../models/Student";

export default class StudentDTO implements DTO {
    //properties
    public id: number;
    public fullName: string;
    public learningCapacity: string;
    public gender: Gender | undefined;
    public note: string;
    public user: User | undefined;

    //constructor
    constructor(
        id = -1, 
        fullName = "", 
        learningCapacity = "", 
        gender: Gender | undefined = undefined, 
        note = "", 
        user: User | undefined = undefined
    ) {
        this.id = id;
        this.fullName = fullName;
        this.learningCapacity = learningCapacity;
        this.gender = gender;
        this.note = note;
        this.user = user;
    }

    //methods
    public fromModel(student: Student) {
        if(student){
            return new StudentDTO(
                student.id,
                student.fullName,
                student.learningCapacity,
                student.gender,
                student.note,
                student.user
            )
        }
    }
}