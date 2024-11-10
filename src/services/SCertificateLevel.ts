import CertificateLevel from './../models/CertificateLevel';
import SMySQL from "./SMySQL";
import SLog, {LogType} from "./SLog";

export default class SCertificateLevel {
    public static getAllCertificateLevels(onNext: (levels: CertificateLevel[]) => void) {
        const sql = `SELECT certificate_levels.*,
                            JSON_OBJECT(
                                    'id', certificates.id,
                                    'name', certificates.name,
                                    'vn_level', certificates.vn_desc,
                                    'ja_level', certificates.ja_desc,
                                    'en_level', certificates.en_desc,
                                    'icon', JSON_OBJECT(
                                            'id', files.id,
                                            'path', files.path,
                                            'image_width', files.image_with,
                                            'image_height', files.image_height
                                            )
                            ) AS certificate
                     FROM certificate_levels
                              LEFT JOIN certificates ON certificate_levels.certificate_id = certificates.id
                              LEFT JOIN files ON certificates.icon_id = files.id`;

        SMySQL.getConnection(connection => {
            connection?.execute<any[]>(sql, (error, result) => {
                if (error) {
                    SLog.log(LogType.Error, "getAllCertificateLevels", "Cannot get all certificate levels", error);
                    onNext([]);
                    return;
                }

                const levels: CertificateLevel[] = result;
                onNext(levels);
            });
        });
    }

    public static getCertificateLevelsByCertificateId(id: number, onNext: (levels: CertificateLevel[]) => void) {
        const sql = `SELECT certificate_levels.*,
                            JSON_OBJECT(
                                    'id', certificates.id,
                                    'name', certificates.name,
                                    'vn_level', certificates.vn_desc,
                                    'ja_level', certificates.ja_desc,
                                    'en_level', certificates.en_desc,
                                    'icon', JSON_OBJECT(
                                            'id', files.id,
                                            'path', files.path,
                                            'image_width', files.image_with,
                                            'image_height', files.image_height
                                            )
                            ) AS certificate
                     FROM certificate_levels
                              LEFT JOIN certificates ON certificate_levels.certificate_id = certificates.id
                              LEFT JOIN files ON certificates.icon_id = files.id
                     WHERE certificate_levels.certificate_id = ?`;

        SMySQL.getConnection(connection => {
            connection?.execute<any[]>(sql, [id], (error, result) => {
                if (error) {
                    SLog.log(LogType.Error, "getCertificateLevelsByCertificateId", "Cannot get all certificate levels", error);
                    onNext([]);
                    return;
                }

                const levels: CertificateLevel[] = result;
                onNext(levels);
            });
        });
    }

    public static storeCertificateLevel(level: CertificateLevel, onNext: (id: number | undefined) => void) {
        const sql = "INSERT INTO certificate_levels (`certificate_id`, `vn_level`, `ja_level`, `en_level`) VALUES (?,?,?,?)";

        SMySQL.getConnection(connection => {
            connection?.execute<any>(sql, [level.certificate?.id, level.vn_level, level.ja_level, level.en_level], (error, result) => {
                if (error) {
                    SLog.log(LogType.Error, "storeCertificateLevel", "Cannot store certificate level", error);
                    onNext(undefined);
                    return;
                }

                const id = result.insertId;
                SLog.log(LogType.Info, "storeCertificateLevel", "store certificate level successfully", id);
                onNext(id);
            });
        });
    }

    public static updateCertificateLevel(level: CertificateLevel, onNext: (result: boolean) => void) {
        let sql = "UPDATE certificate_levels SET ";
        const values = [];

        if (level.certificate?.id) {
            sql += "certificate_id=?,";
            values.push(level.certificate.id);
        }

        if (level.vn_level) {
            sql += "vn_level=?,";
            values.push(level.vn_level);
        }

        if (level.ja_level) {
            sql += "ja_level=?,";
            values.push(level.ja_level);
        }

        if (level.en_level) {
            sql += "en_level=?,";
            values.push(level.en_level);
        }

        sql += "id = ? WHERE id =?";

        SMySQL.getConnection(connection => {
            connection?.execute<any>(sql, [...values, level.id, level.id], (error, result) => {
                if (error) {
                    SLog.log(LogType.Error, "updateCertificateLevel", "Cannot update certificate level", error);
                    onNext(false);
                    return;
                }

                SLog.log(LogType.Info, "updateCertificateLevel", "update certificate level successfully");
                onNext(true);
            });
        });
    }

    public static deleteCertificateLevel(id: number, onNext: (result: boolean) => void) {
        const sql = "DELETE FROM certificate_levels WHERE id =?";

        SMySQL.getConnection(connection => {
            connection?.execute<any>(sql, [id], (error, result) => {
                if (error) {
                    SLog.log(LogType.Error, "deleteCertificateLevel", "Cannot delete certificate level", error);
                    onNext(false);
                    return;
                }

                SLog.log(LogType.Info, "deleteCertificateLevel", "delete certificate level successfully");
                onNext(true);
            });
        });
    }

    public static deleteCertificateLevelOfOneCertificate(id: number, onNext: (result: boolean) => void) {
        const sql = `DELETE
                     FROM certificate_levels
                     WHERE certificate_id = ?`;

        SMySQL.getConnection(connection => {
            connection?.execute<any>(sql, [id], (error, result) => {
                if (error) {
                    SLog.log(LogType.Error, "deleteCertificateLevelOfOneCertificate", "Cannot delete certificate levels", error);
                    onNext(false);
                    return;
                }

                SLog.log(LogType.Info, "deleteCertificateLevelOfOneCertificate", "delete certificate levels successfully");
                onNext(true);
            });
        });
    }
} 