
export default class Permission {
    public id: number;
    public permission: string;

    constructor(id = -1, permission = "") {
        this.id = id;
        this.permission = permission;
    }
}