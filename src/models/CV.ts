import { Alias } from "typeorm/query-builder/Alias.js";
import { createSubquery } from "../configs/knex";
import Certificate, { certificatesSubquery } from "./Certificate";
import Education, { educationsSubquery } from "./Education";
import Experience, { experiencesSubquery } from "./Experience";
import User, { userForCVJSON, userJson, userJsonwithoutName } from "./User";

export default class CV {
    public user: User | undefined;
    public biography: string;
    public title: string;
    public approved_at: number;
    public updated_at: number;
    public certificates: Certificate[];
    public educations: Education[];
    public experiences: Experience[];

    constructor(
        user: User | undefined = undefined,
        biography = "",
        title = "",
        approved_at: number = 0,
        updated_at: number = 0,
        certificates: Certificate[] = [],
        educations: Education[] = [],
        experiences: Experience[] = []
    ) {
        this.user = user;
        this.biography = biography;
        this.title = title;
        this.approved_at = approved_at;
        this.updated_at = updated_at;
        this.certificates = certificates;
        this.educations = educations;
        this.experiences = experiences;
    }
}

export const cvJson = (asName: string): string => {
    return `JSON_OBJECT(
    'user', ${userJsonwithoutName('user', 'address', 'gender')},
    'biography', ${asName}.biography,
    'title', ${asName}.title,
    'certificates', (${certificatesSubquery}), 
    'educations', (${educationsSubquery}),
    'experiences', (${experiencesSubquery}),
    'approve_at', ${asName}.approved_at,
    'updated_at', ${asName}.updated_at 
) as cv `;
}

export const cvJson2 = (alias: string, userAlias: string, addressAlias: string, genderAlias: string, classLevelAlias: string, majorAlias:string): string => {
    return `JSON_OBJECT(
        'id', ${alias}.id,
        'user', ${userForCVJSON(userAlias, addressAlias, genderAlias, )},
        'biography', ${alias}.biography,
        'title', ${alias}.title,
        'certificates', (${certificatesSubquery}), 
        'educations', (${educationsSubquery}),
        'experiences', (${experiencesSubquery}),
        'approve_at', ${alias}.approved_at,
        'updated_at', ${alias}.updated_at 
    ) as cv `;
}

export const cvTempJson = (alias: string, userAlias: string, addressAlias: string, genderAlias: string, classLevelAlias: string, majorAlias: string) : string => {
    return `JSON_OBJECT(
        'id', ${alias}.id,
        'user', ${userForCVJSON(userAlias, addressAlias, genderAlias, )},
        'biography', ${alias}.biography,
        'title', ${alias}.title,
        'certificates', (${certificatesSubquery}), 
        'educations', (${educationsSubquery}),
        'experiences', (${experiencesSubquery}),
        'approve_at', ${alias}.approved_at,
        'updated_at', ${alias}.updated_at 
    ) as cv `;
}