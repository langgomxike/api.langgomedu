import Certificate from "./Certificate";
import ClassLevel from "./ClassLevel";
import User from "./User";

export default class InCVCertificate {
    public user: User | undefined;
    public certificate: Certificate | undefined;
    public level: ClassLevel | undefined;
    public validatedAt: Date;
    public expriedAt: Date;

    constructor(user: User | undefined = undefined, certificate: Certificate | undefined = undefined, level: ClassLevel | undefined = undefined, validatedAt = new Date(), expriedAt = new Date()) {
        this.user = user;
        this.certificate = certificate;
        this.level = level;
        this.validatedAt = validatedAt;
        this.expriedAt = expriedAt
    }
}