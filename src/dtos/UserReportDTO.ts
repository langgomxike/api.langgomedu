import { DTO } from "./DTO";
import UserReport from "../models/UserReport";
import User from "../models/User";

export default class UserReportDTO implements DTO {
    //properties
    public id: number;
    public fromUser: User | undefined;
    public toUser: User | undefined;
    public content: string;
    public createdAt: Date;

    //constructor
    constructor(
        id = -1, 
        fromUser: User | undefined = undefined, 
        toUser: User | undefined = undefined, 
        content = "", 
        createdAt = new Date()
    ) {
        this.id = id;
        this.fromUser = fromUser;
        this.toUser = toUser;
        this.content = content;
        this.createdAt = createdAt;
    }
    //methods
    public fromModel(userReport : UserReport) {
        if(userReport){
            return new UserReportDTO(
                userReport.id,
                userReport.fromUser,
                userReport.toUser,
                userReport.content,
                userReport.createdAt,
            )
        }
    }
    
}