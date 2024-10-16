import Certificate from "../models/Certificate";

export default class SCertificate {
    public static getAllCertificates(onNext: (certificates: Certificate[]) => void) { }

    public static getCertificateById(id: number, onNext: (certificate: Certificate) => void) { }

    public static storeCertificate(certificate: Certificate, onNext: (id: number | undefined) => void) { }

    public static updateCertificate(certificate: Certificate, onNext: (result: boolean) => void) { }

    public static deleteCertificate(id: number, onNext: (result: boolean) => void) { }

}