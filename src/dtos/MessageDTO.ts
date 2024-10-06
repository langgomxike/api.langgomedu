import { DTO } from "./DTO";
import File from "../models/File";
import User from "../models/User";
import Message from "../models/Message";

export default class MessageDTO implements DTO {
    //properties
    public id: number;
    public fromUser: User | undefined;
    public toUser: User | undefined;
    public content: string;
    public file: File | undefined;
    public isImage: boolean;
    public createdAt: Date;
    public replyToMessage: Message | undefined;
    public fromUserStatus: boolean;
    public toUserStatus: boolean;
    public asRead: boolean;

    //constructor
    constructor(
        id = -1, 
        fromUser: User | undefined = undefined, 
        toUser: User | undefined = undefined, 
        content = "", 
        file: File | undefined = undefined, 
        isImage = false, 
        createdAt = new Date(), 
        replyToMessage: Message | undefined = undefined, 
        fromUserStatus = true, 
        toUserStatus = true, 
        asRead = false
    ) {
        this.id = id;
        this.content = content;
        this.isImage = isImage;
        this.createdAt = createdAt;
        this.file = file;
        this.fromUser = fromUser;
        this.toUser = toUser;
        this.replyToMessage = replyToMessage;
        this.fromUserStatus = fromUserStatus;
        this.toUserStatus = toUserStatus;
        this.asRead = asRead;
    }

    //methods
    public fromModel(message: Message) {
        if(message){
            return new MessageDTO (
                message.id,
                message.fromUser,
                message.toUser,
                message.content,
                message.file,
                message.isImage,
                message.createdAt,
                message.replyToMessage,
                message.fromUserStatus,
                message.toUserStatus,
                message.asRead,
            )
        }
    }

}