import Message from "./Message";
import Class from "./Class";

export default class ClassInbox {
    in_class: Class | undefined;
    newest_message: Message | undefined;

    constructor(_class: Class | undefined = undefined, newest_message: Message | undefined = undefined) {
        this.in_class = _class;
        this.newest_message = newest_message;
    }
}