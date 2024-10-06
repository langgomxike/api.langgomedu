import { DTO } from "./DTO";
import Gender from "../models/Gender";

export default class GenderDTO implements DTO {
    //properties
    public id: number;
    public vnGender: string;
    public enGender: string;
    public jaGender: string;

    //constructor
    constructor(id = -1, vnGender = "", enGender = "", jaGender = "") {
        this.id = id;
        this.vnGender = vnGender;
        this.enGender = enGender;
        this.jaGender = jaGender;
    }
    //method 
    public fromModel(gender: Gender) {
        if (gender) {
            return new GenderDTO(
                gender.id,
                gender.vnGender,
                gender.jaGender,
                gender.enGender,
            )
        }
    }
}