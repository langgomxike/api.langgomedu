import File from "./File";
import User from "./User";

export default class Message {
    public id: number;
    public from_user: User | undefined;
    public to_user: User | undefined;
    public content: string;
    public file: File | undefined;
    public is_image: boolean;
    public created_at: number;
    public reply_to_message: Message | undefined;
    public from_user_status: boolean;
    public to_user_status: boolean;
    public as_read: boolean;

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
        this.is_image = isImage;
        this.created_at = createdAt.getTime();
        this.file = file;
        this.from_user = fromUser;
        this.to_user = toUser;
        this.reply_to_message = replyToMessage;
        this.from_user_status = fromUserStatus;
        this.to_user_status = toUserStatus;
        this.as_read = asRead;
    }
}