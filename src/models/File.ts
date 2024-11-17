
export default class File {
    public id: number;
    public name: string;
    public path: string;
    public ratio: number;
    public created_at: number;
    public updated_at: number;

    constructor(id = -1, name = "", path = "",ratio = 0, created_at = new Date().getTime(), updated_at = new Date().getTime()) {
        this.id = id;
        this.name = name;
        this.path = path;
        this.ratio = ratio;
        this.created_at = created_at;
        this.updated_at = updated_at;
    }
}