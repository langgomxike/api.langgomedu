import Class from './../models/Class';
import SLog, { LogType } from './SLog';
import SMySQL from './SMySQL';
export default class SClass {
    public static getAllClasses(onNext: (classes: Class[]) => void) { }

    public static getClassById(id: number, onNext: (_class: Class | undefined) => void) { }

    public static getClassesByKey(key: string, onNext: (classes: Class[]) => void) { }

    public static getAttendingClasses(
        user_id: string,
        onNext: (classes: Class[]) => void
      ) {
      // SQL query to fetch class information, including tutor, major, and class level details
        const sql = `SELECT 
                    JSON_OBJECT(
                          'id', classes.id ,
                          'title', classes.title ,
                          'description', classes.description,
                          'price', classes.price,
                          'class_creation_fee', classes.class_creation_fee,
                          'max_learners', classes.max_learners,
                          'started_at', classes.started_at,
                          'ended_at', classes.ended_at,
                          'created_at', classes.created_at,
                          'updated_at', classes.updated_at,
                          'address_1', classes.address_1,
                          'address_2', classes.address_2,
                          'address_3', classes.address_3,
                          'address_4', classes.address_4
                      ) AS class,
                      JSON_OBJECT(
                          'id', users.id,
                          'name', users.full_name,
                          'email', users.email,
                          'phone_number', users.phone_number,
                          'avatar', JSON_OBJECT(
                                      'id', files_tutor.id,
                                      'name', files_tutor.name,
                                      'path', files_tutor.path
                                  )
                      ) AS tutor,
                      JSON_OBJECT(
                          'id', majors.id,
                          'vn_name', majors.vn_name,
                          'en_name', majors.en_name,
                          'ja_name', majors.ja_name,
                          'icon', JSON_OBJECT(
                                      'id', files_major.id,
                                      'name', files_major.name,
                                      'path', files_major.path
                                  )
                      ) AS major,
                      JSON_OBJECT(
                          'id', class_levels.id,
                          'vn_name', class_levels.vn_name,
                          'en_name', class_levels.en_name,
                          'ja_name', class_levels.ja_name
                      ) AS class_level
                  FROM classes
                  INNER JOIN users ON users.id = classes.tutor_id
                  LEFT JOIN majors ON majors.id = classes.major_id
                  LEFT JOIN class_levels ON class_levels.id = classes.class_level_id
                  LEFT JOIN files AS files_tutor ON files_tutor.id = users.avatar_id
                  LEFT JOIN files AS files_major ON files_major.id = majors.icon_id
                  LEFT JOIN in_class_members ON in_class_members.class_id = classes.id
                  WHERE in_class_members.user_id = ?;`;
    
      // Get a database connection
        SMySQL.getConnection((connection) => {
           // Execute the SQL query with the provided user_id as a parameter
          connection?.execute<any[]>(sql, [user_id], (err, rows) => {
            if (err) {
               // If an error occurs, return an empty array to the callback
              onNext([]);
              return;
            }
    
            const classes: Class[] = [];
  
            // Iterate through each row from the query result
            rows.forEach((row) => {
              const tutor = row.tutor;
                const major = row.major;
                const class_level = row.class_level;
    
              const _class = new Class(
                row.class.id,
                row.class.title,
                row.class.description,
                major,        // Major details
                tutor,        // Tutor details
                undefined,    // Optional undefined parameter (author)
                row.class.price,
                row.class.class_creation_fee,
                class_level, // Class level details
                row.class.max_learners,
                new Date(row.class.started_at),
                new Date(row.class.ended_at),
                new Date(row.class.created_at),
                new Date(row.class.updated_at),
                row.class.address_1,
                row.class.address_2,
                row.class.address_3,
                row.class.address_4
              );
  
              // Add the created Class instance to the classes array
              classes.push(_class);
            });
    
            // SLog.log(LogType.Info, "getAttendingClasses","get Attending Classes",rows );
          
            // Return the list of classes via the callback function
            return onNext(classes);
          });
        });
      }

    public static getTeachingClasses(
      user_id: string,
      onNext: (classes: Class[]) => void
    ) {
    // SQL query to fetch class information, including tutor, major, and class level details
      const sql = `SELECT 
                  JSON_OBJECT(
                        'id', classes.id ,
                        'title', classes.title ,
                        'description', classes.description,
                        'price', classes.price,
                        'class_creation_fee', classes.class_creation_fee,
                        'max_learners', classes.max_learners,
                        'started_at', classes.started_at,
                        'ended_at', classes.ended_at,
                        'created_at', classes.created_at,
                        'updated_at', classes.updated_at,
                        'address_1', classes.address_1,
                        'address_2', classes.address_2,
                        'address_3', classes.address_3,
                        'address_4', classes.address_4
                    ) AS class,
                    JSON_OBJECT(
                        'id', users.id,
                        'name', users.full_name,
                        'email', users.email,
                        'phone_number', users.phone_number,
                        'avatar', JSON_OBJECT(
                                    'path', files_tutor.path
                                )
                    ) AS tutor,
                    JSON_OBJECT(
                        'id', majors.id,
                        'vn_name', majors.vn_name,
                        'en_name', majors.en_name,
                        'ja_name', majors.ja_name,
                        'icon', JSON_OBJECT(
                                    'path', files_major.path
                                )
                    ) AS major,
                    JSON_OBJECT(
                        'id', class_levels.id,
                        'vn_name', class_levels.vn_name,
                        'en_name', class_levels.en_name,
                        'ja_name', class_levels.ja_name
                    ) AS class_level
                FROM classes
                INNER JOIN users ON users.id = classes.tutor_id
                LEFT JOIN majors ON majors.id = classes.major_id
                LEFT JOIN class_levels ON class_levels.id = classes.class_level_id
                LEFT JOIN files AS files_tutor ON files_tutor.id = users.avatar_id
                LEFT JOIN files AS files_major ON files_major.id = majors.icon_id
                WHERE classes.tutor_id = ?;`;
  
    // Get a database connection
      SMySQL.getConnection((connection) => {
         // Execute the SQL query with the provided user_id as a parameter
        connection?.execute<any[]>(sql, [user_id], (err, rows) => {
          if (err) {
             // If an error occurs, return an empty array to the callback
            onNext([]);
            return;
          }
  
          const classes: Class[] = [];

          // Iterate through each row from the query result
          rows.forEach((row) => {
            const tutor = row.tutor;
              const major = row.major;
              const class_level = row.class_level;
  
            const _class = new Class(
              row.class.id,
              row.class.title,
              row.class.description,
              major,        // Major details
              tutor,        // Tutor details
              undefined,    // Optional undefined parameter (author)
              row.class.price,
              row.class.class_creation_fee,
              class_level, // Class level details
              row.class.max_learners,
              new Date(row.class.started_at),
              new Date(row.class.ended_at),
              new Date(row.class.created_at),
              new Date(row.class.updated_at),
              row.class.address_1,
              row.class.address_2,
              row.class.address_3,
              row.class.address_4
            );

            // Add the created Class instance to the classes array
            classes.push(_class);
          });
  
          // SLog.log(LogType.Info, "getAttendingClasses","get Attending Classes",rows );
        
          // Return the list of classes via the callback function
          return onNext(classes);
        });
      });
    }

    public static getCreatedClasses(
        user_id: string,
        onNext: (classes: Class[]) => void
      ) {
      // SQL query to fetch class information, including tutor, major, and class level details
        const sql = `SELECT 
                    JSON_OBJECT(
                          'id', classes.id ,
                          'title', classes.title ,
                          'description', classes.description,
                          'price', classes.price,
                          'class_creation_fee', classes.class_creation_fee,
                          'max_learners', classes.max_learners,
                          'started_at', classes.started_at,
                          'ended_at', classes.ended_at,
                          'created_at', classes.created_at,
                          'updated_at', classes.updated_at,
                          'address_1', classes.address_1,
                          'address_2', classes.address_2,
                          'address_3', classes.address_3,
                          'address_4', classes.address_4
                      ) AS class,
                      JSON_OBJECT(
                          'id', users.id,
                          'name', users.full_name,
                          'email', users.email,
                          'phone_number', users.phone_number,
                          'avatar', JSON_OBJECT(
                                      'path', files_tutor.path
                                  )
                      ) AS tutor,
                      JSON_OBJECT(
                          'id', majors.id,
                          'vn_name', majors.vn_name,
                          'en_name', majors.en_name,
                          'ja_name', majors.ja_name,
                          'icon', JSON_OBJECT(
                                      'path', files_major.path
                                  )
                      ) AS major,
                      JSON_OBJECT(
                          'id', class_levels.id,
                          'vn_name', class_levels.vn_name,
                          'en_name', class_levels.en_name,
                          'ja_name', class_levels.ja_name
                      ) AS class_level
                  FROM classes
                  INNER JOIN users ON users.id = classes.tutor_id
                  LEFT JOIN majors ON majors.id = classes.major_id
                  LEFT JOIN class_levels ON class_levels.id = classes.class_level_id
                  LEFT JOIN files AS files_tutor ON files_tutor.id = users.avatar_id
                  LEFT JOIN files AS files_major ON files_major.id = majors.icon_id
                  WHERE classes.author_id = ?;`;
    
      // Get a database connection
        SMySQL.getConnection((connection) => {
           // Execute the SQL query with the provided user_id as a parameter
          connection?.execute<any[]>(sql, [user_id], (err, rows) => {
            if (err) {
               // If an error occurs, return an empty array to the callback
              onNext([]);
              return;
            }
    
            const classes: Class[] = [];
  
            // Iterate through each row from the query result
            rows.forEach((row) => {
              const tutor = row.tutor;
                const major = row.major;
                const class_level = row.class_level;
    
              const _class = new Class(
                row.class.id,
                row.class.title,
                row.class.description,
                major,        // Major details
                tutor,        // Tutor details
                undefined,    // Optional undefined parameter (author)
                row.class.price,
                row.class.class_creation_fee,
                class_level, // Class level details
                row.class.max_learners,
                new Date(row.class.started_at),
                new Date(row.class.ended_at),
                new Date(row.class.created_at),
                new Date(row.class.updated_at),
                row.class.address_1,
                row.class.address_2,
                row.class.address_3,
                row.class.address_4
              );
  
              // Add the created Class instance to the classes array
              classes.push(_class);
            });
    
            // SLog.log(LogType.Info, "getAttendingClasses","get Attending Classes",rows );
          
            // Return the list of classes via the callback function
            return onNext(classes);
          });
        });
      }

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