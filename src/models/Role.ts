
export default class Role {
    public id: number;
    public name: string;

    constructor(id = -1, name = "") {
        this.id = id;
        this.name = name;
    }
}

export const roleJson = (asName: string): string => {
    return `JSON_OBJECT(
    'id', ${asName}.id,
    'name', ${asName}.name
)`;
}