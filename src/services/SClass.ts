import { response } from 'express';
import Class from './../models/Class';
import SLog, { LogType } from './SLog';
import SMySQL from './SMySQL';
import Attendance from '../models/Attendance';
export default class SClass {
    //get all Classes 
    public static getAllClasses(onNext: (classes: Class[]) => void) {
        let sql = `SELECT * FROM classes `
        SMySQL.getConnection(connection => {
            connection?.query<any[]>(sql, [], (err, result)=>{
                //if failed
                if(err){
                    SLog.log(LogType.Error, " get all classes", "fail to get all classes in database", err);
                    onNext([]);
                    return;
                }
                
                //if get data successful
                const classes : Class[] = [];
                result.forEach(data => {
                    const _class = new Class(
                        data.id, data.title, data.description, 
                        undefined, undefined, undefined, data.price, 
                        data.class_creation_fee, data.class_level_id,data.max_learners,data.started_at,
                        data.ended_at, data.created_at, data.updated_at,
                        data.address_1, data.address_2, data.address_3, data.address_4
                    )
                    classes.push(_class);
                })
                onNext(classes);

            })
        });
     }

    public static getClassById(id: number, onNext: (_class: Class | undefined) => void) { }

    public static getClassesByKey(key: string, onNext: (classes: Class[]) => void) { }

    public static storeClass(_class: Class, onNext: (id: number | undefined) => void) { }

    public static updateClass(_class: Class, onNext: (result: boolean) => void) {
        let sql = "UPDATE `classes` SET ";
        const updateCols: string[] = [];
        const updateValues: Array<string | number> = [];

        if (_class.title) {
            updateCols.push("`title`=?"); 
            updateValues.push(_class.title);
        }

        if (_class.description) {
            updateCols.push("`description`=?");
            updateValues.push(_class.description);

        }

        if (_class.major?.id) {
            updateCols.push("`major_id`=?");
            updateValues.push(_class.major.id);

        }

        if (_class.tutor?.id) {
            updateCols.push("`tutor_id`=?");
            updateValues.push(_class.tutor.id);
        }

        if (_class.price) {
            updateCols.push("`price`=?");
            updateValues.push(_class.price);
        }

        if (_class.class_creation_fee) {
            updateCols.push("`class_creation_fee`=?");
            updateValues.push(_class.class_creation_fee);
        }

        if (_class.class_level?.id) {
            updateCols.push("`class_level_id`=?");
            updateValues.push(_class.class_level.id);

        }

        if (_class.max_learners) {
            updateCols.push("`max_learners`=?");
            updateValues.push(_class.max_learners);

        }

        if (_class.started_at) {
            updateCols.push("`started_at`=?");
            updateValues.push(_class.started_at.getTime());
        }

        if (_class.ended_at) {
            updateCols.push("`ended_at`=?");
            updateValues.push(_class.ended_at.getTime());
        }

        if (_class.address_1) {
            updateCols.push("`address_1`=?");
            updateValues.push(_class.address_1);
        }

        if (_class.address_2) {
            updateCols.push("`address_2`=?");
            updateValues.push(_class.address_2);
        }

        if (_class.address_3) {
            updateCols.push("`address_3`=?");
            updateValues.push(_class.address_3);
        }

        if (_class.address_4) {
            updateCols.push("`address_4`=?");
            updateValues.push(_class.address_4);
        }

        sql += updateCols.map(col => col + ", ").join(" ");
        sql += " `updated_at`=? WHERE id = ?";

        SMySQL.getConnection(connection => {
            connection?.execute(sql, [...updateValues, new Date().getTime(), _class.id], error => {
                if (error) {
                    onNext(false);
                    SLog.log(LogType.Error, "updateClass", "Cannot update class", error);
                    return;
                }

                onNext(true);
                return;
            });
        });
    }

    public static softDeleteClass(_class: Class, onNext: (result: boolean) => void) { }
}