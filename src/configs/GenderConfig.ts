import SLog, { LogType } from "../services/SLog"; // Importing logging service for logging operations
import SMySQL from "../services/SMySQL"; // Importing the SMySQL service for database operations
import genderJsonData from "../datas/genders.json"; // Importing JSON data for gender translations

// Enum to define different types of genders with unique numeric values
enum GenderList {
    MALE = 1, // Male gender identifier
    FEMALE = 2, // Female gender identifier
    OTHER = 3 // Other gender identifier
}

// Function to set up genders in the database by inserting gender records into the "genders" table.
// It first clears the existing data in the table and then populates it with new genders derived from the GenderList enum.
export function setUpGenders() {
    // Convert the GenderList enum to an array of gender IDs
    const genders = Object.entries(GenderList)
        .filter(([key, value]) => isNaN(Number(key))) // Filter out numeric keys from the enum (which result from TypeScript's reverse mapping)
        .map(([key, value]) => (value)); // Map to an array of IDs

    // Optionally log the converted gender IDs for debugging purposes
    // SLog.log(LogType.Info, "setUpPermissions", "show genders converted from enum to array", genders);

    // Establish a connection to the MySQL database using SMySQL service
    SMySQL.getConnection(connection => {
        const truncateSQL = "TRUNCATE TABLE genders"; // SQL command to clear all data from the "genders" table
        connection?.execute(truncateSQL); // Execute the truncate command to reset the table

        // SQL query template for inserting a new gender record into the "genders" table 
        const sql = "INSERT INTO `genders`(`id`, `vn_gender`, `en_gender`, `ja_gender`) VALUES (?,?,?,?)";

        // Iterate over each gender ID and execute the SQL query to insert it into the database
        genders.forEach(id => {
            // Find the corresponding gender data from the imported JSON based on the gender ID
            const gender = genderJsonData.find(g => g.id === id);
            // Insert the gender record into the database using the values from the JSON
            connection?.execute(sql, [gender?.id, gender?.vn_gender, gender?.en_gender, gender?.ja_gender]); // Insert gender record using the provided values
        });
    });
}

// Export the GenderList enum as the default export to be used in other modules
export default GenderList;
