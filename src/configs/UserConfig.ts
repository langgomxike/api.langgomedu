import SMySQL from "../services/SMySQL";
import SUser from "../services/SUser";
import User from "../models/User";
import Role from "../models/Role";
import RoleConfig from "./RoleConfig";
import * as dotenv from "dotenv";
import {v4} from "uuid";

export function setUpUsers() {
    dotenv.config();

    SMySQL.getConnection(connection => {
        const ADMIN_ID = process.env.ADMIN_ID;
        const deleteSQL = "DELETE FROM users WHERE id = ?";
        connection?.execute(deleteSQL, [ADMIN_ID ?? ""]);

        const token = v4();

        const user = new User();
        user.role = new Role(RoleConfig.SUPER_ADMIN_ROLE, RoleConfig[RoleConfig.SUPER_ADMIN_ROLE]);
        user.id = ADMIN_ID;
        user.full_name = process.env.ADMIN_NAME;
        user.email = process.env.ADMIN_EMAIL;
        user.phone_number = process.env.ADMIN_PHONE_NUMBER;
        user.password = process.env.ADMIN_PASSWORD;
        user.token = token;

        SUser.storeUser(user, () => {});
    });
}
