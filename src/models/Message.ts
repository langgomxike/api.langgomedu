import File from "./File";
import User from "./User";

export default class Message {
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


    constructor(id = -1, fromUser: User | undefined = undefined, toUser: User | undefined = undefined, content = "", file: File | undefined, isImage = false, createdAt = new Date(), replyToMessage: Message | undefined, fromUserStatus = true, toUserStatus = true, asRead = false) {
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

}