import { RowDataPacket } from "mysql2";
import File from "../models/File";
import SLog, { LogType } from "./SLog";
import SMySQL from "./SMySQL";

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

    public static getFilesByIds(ids: number[], onNext: (files: File[] | []) => void) {
        const sql = `SELECT * FROM files WHERE id IN (${ids.map(id => "?").join(", ")})`;

        // SLog.log(LogType.Info, "sql", "", { ids, sql, });

        SMySQL.getConnection((connection) => {
            connection?.execute<IFile[]>(sql, ids.map(id => id ? id : -1), (err, results) => {
                if (err) {
                    onNext([]);
                    // SLog.log(LogType.Error, "getFilesByIds", "ids: " + ids.join(", "), err);
                    return;
                }

                const files: File[] = [];

                results.forEach(iFile => {
                    const file = new File();
                    file.id = iFile.id;
                    file.name = iFile.name;
                    file.capacity = iFile.capacity;
                    file.path = iFile.path;
                    file.imageWidth = iFile.image_with;
                    file.imageHeight = iFile.image_height;
                    file.createdAt = new Date(iFile.created_at);
                    file.updatedAt = new Date(iFile.updated_at);

                    files.push(file);
                });

                onNext(files);
                // SLog.log(LogType.Info, "getFilesByIds", "ids: " + ids.join(", "), { err: err, results: results });
            });
        });
    }
}   