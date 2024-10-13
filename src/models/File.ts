
export default class File {
    public id: number;
    public name: string;
    public path: string;
    public capacity: number;
    public imageWidth: number;
    public imageHeight: number;
    public createdAt: Date;
    public updatedAt: Date;

    constructor(id = -1, name = "", path = "", capacity = 0, imageWidth = 0, imageHeight = 0, createdAt = new Date(), updatedAt = new Date()) {
        this.id = id;
        this.name = name;
        this.path = path;
        this.capacity = capacity;
        this.imageWidth = imageWidth;
        this.imageHeight = imageHeight;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
}