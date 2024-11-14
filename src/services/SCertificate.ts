import Certificate from "../models/Certificate";
import SMySQL from "./SMySQL";
import SLog, {LogType} from "./SLog";
import SFirebase, {FirebaseNode} from "./SFirebase";
import SCertificateLevel from "./SCertificateLevel";

export default class SCertificate {
    public static getAllCertificates(onNext: (certificates: Certificate[]) => void) {
        const sql = `SELECT certificates.*,
                            JSON_OBJECT(
                                    'id', files.id,
                                    'path', files.path,
                                    'image_width', files.image_with,
                                    'image_height', files.image_height
                            ) AS icon
                     FROM certificates
                              LEFT JOIN files ON files.id = certificates.icon_id
        `;

        SMySQL.getConnection(connection => {
            connection?.execute<any[]>(sql, (error, result) => {
                if (error) {
                    SLog.log(LogType.Error, "getAllCertificates", "Cannot get all certificates", error);
                    onNext([]);
                    return;
                }

                const certificates: Certificate[] = result;
                SLog.log(LogType.Error, "getAllCertificates", "get all certificates successfully");
                onNext(certificates);
            });
        });
    }

    public static getCertificateById(id: number, onNext: (certificate: Certificate | undefined) => void) {
        const sql = `SELECT certificates.*,
                            JSON_OBJECT(
                                    'id', files.id,
                                    'path', files.path,
                                    'image_width', files.image_with,
                                    'image_height', files.image_height
                            ) AS icon
                     FROM certificates
                              LEFT JOIN files ON files.id = certificates.icon_id
                     WHERE certificates.id = ?`;

        SMySQL.getConnection(connection => {
            connection?.execute<any[]>(sql, [id], (error, result) => {
                if (error) {
                    SLog.log(LogType.Error, "getCertificateById", "Cannot get certificate by id", error);
                    onNext(undefined);
                    return;
                }

                const certificates: Certificate[] = result;

                if (certificates.length < 1) {
                    SLog.log(LogType.Error, "getCertificateById", "Certificate not found by id");
                    onNext(undefined);
                    return;
                }

                SLog.log(LogType.Error, "getCertificateById", "get certificate successfully");
                onNext(certificates[0]);
            });
        });
    }

    public static storeCertificate(certificate: Certificate, onNext: (id: number | undefined) => void) {
        const sql = `INSERT INTO certificates (name, vn_desc, ja_desc, en_desc, icon_id)
                     VALUES (?, ?, ?, ?, ?)`;

        SMySQL.getConnection(connection => {
            connection?.execute(sql, [certificate.name, certificate.vn_desc, certificate.ja_desc, certificate.en_desc, certificate.icon?.id], (error, result) => {
                if (error) {
                    SLog.log(LogType.Error, "storeCertificate", "Cannot store certificate", error);
                    onNext(undefined);
                    return;
                }

                const id = (result as any)?.insertId;
                SLog.log(LogType.Info, "storeCertificate", "store certificate successfully");

                SFirebase.push(FirebaseNode.CERTIFICATE, id, () => {
                    onNext(id);
                })
            });
        });
    }

    public static updateCertificate(certificate: Certificate, onNext: (result: boolean) => void) {
        let sql = `UPDATE certificates
                   SET `;
        const values = [];

        if (certificate.name) {
            sql += 'name=?,';
            values.push(certificate.name);
        }

        if (certificate.vn_desc) {
            sql += 'vn_desc=?,';
            values.push(certificate.vn_desc);
        }

        if (certificate.en_desc) {
            sql += 'en_desc=?,';
            values.push(certificate.en_desc);
        }

        if (certificate.ja_desc) {
            sql += 'ja_desc=?,';
            values.push(certificate.ja_desc);
        }

        if (certificate.icon?.id) {
            sql += 'icon_id=?,';
            values.push(certificate.icon?.id);
        }

        sql += 'id = ? WHERE id =?';

        SMySQL.getConnection(connection => {
            connection?.execute(sql, [...values, certificate.id, certificate.id], (error, result) => {
                if (error) {
                    SLog.log(LogType.Error, "updateCertificate", "Cannot update certificate", error);
                    onNext(false);
                    return;
                }

                SLog.log(LogType.Info, "updateCertificate", "update certificate successfully");
                SFirebase.push(FirebaseNode.CERTIFICATE, certificate.id, () => {
                    onNext(true);
                });
            });
        });
    }

    public static deleteCertificate(id: number, onNext: (result: boolean) => void) {
        const sql = `DELETE
                     FROM certificates
                     WHERE id = ?`;

        SMySQL.getConnection(connection => {
            connection?.execute(sql, [id], (error, result) => {
                if (error) {
                    SLog.log(LogType.Error, "deleteCertificate", "Cannot delete certificate", error);
                    onNext(false);
                    return;
                }

                SLog.log(LogType.Info, "deleteCertificate", "delete certificate successfully");

                SCertificateLevel.deleteCertificateLevelOfOneCertificate(id, result => {
                    SFirebase.delete(FirebaseNode.CERTIFICATE, id, () => {
                        onNext(true);
                    });
                });

            });
        });
    }
}