import SMySQL from "../services/SMySQL"; // Importing the SMySQL service for database operations

export enum RoleList {
  SUPER_ADMIN = 1,
  ADMIN = 2,
  USER = 3,
  TUTOR = 4,
  PARENT = 5,
  CHILD = 6,
  BANNED_USER = 7,
}

export function setUpRoles() {
  const roles = Object.entries(RoleList)
    .filter(([key, value]) => isNaN(Number(key)))
    .map(([key, value]) => ({name: key, id: value}));

  SMySQL.getConnection(connection => {
    const truncateSQL = `DELETE FROM roles WHERE id IN (${roles.map(r => r.id).join(",")})`; // SQL command to clear all data from the "roles" table
    connection?.execute(truncateSQL); // Execute the truncate command to reset the table

    const sql = "INSERT INTO roles (`id`, `name`) VALUES (?,?)";

    roles.forEach(role => {
      connection?.execute(sql, [role.id, role.name]);
    });
  });
}

// Export the PermissionList enum as the default export
export default RoleList;