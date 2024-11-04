import SLog, { LogType } from "../services/SLog";
import SMySQL from "../services/SMySQL"; // Importing the SMySQL service for database operations

// Enum to define different types of permissions with unique numeric values
enum PermissionList {
    VIEW_APP_COMMON_INFORMATION = 1,
    UPDATE_APP_COMMON_INFORMATION = 2,

    VIEW_MAJOR_LIST = 3,
    CREATE_NEW_MAJOR = 4,
    UPDATE_MAJOR = 5,
    DELETE_MAJOR = 6,

    VIEW_SKILL_LIST = 7,
    CREATE_NEW_SKILL = 8,
    UPDATE_SKILL = 9,
    DELETE_SKILL = 10,

    VIEW_CERTIFICATE_LIST = 11,
    CREATE_NEW_CERTIFICATE = 12,
    UPDATE_CERTIFICATE = 13,
    DELETE_CERTIFICATE = 14,

    VIEW_USER_INFORMATION_LIST = 15,
    VIEW_USER_INFORMATION = 16,
    CREATE_NEW_USER_INFORMATION = 17,
    UPDATE_USER_INFORMATION = 18,
    DELETE_USER_INFORMATION = 19,

    VIEW_OTHER_USER_INFORMATION = 20,
    CREATE_NEW_OTHER_USER_INFORMATION = 21,
    UPDATE_OTHER_USER_INFORMATION = 22,
    DELETE_OTHER_USER_INFORMATION = 23,

    VIEW_REPORT_USER_LIST = 24,
    VIEW_REPORT_USER = 25,
    CREATE_NEW_REPORT_USER = 26,
    UPDATE_REPORT_USER = 27,
    DELETE_REPORT_USER = 28,

    VIEW_REPORT_CLASS_LIST = 29,
    VIEW_REPORT_CLASS = 30,
    CREATE_NEW_REPORT_CLASS = 31,
    UPDATE_REPORT_CLASS = 32,
    DELETE_REPORT_CLASS = 33,

    VIEW_REQUESTED_CLASS_LIST = 34,
    VIEW_REQUESTED_CLASS = 35,
    UPDATE_REQUESTED_CLASS = 36,

    VIEW_PERSONAL_CLASS_LIST = 37,
    VIEW_PERSONAL_CLASS = 38,
    CREATE_NEW_PERSONAL_CLASS = 39,
    UPDATE_PERSONAL_CLASS = 40,
    DELETE_PERSONAL_CLASS = 41,

    VIEW_OTHER_USER_CLASS_LIST = 42,
    VIEW_OTHER_USER_CLASS = 43,
    UPDATE_OTHER_USER_CLASS = 44,
    DELETE_OTHER_USER_CLASS = 45,

    VIEW_CV_LIST = 46,
    VIEW_CV = 47,
    CREATE_NEW_CV = 48,
    UPDATE_CV = 49,
    DELETE_CV = 50,
}

// Function to set up permissions in the database by inserting permission records into the "permissions" table.
// It first clears the existing data in the table and then populates it with new permissions derived from the PermissionList enum.
export function setUpPermissions() {
    // Convert the PermissionList enum to an array of objects with "id" and "permission" properties
    const permissions = Object.entries(PermissionList)
        .filter(([key, value]) => isNaN(Number(key))) // Filter out numeric keys from the enum (which result from TypeScript's reverse mapping)
        .map(([key, value]) => ({ permission: key, id: value })); // Map to an array of objects containing "id" and "permission" properties

    // SLog.log(LogType.Info, "setUpPermissions", "show permissions converted from enum to array", permissions);

    // Establish a connection to the MySQL database using SMySQL service
    SMySQL.getConnection(connection => {
        const truncateSQL = "TRUNCATE TABLE permissions"; // SQL command to clear all data from the "permissions" table
        connection?.execute(truncateSQL); // Execute the truncate command to reset the table

        // SQL query template for inserting a new permission record into the "permissions" table 
        const sql = "INSERT INTO permissions (`id`, `permission`) VALUES (?,?)";

        // Iterate over each permission object and execute the SQL query to insert it into the database
        permissions.forEach(permission => {
            connection?.execute(sql, [permission.id, permission.permission]); // Insert permission record using the provided values
        });
    });
}

// Export the PermissionList enum as the default export
export default PermissionList;