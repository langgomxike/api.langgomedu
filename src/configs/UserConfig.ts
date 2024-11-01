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
        connection?.execute(deleteSQL, [ADMIN_ID]);

        const token = v4();

        const user = new User(ADMIN_ID, process.env.ADMIN_NAME, process.env.ADMIN_EMAIL, process.env.ADMIN_PHONE_NUMBER, process.env.ADMIN_PASSWORD, token, new Date().getTime());
        user.role = new Role(RoleConfig.SUPER_ADMIN_ROLE, RoleConfig[RoleConfig.SUPER_ADMIN_ROLE]);

        SUser.storeUser(user, () => {});
    });
}
