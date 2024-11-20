import { createSubquery } from "../configs/knex";
import Certificate, { certificatesSubquery } from "./Certificate";
import Education, { educationsSubquery } from "./Education";
import Experience from "./Experience";
import User, { userJson, userJsonwithoutName } from "./User";

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
    'approve_at', ${asName}.approved_at,
    'updated_at', ${asName}.updated_at 
) as cv `;
}
