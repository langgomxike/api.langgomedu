
export default class Role {
    public id: number;
    public role: string;

    constructor(id = -1, role = "") {
        this.id = id;
        this.role = role;
    }
}