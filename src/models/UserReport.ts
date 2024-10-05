import User from "./User";

export default class UserReport {
    public id: number;
    public fromUser: User | undefined;
    public toUser: User | undefined;
    public content: string;
    public createdAt: Date;

    constructor(id = -1, fromUser: User | undefined = undefined, toUser: User | undefined = undefined, content = "", createdAt = new Date()) {
        this.id = id;
        this.fromUser = fromUser;
        this.toUser = toUser;
        this.content = content;
        this.createdAt = createdAt;
    }
}