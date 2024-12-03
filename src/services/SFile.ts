import { RowDataPacket } from "mysql2";
import File from "../models/File";
import SLog, { LogType } from "./SLog";
import SMySQL from "./SMySQL";
import db from "../configs/knex";

interface IFile extends RowDataPacket {
    id: number;
    name: string;
    path: string;
    capacity: number;
    image_with: number;
    image_height: number;
    created_at: number;
    updated_at: number;
}

export default class SFile {
    public static getFileById(id: number, onNext: (file: File | undefined) => void) {
        const sql = "SELECT * FROM files WHERE id = ?";

        SMySQL.getConnection((connection) => {
            connection?.execute(sql, id, (err, result) => {
                if (err) {
                    onNext(undefined);
                    SLog.log(LogType.Error, "getFileById", "id: " + id, err);
                    return;
                }
                SLog.log(LogType.Info, "getFileById", "id: " + id, { err: err, result: result });
            });
        });
    }

    // public static getFilesByIds(ids: number[], onNext: (files: File[] | []) => void) {
    //     const sql = `SELECT * FROM files WHERE id IN (${ids.map(id => "?").join(", ")})`;

    //     // SLog.log(LogType.Info, "sql", "", { ids, sql, });

    //     SMySQL.getConnection((connection) => {
    //         connection?.execute<IFile[]>(sql, ids.map(id => id ? id : -1), (err, results) => {
    //             if (err) {
    //                 onNext([]);
    //                 // SLog.log(LogType.Error, "getFilesByIds", "ids: " + ids.join(", "), err);
    //                 return;
    //             }

    //             const files: File[] = [];

    //             results.forEach(iFile => {
    //                 const file = new File();
    //                 file.id = iFile.id;
    //                 file.name = iFile.name;
    //                 file.capacity = iFile.capacity;
    //                 file.path = iFile.path;
    //                 file.image_width = iFile.image_with;
    //                 file.image_height = iFile.image_height;
    //                 file.created_at = new Date(iFile.created_at).getTime();
    //                 file.updated_at = new Date(iFile.updated_at).getTime();

    //                 files.push(file);
    //             });

    //             onNext(files);
    //             // SLog.log(LogType.Info, "getFilesByIds", "ids: " + ids.join(", "), { err: err, results: results });
    //         });
    //     });
    // }

    // public static storeFile(file: File, onNext: (result: boolean)=> void) {
    //     const sql = "INSERT INTO files (name, path, capacity, image_with, image_height, created_at) VALUES (?,?,?,?,?, ?)";

    //     SMySQL.getConnection(connection => {
    //         connection?.execute(sql, [file.name, file.path, file.capacity, file.image_width, file.image_height, new Date().getTime()], (err, result) => {
    //             if (err) {
    //                 onNext(false);
    //                 SLog.log(LogType.Error, "storeFile", "", err);
    //                 return;
    //             }

    //             SLog.log(LogType.Info, "storeFile", "store file successfully");
    //             onNext(true);
    //         });
    //     });
    // }


    public static async storeFiles(filePaths: string[], onNext: (fileIds: any[]) => void) {
        //prepare data
        const files = filePaths.map((item) => {
            const file = new File(-1, item, item, 1, Date.now(), Date.now());
            return file.toInsertObject(); // Gọi phương thức toInsertObject()
        });

        await db('files').insert(files)
            .then((results) => {
                const ids : number[] = [];
                const firstId = results[0];
                ids.push(firstId);
                for (let index = 1; index < filePaths.length; index++) {
                    ids.push(firstId + index);
                }
                onNext(ids)
            })
            .catch((err) => {
                console.log(err);
                onNext([]);
            })
    }
}   