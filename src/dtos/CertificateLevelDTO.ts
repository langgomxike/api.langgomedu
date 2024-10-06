import { DTO } from "./DTO";
import Certificate from "../models/Certificate";
import CertificateLevel from "../models/CertificateLevel";

export default class CertificateLevelDTO implements DTO {
    
    //properties
    public id: number;
    public vnLevel: string;
    public jpLevel: string;
    public enLevel: string;
    public certificate: Certificate | undefined;

    //constructor
    constructor(
        id = -1,
        vnLevel = '',
        jpLevel = '',
        enLevel = '',
        certificate: Certificate | undefined = undefined
    ){
        this.id = id;
        this.vnLevel = vnLevel;
        this.jpLevel = jpLevel;
        this.enLevel = enLevel;
        this.certificate =certificate
    }  

    //method
    public fromModel(certificateLevel: CertificateLevel) {
        if(certificateLevel){
            const certificate = certificateLevel.certificate instanceof Certificate ? certificateLevel.certificate : undefined
            return new CertificateLevelDTO(
                certificateLevel.id,
                certificateLevel.vnLevel,
                certificateLevel.jaLevel,
                certificateLevel.enLevel,
                certificate
            )
        }
    }

}
