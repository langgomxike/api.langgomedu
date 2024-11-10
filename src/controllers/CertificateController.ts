// @ts-ignore
import express, {Request} from "express";
import SCertificate from "../services/SCertificate";
import SResponse, {ResponseStatus} from "../services/SResponse";
import Certificate from "../models/Certificate";
import SLog, {LogType} from "../services/SLog";
import SCertificateLevel from "../services/SCertificateLevel";
import CertificateLevel from "../models/CertificateLevel";

export default class CertificateController {
    public static getAllCertificates(request: express.Request, response: express.Response) {
        SCertificate.getAllCertificates((certificates) => {
            SResponse.getResponse(ResponseStatus.OK, certificates, "Get all certificates", response);
        });
    }

    public static getCertificateById(request: express.Request, response: express.Response) {
        const id = parseInt(request?.params?.id ?? -1);

        // SLog.log(LogType.Warning, "Certificate", "id = ", id);

        SCertificate.getCertificateById(id, (certificate: Certificate | undefined) => {
            if (!certificate) {
                SResponse.getResponse(ResponseStatus.Not_Found, null, "Certificate not found", response);
                return;
            }

            SResponse.getResponse(ResponseStatus.OK, certificate, "Get certificate successfully", response);
        });
    }

    public static createCertificate(request: express.Request, response: express.Response) {
        const certificate: Certificate = request?.body?.certificate;

        if (!certificate || !certificate.name || !certificate.vn_desc || !certificate.en_desc || !certificate.ja_desc || !certificate.icon?.id) {
            SResponse.getResponse(ResponseStatus.Internal_Server_Error, null, "Invalid certificate", response);
            return;
        }

        SCertificate.storeCertificate(certificate, id => {
            if (id < 1) {
                SResponse.getResponse(ResponseStatus.Internal_Server_Error, null, "Fail to store certificate", response);
                return;
            }

            SResponse.getResponse(ResponseStatus.OK, {}, "Store certificate successfully", response);
        });
    }

    public static deleteCertificate(request: express.Request, response: express.Response) {
        const id = parseInt(request?.params?.id?? -1);

        if (id < 1) {
            SResponse.getResponse(ResponseStatus.Internal_Server_Error, null, "Invalid certificate ID", response);
            return;
        }

        SCertificate.deleteCertificate(id, result => {
            if (!result) {
                SResponse.getResponse(ResponseStatus.Internal_Server_Error, null, "Fail to delete certificate", response);
                return;
            }

            SResponse.getResponse(ResponseStatus.OK, {}, "Delete certificate successfully", response);
        });
    }

    public static updateCertificate(request: express.Request, response: express.Response) {
        const certificate: Certificate = request?.body?.certificate;

        if (!certificate || !(certificate.id || certificate.name || certificate.vn_desc || certificate.en_desc || certificate.ja_desc)) {
            SLog.log(LogType.Error, "updateCertificate", "invalid certificate");
            SResponse.getResponse(ResponseStatus.Internal_Server_Error, null, "Invalid certificate", response);
            return;
        }

        SCertificate.updateCertificate(certificate, (result) => {
            if (!result) {
                SLog.log(LogType.Error, "updateCertificate", "fail to update certificate");
                SResponse.getResponse(ResponseStatus.Internal_Server_Error, null, "Fail to update certificate", response);
                return;
            }

            SLog.log(LogType.Info, "updateCertificate", "success to update certificate");
            SResponse.getResponse(ResponseStatus.OK, {}, "Update certificate successfully", response);
        })
    }

    public static getAllLevels(request: express.Request, response: express.Response) {
        SCertificateLevel.getAllCertificateLevels(levels => {
            SResponse.getResponse(ResponseStatus.OK, levels, "Get all certificate levels", response);
        });
    }

    public static createLevel(request: express.Request, response: express.Response) {
        const level: CertificateLevel = request?.body?.certificate_level;

        if (!level || !level.vn_level ||!level.en_level ||!level.ja_level || !level.certificate?.id) {
            SResponse.getResponse(ResponseStatus.Internal_Server_Error, null, "Invalid certificate level", response);
            return;
        }

        SCertificateLevel.storeCertificateLevel(level, id => {
            if (id < 1) {
                SResponse.getResponse(ResponseStatus.Internal_Server_Error, null, "Fail to store certificate level", response);
                return;
            }

            SResponse.getResponse(ResponseStatus.OK, {}, "Store certificate level successfully", response);
        });
    }

    public static updateLevel(request: express.Request, response: express.Response) {
        const level: CertificateLevel = request?.body?.certificate_level;

        if (!level || !level.id || !(level.vn_level || level.en_level || level.ja_level || level.certificate?.id)) {
            SLog.log(LogType.Error, "updateLevel", "invalid certificate level");
            SResponse.getResponse(ResponseStatus.Internal_Server_Error, null, "Invalid certificate level", response);
            return;
        }

        SCertificateLevel.updateCertificateLevel(level, (result) => {
            if (!result) {
                SLog.log(LogType.Error, "updateLevel", "fail to update certificate level");
                SResponse.getResponse(ResponseStatus.Internal_Server_Error, null, "Fail to update certificate level", response);
                return;
            }

            SLog.log(LogType.Info, "updateLevel", "success to update certificate level");
            SResponse.getResponse(ResponseStatus.OK, {}, "Update certificate level successfully", response);
        });
    }

    public static deleteLevel(request: express.Request, response: express.Response) {
        const id = parseInt(request?.params?.id?? -1);

        if (id < 1) {
            SResponse.getResponse(ResponseStatus.Internal_Server_Error, null, "Invalid certificate level ID", response);
            return;
        }

        SCertificateLevel.deleteCertificateLevel(id, result => {
            if (!result) {
                SResponse.getResponse(ResponseStatus.Internal_Server_Error, null, "Fail to delete certificate level", response);
                return;
            }

            SResponse.getResponse(ResponseStatus.OK, {}, "Delete certificate level successfully", response);
        });
    }

    public static getAllLevelsOfOneCertificate(request: express.Request, response: express.Response) {
        const certificateId = parseInt(request?.params?.id ?? -1);

        if (certificateId < 1) {
            SResponse.getResponse(ResponseStatus.Internal_Server_Error, null, "Invalid certificate ID", response);
            return;
        }

        SCertificateLevel.getCertificateLevelsByCertificateId(certificateId, levels => {
            SResponse.getResponse(ResponseStatus.OK, levels, "Get certificate levels of one certificate", response);
        });
    }
}