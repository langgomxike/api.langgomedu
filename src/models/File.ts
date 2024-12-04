
export default class File {
    public id: number;
    public name: string;
    public path: string;
    public ratio: number;
    public created_at: number;
    public updated_at: number;

    constructor(id = -1, name = "", path = "", ratio = 0, created_at = new Date().getTime(), updated_at = new Date().getTime()) {
        this.id = id;
        this.name = name;
        this.path = path;
        this.ratio = ratio;
        this.created_at = created_at;
        this.updated_at = updated_at;
    }
    public toInsertObject() {
        return {
            name: this.name,
            path: this.path,
            ratio: this.ratio,
            created_at: this.created_at,
            updated_at: this.updated_at,
        };
    }
}
export const fileJson = (asName: string): string => {
    return `JSON_OBJECT(
        'id', ${asName}.id,
        'name', ${asName}.name,
        'path', ${asName}.path,
        'ratio', ${asName}.ratio,
        'created_at', ${asName}.created_at,
        'updated_at', ${asName}.updated_at
    )`;
}