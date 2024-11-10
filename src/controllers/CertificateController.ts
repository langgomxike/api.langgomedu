// @ts-ignore
import express, {Request} from "express";
import SCertificate from "../services/SCertificate";
import SResponse, {ResponseStatus} from "../services/SResponse";
import Certificate from "../models/Certificate";
import SLog, {LogType} from "../services/SLog";

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

    }

    public static createLevel(request: express.Request, response: express.Response) {

    }

    public static updateLevel(request: express.Request, response: express.Response) {

    }

    public static deleteLevel(request: express.Request, response: express.Response) {

    }

    public static getAllLevelsOfOneCertificate(request: express.Request, response: express.Response) {

    }
}