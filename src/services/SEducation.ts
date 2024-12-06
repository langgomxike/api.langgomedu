import db from "../configs/knex";
import SAddress from "./SAddress";
import SFile from "./SFile";

export default class SEducation {

    public static async uploadEducationFiles(files: any, onNext: (data: any) => void) {
        const filePaths: string[] = [];
        files.forEach(file => {
            const filePath = `/uploads/educations/${file.filename}`
            filePaths.push(filePath);
        });
        await SFile.storeFiles(filePaths, (fileIds) => {
            onNext({
                educationIds: fileIds
            })
        })
    }

    public static async storeOldEducations(cvId: string, educations: any) {
        // console.log(cvId);
        // console.log(educations);
        const insertDatas: any[] = [];
        for (const item of educations) {
            const address = item.address;
            const addressId = await SAddress.getAddressId(address);
            const insertData = {
                cv_id: cvId,
                name: item.name,
                note: item.note,
                address_id: addressId,
                started_at: item.startedAt,
                ended_at: item.endedAt,
                evidence_id: item.evidenceId,
            };
            // console.log(insertData);

            insertDatas.push(insertData);
        }
        // console.log(insertDatas);

        return await db('educations').insert(insertDatas)
            .then((results) => {
                const ids: number[] = [];
                const firstId = results[0];
                ids.push(firstId);
                for (let index = 1; index < educations.length; index++) {
                    ids.push(firstId + index);
                }
                return ids
            })
            .catch((error) => {
                console.log("fail to store old Educations : ", error.message);
                return {};
            })
    }

    public static async storeNewEducations(cvId: string, educations: any) {
        // console.log(educations);
        const insertDatas: any[] = [];
        for (const item of educations) {
            const address = item.address;
            const addressId = await SAddress.storeAddress(address);
            // console.log(addressId);
            const insertData = {
                cv_id: cvId,
                name: item.name,
                note: item.note,
                address_id: addressId,
                started_at: item.startedAt,
                ended_at: item.endedAt,
                evidence_id: item.evidenceId,
            };
            
            insertDatas.push(insertData);
        }
        console.log(insertDatas);
        return await db('educations').insert(insertDatas)
            .then((results) => {
                const ids: number[] = [];
                const firstId = results[0];
                ids.push(firstId);
                for (let index = 1; index < educations.length; index++) {
                    ids.push(firstId + index);
                }
                return ids;
            })
            .catch((error) => {
                console.log("fail to store new Educations : ", error.message);
                return {};
            })
    }
}