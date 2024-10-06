import { DTO } from "./DTO";
import File from "../models/File";

export default class FileDTO implements DTO {
    //properties
    public id: number;
    public name: string;
    public path: string;
    public capacity: number;
    public imageWith: number;
    public imageHeight: number;
    public createdAt: Date;
    public updatedAt: Date;

    //constructor
    constructor(id = -1, name = "", path = "", capacity = 0, imageWidth = 0, imageHeight = 0, createdAt = new Date(), updatedAt = new Date()) {
        this.id = id;
        this.name = name;
        this.path = path;
        this.capacity = capacity;
        this.imageWith = imageWidth;
        this.imageHeight = imageHeight;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    //methods
    public fromModel(file: File) {
        return new FileDTO(
            file.id,
            file.name,
            file.path,
            file.capacity,
            file.imageWith,
            file.imageHeight,
            file.createdAt,
            file.updatedAt
        )
    }
}