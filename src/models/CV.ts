import User from "./User";

export default class CV {
    public user: User | undefined
    public biography: string;
    public title: string;

    constructor(user: User | undefined = undefined, biography = "", title = "") {
        this.user = user;
        this.biography = biography;
        this.title = title;
    }
}