import CertificateLevel from './../models/CertificateLevel';
export default class SCertificateLevel {
    public static getAllCertificateLevels(onNext: (certificates: CertificateLevel[]) => void) { }

    public static getCertificateLevelById(id: number, onNext: (certificate: CertificateLevel) => void) { }

    public static storeCertificateLevel(levels: CertificateLevel, onNext: (id: number | undefined) => void) { }

    public static updateCertificateLevel(levels: CertificateLevel, onNext: (result: boolean) => void) { }

    public static deleteCertificateLevel(id: number, onNext: (result: boolean) => void) { }
} 