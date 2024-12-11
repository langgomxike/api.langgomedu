import Certificate from "../models/Certificate";
import SMySQL from "./SMySQL";
import SLog, { LogType } from "./SLog";
import SFirebase, { FirebaseNode } from "./SFirebase";
import SCertificateLevel from "./SCertificateLevel";
import SFile from "./SFile";
import db from "../configs/knex";

export default class SCertificate {
    public static async uploadCertificateFiles(files: any, onNext: (data: any) => void) {
        const filePaths: string[] = [];
        files.forEach(file => {
            const filePath = `/uploads/educations/${file.filename}`
            filePaths.push(filePath);
        });
        await SFile.storeFiles(filePaths, (fileIds) => {
            onNext({
                certificateIds: fileIds
            })
        })
    }

    public static async storeOldCertificates(cvId: string, certificates: any) {
        // console.log(certificates);
        const insertDatas: any[] = [];
        for (const item of certificates) {
            const insertData = {
                cv_id: cvId,
                name: item.name,
                note: item.note,
                score: item.score,
                valid_at: item.validAt,
                expired_at: item.expiredAt,
                evidence_id: item.evidenceId,
            };
            insertDatas.push(insertData);
        }
        console.log(insertDatas);
        return await db('certificates').insert(insertDatas)
            .then((results) => {
                const ids: number[] = [];
                const firstId = results[0];
                ids.push(firstId);
                for (let index = 1; index < certificates.length; index++) {
                    ids.push(firstId + index);
                }
                return ids
            })
            .catch((error) => {
                console.log("fail to store old Certificates : ", error.message);
                return {};
            })
    }

    public static async storeNewCertificates(cvId: string, certificates: any) {
        // console.log(certificates);
        const insertDatas: any[] = [];
        for (const item of certificates) {
            const insertData = {
                cv_id: cvId,
                name: item.name,
                note: item.note,
                score: item.score,
                valid_at: item.validAt,
                expired_at: item.expiredAt,
                evidence_id: item.evidenceId,
            };
            insertDatas.push(insertData);
        }

        // const insertclassmember = [
        //     {
        //         class_id : 30,
        //         user_id : "000000000|c:0"
        //     },
        //     {
        //         class_id : 30,
        //         user_id : "000000000|c:0"
        //     },

        // ]
        console.log(insertDatas);
        return await db('certificates').insert(insertDatas)
            .then((results) => {
                const ids: number[] = [];
                const firstId = results[0];
                ids.push(firstId);
                for (let index = 1; index < certificates.length; index++) {
                    ids.push(firstId + index);
                }
                return ids
            })
            .catch((error) => {
                console.log("fail to store new Certificates : ", error.message);
                return {};
            })
    }
}