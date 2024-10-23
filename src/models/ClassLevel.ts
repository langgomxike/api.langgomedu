
export default class ClassLevel {
    public id: number;
    public vn_name: string;
    public jp_name: string;
    public en_name: string;

    constructor(id = -1, vn_name = "", jp_name = "", en_name = "") {
        this.id = id;
        this.vn_name = vn_name;
        this.jp_name = jp_name;
        this.en_name = en_name;
    }
}