import db from "../configs/knex";

export default class ClassLevel {
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

export const classLevelJson = (asName: string): string => {
    return `JSON_OBJECT(
    'id', ${asName}.id,
    'vn_name', ${asName}.vn_name,
    'en_name', ${asName}.en_name,
    'ja_name', ${asName}.ja_name
)`;
}

export const ArrayClassLevelJson = (alias: string): string => {
    return `JSON_ARRAYAGG(
        JSON_OBJECT(
            'id', ${alias}.id,
            'vn_name', ${alias}.vn_name,
            'en_name', ${alias}.en_name,
            'ja_name', ${alias}.ja_name
        )
    )`
}

export const classLevelSubquery = (reference: string) => {
    return db('interested_class_levels as icl')
        .select(db.raw(ArrayClassLevelJson('cl')))
        .join('class_levels as cl', 'cl.id', 'icl.class_level_id')
        .where('icl.user_id', db.raw(`${reference}.id`))
        .as('classLevelSubquery')
}