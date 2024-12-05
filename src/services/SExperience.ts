import db from "../configs/knex";
import SAddress from "./SAddress";
import SFile from "./SFile";

export default class SExperience {
    public static async uploadExperienceFiles(files: any, onNext: (data: any)=> void){
        const filePaths : string[] = [];
        files.forEach(file => {
            const filePath = `/uploads/experiences/${file.filename}`
            filePaths.push(filePath);
        });
        await SFile.storeFiles(filePaths, (fileIds)=> {
            onNext({
                experienceIds : fileIds
            })  
        })
    }

    public static async storeOldExperiences(cvId : string, experiences : any){
        const insertDatas: any[] = [];
        for (const item of experiences) {
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
            insertDatas.push(insertData);
        }
        // console.log(insertDatas);
        return await db('experiences').insert(insertDatas)
            .then((results) => {
                const ids: number[] = [];
                const firstId = results[0];
                ids.push(firstId);
                for (let index = 1; index < experiences.length; index++) {
                    ids.push(firstId + index);
                }
                return ids
            })
            .catch((error) => {
                console.log("fail to store old Experiences : ", error.message);
                return {};
            })
    }

    public static async storeNewExperiences(cvId: string, experiences: any){
        const insertDatas: any[] = [];
        for (const item of experiences) {
            const address = item.address;
            const addressId = await SAddress.storeAddress(address);
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
        // console.log(insertDatas);
        return await db('experiences').insert(insertDatas)
            .then((results) => {
                const ids: number[] = [];
                const firstId = results[0];
                ids.push(firstId);
                for (let index = 1; index < experiences.length; index++) {
                    ids.push(firstId + index);
                }
                return ids
            })
            .catch((error) => {
                console.log("fail to store old Experiences : ", error.message);
                return {};
            })
    }
}