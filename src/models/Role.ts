
export default class Role {
    public id: number;
    public name: string;

    constructor(id = -1, name = "") {
        this.id = id;
        this.name = name;
    }
}