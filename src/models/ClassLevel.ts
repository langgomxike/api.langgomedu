
export default class ClassLevel {
    public id: number;
    public vnName: string;
    public jpName: string;
    public enName: string;

    constructor(id = -1, vnName = "", jpName = "", enName = "") {
        this.id = id;
        this.vnName = vnName;
        this.jpName = jpName;
        this.enName = enName;
    }
}