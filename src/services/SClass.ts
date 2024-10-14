import Class from './../models/Class';
import SLog, { LogType } from './SLog';
import SMySQL from './SMySQL';
export default class SClass {
    public static getAllClasses(onNext: (classes: Class[]) => void) { }

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

        if (_class.address1) {
            updateCols.push("`address_1`=?");
            updateValues.push(_class.address1);
        }

        if (_class.address2) {
            updateCols.push("`address_2`=?");
            updateValues.push(_class.address2);
        }

        if (_class.address3) {
            updateCols.push("`address_3`=?");
            updateValues.push(_class.address3);
        }

        if (_class.address4) {
            updateCols.push("`address_4`=?");
            updateValues.push(_class.address4);
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