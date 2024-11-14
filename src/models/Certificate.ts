import File from "../models/File";

export default class Certificate {
    public id: number;
    public name: string;
    public vn_desc: string;
    public ja_desc: string;
    public en_desc: string;
    public icon: File | undefined;

    constructor(id = -1, name = "", vnDesc = "", jaDesc = "", enDesc = "", icon: File | undefined = undefined) {
        this.id = id;
        this.name = name;
        this.vn_desc = vnDesc;
        this.ja_desc = jaDesc;
        this.en_desc = enDesc;
        this.icon = icon;
    }
}