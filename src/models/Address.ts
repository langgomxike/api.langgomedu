import exp from "constants";


export default class Address {
    public id: number
    public province: string
    public district: string
    public ward: string
    public detail: string

    constructor(id = 0, province = "", district = "", ward = "", detail = "") {
        this.id = id
        this.province = province
        this.district = district
        this.ward = ward
        this.detail = detail
    }
}

export const addressJson = (asName) => {
    return `JSON_OBJECT(
    'id', ${asName}.id,
    'province', ${asName}.province,
    'district', ${asName}.district,
    'ward', ${asName}.ward,
    'detail', ${asName}.detail
)`
}