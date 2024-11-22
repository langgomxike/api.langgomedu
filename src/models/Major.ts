import File from "./../models/File";
export default class Major {
    public id: number;
    public vn_name: string;
    public ja_name: string;
    public en_name: string;
    public icon: string;

    constructor(id: -1, vn_name: "", ja_name: "", en_name: "", icon: ""){
        this.id = id;
        this.vn_name = vn_name;
        this.ja_name = ja_name;
        this.en_name = en_name;
        this.icon = icon;
    };
}

export const majorJson = (asName: string): string => {
    return `JSON_OBJECT(
    'id', ${asName}.id,
    'vn_name', ${asName}.vn_name,
    'en_name', ${asName}.en_name,
    'ja_name', ${asName}.ja_name,
    'icon', ${asName}.icon
)`;
}