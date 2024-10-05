import Certificate from './Certificate';
import File from './File';
export default class InCertificateFile {
    public certificate: Certificate | undefined;
    public file: File | undefined;

    constructor(certificate: Certificate | undefined = undefined, file: File | undefined = undefined) {
        this.certificate = certificate;
        this.file = file;
    }
}