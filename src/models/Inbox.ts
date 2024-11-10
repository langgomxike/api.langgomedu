import Message from "./Message";
import User from "./User";

export default class Inbox {
    user: User | undefined;
    message: Message | undefined;

    constructor(user: User | undefined = undefined, message: Message | undefined = undefined) {
        this.user = user;
        this.message = message;
    }
}