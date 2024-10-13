import SMySQL from "../services/SMySQL";
import certificates from "../datas/certificates.json";
import SLog, { LogType } from "../services/SLog";

export default class CertificateSeeder {
    public static seedAllCertificates() {
        this.dropAllCertificates(result => {
            if (!result) {
                SLog.log(LogType.Error, "dropAllCertificates", "cannot seed all certificates");
            } else {
                this.insertAllCertificates();
            }
        })
    }

    private static dropAllCertificates(onNext: (result: boolean) => void) {
        const sql = "TRUNCATE TABLE certificates";

        SMySQL.getConnection(connection => {
            connection?.execute(sql, (error) => {
                if (error) {
                    onNext(false);
                    return;
                }

                onNext(true);
            });
        });
    }

    private static insertAllCertificates() {
        const sql = "INSERT INTO certificates VALUES (?, ?, ?, ?, ?, ?)";
        SMySQL.getConnection(connection => {
            certificates.forEach(certificate => {
                connection?.execute(sql, [certificate.id, certificate.name, certificate.vn_desc, certificate.en_desc, certificate.ja_desc, certificate.icon_id]);
            });
        });
    }
}