
export default class File {
    public id: number;
    public name: string;
    public path: string;
    public capacity: number;
    public image_width: number;
    public image_height: number;
    public createdAt: Date;
    public updatedAt: Date;

    constructor(id = -1, name = "", path = "", capacity = 0, image_width = 0, image_height = 0, createdAt = new Date(), updatedAt = new Date()) {
        this.id = id;
        this.name = name;
        this.path = path;
        this.capacity = capacity;
        this.image_width = image_width;
        this.image_height = image_height;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
}