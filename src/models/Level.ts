
export default class Level {
    public id: number;
    public name: string;
    public point: number;

    constructor(id: 0, name: '', point: 0){
        this.id = id;
        this.name = name;
        this.point = point
    }
}

export const levelJson = (asName: string): string => {
    return `JSON_OBJECT(
    'id', ${asName}.id,
    'name', ${asName}.name,
    'point', ${asName}.point
)`;
}