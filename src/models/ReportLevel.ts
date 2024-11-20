import { LargeNumberLike } from "crypto";

export default class ReportLevel {
    public id: number;
    public name: string;
    public point: number;

    constructor(id: number, name: string, point: number) {
        this.id = id;
        this.name = name;
        this.point = point;
    }
}
