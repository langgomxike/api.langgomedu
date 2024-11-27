import Message from "./Message";
import User from "./User";

export default class Inbox {
    other_user_info: User | undefined;
    newest_message: Message | undefined;

    constructor(other_user_info: User | undefined = undefined, newest_message: Message | undefined = undefined) {
        this.other_user_info = other_user_info;
        this.newest_message = newest_message;
    }
}