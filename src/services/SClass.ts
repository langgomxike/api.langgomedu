import { response } from 'express';
import Class from './../models/Class';
import SLog, { LogType } from './SLog';
import SMySQL from './SMySQL';
import Attendance from '../models/Attendance';
import User from '../models/User';
import Major from '../models/Major';
import { on } from 'events';
export default class SClass {
        /**
     * Truy vấn tất cả các lớp học từ cơ sở dữ liệu và trả kết quả dưới dạng mảng các đối tượng Class.
     * @param onNext - Hàm callback để xử lý kết quả trả về, với tham số là mảng các lớp học (Class[]).
     */
    public static getAllClasses(onNext: (classes: Class[]) => void) {
        // Câu truy vấn SQL lấy thông tin về lớp học, giáo viên, ngành học, cấp độ lớp, và tác giả
        let sql = `SELECT DISTINCT
                JSON_OBJECT(
                    'id', classes.id,
                    'title', classes.title,
                    'description', classes.description,
                    'price', classes.price,
                    'class_creation_fee', classes.class_creation_fee,
                    'max_learners', classes.max_learners,
                    'started_at', classes.started_at,
                    'ended_at', classes.ended_at,
                    'address_1', classes.address_1,
                    'address_2', classes.address_2,
                    'address_3', classes.address_3,
                    'address_4', classes.address_4
                ) AS class,
                JSON_OBJECT(
                    'id', tutors.id,
                    'name', tutors.full_name,
                    'email', tutors.email,
                    'phone_number', tutors.phone_number,
                    'avatar', JSON_OBJECT('path', files_tutor.path)
                ) AS tutor,
                JSON_OBJECT(
                    'id', majors.id,
                    'vn_name', majors.vn_name,
                    'en_name', majors.en_name,
                    'ja_name', majors.ja_name,
                    'icon', JSON_OBJECT('path', files_major.path)
                ) AS major,
                JSON_OBJECT(
                    'id', class_levels.id,
                    'vn_name', class_levels.vn_name,
                    'en_name', class_levels.en_name,
                    'ja_name', class_levels.ja_name
                ) AS class_level,
                JSON_OBJECT(
                    'id', author.id,
                    'name', author.full_name,
                    'email', author.email,
                    'phone_number', author.phone_number,
                    'avatar', JSON_OBJECT('path', files_author.path)
                ) AS author
            FROM classes
            LEFT JOIN users AS tutors ON tutors.id = classes.tutor_id
            LEFT JOIN majors ON majors.id = classes.major_id
            LEFT JOIN class_levels ON class_levels.id = classes.class_level_id
            LEFT JOIN files AS files_tutor ON files_tutor.id = tutors.avatar_id
            LEFT JOIN files AS files_major ON files_major.id = majors.icon_id
            LEFT JOIN in_class_members ON in_class_members.class_id = classes.id
            LEFT JOIN users AS author ON author.id = classes.author_id
            LEFT JOIN files AS files_author ON files_author.id = author.avatar_id;`

        // Lấy kết nối tới cơ sở dữ liệu
        SMySQL.getConnection(connection => {
            // Thực hiện truy vấn SQL
            connection?.query<any[]>(sql, [], (err, result) => {
                // Xử lý khi có lỗi trong quá trình truy vấn
                if (err) {
                    SLog.log(LogType.Error, "get all classes", "fail to get all classes in database", err);
                    // Gọi callback với mảng rỗng khi gặp lỗi
                    onNext([]);
                    return;
                }

                // Nếu truy vấn thành công, khởi tạo mảng lưu các lớp học
                const classes: Class[] = [];

                // Duyệt qua kết quả trả về và ánh xạ vào các đối tượng Class
                result.forEach(data => {
                    const _class = data.class as Class; // Lấy đối tượng class từ cột 'class'
                    _class.tutor = data.tutor as User; // Gán thông tin giáo viên
                    _class.major = data.major as Major; // Gán thông tin ngành học
                    _class.author = data.author as User; // Gán thông tin tác giả

                    // Thêm lớp học vào mảng classes
                    classes.push(_class);
                });

                // Gọi callback với mảng các lớp học đã ánh xạ
                onNext(classes);
            });
        });
    }

    public static getAuthorClasses(author_id: string, onNext: (classes: Class[])=> void){
        const sql = `SELECT 
                JSON_OBJECT(
                    'id', c.id,
                    'title', c.title,
                    'description', c.description,
                    'started_at', c.started_at,
                    'ended_at', c.ended_at,
                    'price', c.price,
                    'address_1', c.address_1,
                    'address_2', c.address_2,
                    'address_3', c.address_3,
                    'address_4', c.address_4
                ) AS class,
                JSON_OBJECT(
                    'full_name', tutors.full_name,
                    'phone_number', tutors.phone_number
                ) AS tutor,
                JSON_OBJECT(
                    'icon', JSON_OBJECT('path', icon_major.path),
                    'vn_name', majors.vn_name,
                    'en_name', majors.en_name,
                    'ja_name', majors.ja_name
                ) AS major 
            
            FROM classes c
            JOIN users tutors ON tutors.id = c.tutor_id
            JOIN majors ON majors.id = c.major_id
            JOIN files icon_major ON icon_major.id = majors.icon_id
            WHERE author_id = ?`

            SMySQL.getConnection(connection => {
                connection?.query<any[]>(sql, [author_id], (err, result)=> {
                    if(err){
                        SLog.log(LogType.Error, 'get author of classes', "can't not get your classes");
                    }

                    const classes : Class[] = [];
                    result.forEach(data => {
                        const _class : Class = data.class as Class
                        _class.tutor = data.tutor as User
                        _class.major = data.major as Major

                        classes.push(_class)
                    });

                    onNext(classes)
                })
            })

    }
    
    public static getStudentClasses(student_id: number, onNext: (classes: Class[])=> void){}
    public static getClassesWithoutTutor(onNext: (classes: Class[])=> void){}
    public static getUnstartedClasses(onNext: (classes: Class[])=> void){}
    public static getIncompleteClasses(onNext: (classes: Class[])=> void){}

    public static getClassById(id: number, onNext: (_class: Class | undefined) => void) {
        const sql = `SELECT 
                    JSON_OBJECT(
                    'id', c.id,
                    'title', c.title,
                    'description', c.description,
                    'price', c.price,
                    'tutor', JSON_OBJECT(
                        'id', tutor.id,
                        'full_name', tutor.full_name,
                        'email', tutor.email,
                        'phone_number', tutor.phone_number,
                        'avatar', JSON_OBJECT(
                            'id', tutor_avatar.id,
                            'name', tutor_avatar.name,
                            'path', tutor_avatar.path,
                            'capacity', tutor_avatar.capacity,
                            'image_width', tutor_avatar.image_with,
                            'image_height', tutor_avatar.image_height,
                            'created_at', tutor_avatar.created_at,
                            'updated_at', tutor_avatar.updated_at
                        )
                    ),
                    'author', JSON_OBJECT(
                        'id', tutor.id,
                        'full_name', tutor.full_name,
                        'email', tutor.email,
                        'phone_number', tutor.phone_number,
                        'avatar', JSON_OBJECT(
                            'id', tutor_avatar.id,
                            'name', tutor_avatar.name,
                            'path', tutor_avatar.path,
                            'capacity', tutor_avatar.capacity,
                            'image_width', tutor_avatar.image_with,
                            'image_height', tutor_avatar.image_height,
                            'created_at', tutor_avatar.created_at,
                            'updated_at', tutor_avatar.updated_at
                        )
                    ),
                    'major', JSON_OBJECT(
                        'id', majors.id,
                        'icon', JSON_OBJECT(
                            'id', major_icon.id,
                            'name', major_icon.name,
                            'path', major_icon.path,
                            'image_width', major_icon.image_with,
                            'image_height', major_icon.image_height,
                            'created_at', major_icon.created_at,
                            'updated_at', major_icon.updated_at
                        ),
                        'vn_name', majors.vn_name,
                        'en_name', majors.en_name,
                        'ja_name', majors.ja_name
                    ),
                    'class_creaton_fee', c.class_creation_fee,
                    'max_learners', c.max_learners,
                    'started_at', c.started_at,
                    'ended_at', c.ended_at,
                    'created_at', c.created_at,
                    'updated_at', c.updated_at,
                    'address_1', c.address_1,
                    'address_2', c.address_2,
                    'address_3', c.address_3,
                    'address_4', c.address_4
                    ) as class
                FROM classes c
                LEFT JOIN users tutor ON tutor.id = c.tutor_id
                LEFT JOIN files tutor_avatar ON tutor_avatar.id = tutor.avatar_id
                LEFT JOIN users author ON author.id = c.author_id
                LEFT JOIN files author_avatar ON author_avatar.id = author.avatar_id
                LEFT JOIN majors ON majors.id = c.major_id
                LEFT JOIN files major_icon ON major_icon.id = majors.icon_id
                LEFT JOIN class_levels cl ON cl.id = c.class_level_id
                WHERE c.id = ?`

        SMySQL.getConnection(connection => {
            connection?.query<any>(sql, [id], (err, result)=> {
                if(err){
                    SLog.log(LogType.Error, 'get Class by ID', "can't not get class", err);
                    onNext(undefined);
                }

                const _class : Class = result as Class;
                onNext(_class);
            })
        })
     }

    public static getClassesByKey(key: string, onNext: (classes: Class[]) => void) { }

    public static storeClass(createdClass: Class, onNext: (id: number | undefined) => void) {
        let sql = '';
        const insertCols: string[] = [];
        const insertValues: Array<String | number> = [];

     }

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

