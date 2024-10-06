import { DTO } from "./DTO";
import Certificate from "../models/Certificate";
import File from "../models/File";

export default class CertificateDTO implements DTO{
   
    //properties
    public id: number
    public name: string
    public vnDesc: string
    public jpDesc: string 
    public enDesc: string
    public icon: File | undefined

    //constructor
    constructor(
        id: number = -1,
        name: string = '',
        vnDesc: string = '',
        jpDesc: string = '',
        enDesc: string = '',
        icon: File | undefined = undefined
    ){
        this.id = id
        this.name = name
        this.vnDesc = vnDesc
        this.jpDesc = jpDesc
        this.enDesc = enDesc
        this.icon = icon
    }

    //method
    public fromModel(certificate : Certificate) {
        if(certificate){
            const icon = certificate.icon instanceof File ? certificate.icon : undefined
            return new CertificateDTO(
                certificate.id,
                certificate.name,
                certificate.vnDesc,
                certificate.jaDesc,
                certificate.enDesc,
                certificate.icon
            )
        }
    }

}