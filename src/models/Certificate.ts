import File from "../models/File";

export default class Certificate {
    public id: number;
    public name: string;
    public vnDesc: string;
    public jaDesc: string;
    public enDesc: string;
    public icon: File | undefined;

    constructor(id = -1, name = "", vnDesc = "", jaDesc = "", enDesc = "", icon: File | undefined = undefined) {
        this.id = id;
        this.name = name;
        this.vnDesc = vnDesc;
        this.jaDesc = jaDesc;
        this.enDesc = enDesc;
        this.icon = icon;
    }
}