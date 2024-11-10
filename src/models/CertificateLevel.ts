
import Certificate from "./Certificate";

export default class CertificateLevel {
    public id: number;
    public vn_level: string;
    public ja_level: string;
    public en_level: string;
    public certificate: Certificate | undefined;

    constructor(id = -1, vnLevel = "", jaLevel = "", enLevel = "", certificate: Certificate | undefined = undefined) {
        this.id = id;
        this.vn_level = vnLevel;
        this.ja_level = jaLevel;
        this.en_level = enLevel;
        this.certificate = certificate
    }
}