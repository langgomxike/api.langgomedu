import Role from './../models/Role';
export default class RoleDTO {
    public id: number;
    public role: string;

    constructor(id: number = -1, role: string = "") {
        this.id = id;
        this.role = role;
    }

    fromModel(role: Role): RoleDTO {
        return new RoleDTO(role.id, role.role);
    }
}