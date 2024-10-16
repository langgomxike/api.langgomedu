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

    /**
  * Updates a class record in the database based on the provided class details.
  * 
  * @param updatedClass - The class object containing the updated details.
  * @param onNext - Callback function to handle the result of the update operation.
  */
    public static updateClass(updatedClass: Class, onNext: (result: boolean) => void) {
        // Initialize the SQL statement for updating the 'classes' table
        let sql = "UPDATE `classes` SET ";
        const updateCols: string[] = []; // Array to hold the columns to be updated
        const updateValues: Array<string | number> = []; // Array to hold the values corresponding to the columns

        // Conditionally add the 'title' column if the title length is within the valid range
        if (updatedClass.title.length >= 3 && updatedClass.title.length <= 255) {
            updateCols.push("`title`=?");
            updateValues.push(updatedClass.title);
        }

        // Conditionally add the 'description' column if it is provided
        if (updatedClass.description) {
            updateCols.push("`description`=?");
            updateValues.push(updatedClass.description);
        }

        // Conditionally add the 'major_id' column if a valid major ID is provided
        if (updatedClass.major?.id) {
            updateCols.push("`major_id`=?");
            updateValues.push(updatedClass.major.id);
        }

        // Conditionally add the 'tutor_id' column if a valid tutor ID is provided
        if (updatedClass.tutor?.id) {
            updateCols.push("`tutor_id`=?");
            updateValues.push(updatedClass.tutor.id);
        }

        // Conditionally add the 'price' column if a price is provided
        if (updatedClass.price) {
            updateCols.push("`price`=?");
            updateValues.push(updatedClass.price);
        }

        // Conditionally add the 'class_creation_fee' column if it is provided
        if (updatedClass.class_creation_fee) {
            updateCols.push("`class_creation_fee`=?");
            updateValues.push(updatedClass.class_creation_fee);
        }

        // Conditionally add the 'class_level_id' column if a valid class level ID is provided
        if (updatedClass.class_level?.id) {
            updateCols.push("`class_level_id`=?");
            updateValues.push(updatedClass.class_level.id);
        }

        // Conditionally add the 'max_learners' column if the maximum number of learners is provided
        if (updatedClass.max_learners) {
            updateCols.push("`max_learners`=?");
            updateValues.push(updatedClass.max_learners);
        }

        // Conditionally add the 'started_at' column if the start date is provided
        if (updatedClass.started_at) {
            updateCols.push("`started_at`=?");
            updateValues.push(updatedClass.started_at);
        }

        // Conditionally add the 'ended_at' column if the end date is provided
        if (updatedClass.ended_at) {
            updateCols.push("`ended_at`=?");
            updateValues.push(updatedClass.ended_at);
        }

        // Conditionally add address columns if they are provided
        if (updatedClass.address1) {
            updateCols.push("`address_1`=?");
            updateValues.push(updatedClass.address1);
        }

        // Conditionally add the 'address_2' column if the second address line is provided
        if (updatedClass.address2) {
            updateCols.push("`address_2`=?"); // Add the 'address_2' column to the list of columns to update
            updateValues.push(updatedClass.address2); // Add the corresponding value for 'address_2'
        }

        // Conditionally add the 'address_3' column if the third address line is provided
        if (updatedClass.address3) {
            updateCols.push("`address_3`=?"); // Add the 'address_3' column to the list of columns to update
            updateValues.push(updatedClass.address3); // Add the corresponding value for 'address_3'
        }

        // Conditionally add the 'address_4' column if the fourth address line is provided
        if (updatedClass.address4) {
            updateCols.push("`address_4`=?"); // Add the 'address_4' column to the list of columns to update
            updateValues.push(updatedClass.address4); // Add the corresponding value for 'address_4'
        }

        // Build the final SQL statement by appending updated columns and setting the updated timestamp
        sql += updateCols.map(col => col + ", ").join(" ");
        sql += " `updated_at`=? WHERE id = ?";

        // Execute the SQL statement using a MySQL connection
        SMySQL.getConnection(connection => {
            connection?.execute(sql, [...updateValues, new Date().getTime(), updatedClass.id], error => {
                // If an error occurs, log the error and invoke the callback with 'false'
                if (error) {
                    onNext(false);
                    SLog.log(LogType.Error, "updateClass", "Cannot update class", error);
                    return;
                }

                // If the update is successful, log success and invoke the callback with 'true'
                onNext(true);
                SLog.log(LogType.Error, "updateClass", "Update class successfully");
                return;
            });
        });
    }

    /**
     * Soft deletes a class by setting the 'ended_at' and 'updated_at' fields in the database.
     * 
     * @param id - The ID of the class to be deleted.
     * @param onNext - Callback function to handle the result of the deletion operation.
     */
    public static softDeleteClass(id: number, onNext: (result: boolean) => void) {
        // SQL statement for performing a soft delete by updating the 'ended_at' and 'updated_at' fields
        const sql = "UPDATE classes SET ended_at = ?, updated_at = ? WHERE id = ?";
        const endedAt = new Date().getTime() - 1000; // Set the ended time to the current time minus one second
        const updatedAt = new Date().getTime(); // Set the updated time to the current time

        // Execute the SQL statement using a MySQL connection
        SMySQL.getConnection(connection => {
            connection?.execute(sql, [endedAt, updatedAt, id], (error) => {
                // If an error occurs, log the error and invoke the callback with 'false'
                if (error) {
                    onNext(false);
                    SLog.log(LogType.Error, "softDeleteClass", "Cannot delete class", error);
                    return;
                }

                // If the deletion is successful, log success and invoke the callback with 'true'
                onNext(true);
                SLog.log(LogType.Error, "softDeleteClass", "Delete class successfully");
                return;
            });
        });
    }

}