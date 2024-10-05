import Class from "./Class";
import User from "./User";

export default class InClassFile {
    public class: Class | undefined;
    public user: User | undefined;

    constructor(_class: Class | undefined = undefined, user: User | undefined = undefined) {
        this.class = _class;
        this.user = user;
    }
}