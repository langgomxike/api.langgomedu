
export default class Gender {
    public id: number;
    public vn_name: string;
    public en_name: string;
    public ja_name: string;

    constructor(id = -1, vn_name = "", en_name = "", ja_name = "") {
        this.id = id;
        this.vn_name = vn_name;
        this.en_name = en_name;
        this.ja_name = ja_name;
    }
}
export const genderJson = (asName: string): string => {
    return `JSON_OBJECT(
        'id', ${asName}.id,
        'vn_name', ${asName}.vn_name,
        'en_name', ${asName}.en_name,
        'ja_name', ${asName}.ja_name
    )`;
}