
export default class File {
    public id: number;
    public name: string;
    public path: string;
    public capacity: number;
    public image_width: number;
    public image_height: number;
    public created_at: number;
    public updated_at: number;

    constructor(id = -1, name = "", path = "", capacity = 0, image_width = 0, image_height = 0, created_at = new Date().getTime(), updated_at = new Date().getTime()) {
        this.id = id;
        this.name = name;
        this.path = path;
        this.capacity = capacity;
        this.image_width = image_width;
        this.image_height = image_height;
        this.created_at = created_at;
        this.updated_at = updated_at;
    }
}