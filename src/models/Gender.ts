
export default class Gender {
    public id: number;
    public vnGender: string;
    public enGender: string;
    public jaGender: string;

    constructor(id = -1, vnGender = "", enGender = "", jaGender = "") {
        this.id = id;
        this.vnGender = vnGender;
        this.enGender = enGender;
        this.jaGender = jaGender;
    }
}