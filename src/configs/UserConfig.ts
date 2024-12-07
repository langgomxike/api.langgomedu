import SMySQL from "../services/SMySQL";
import SUser from "../services/SUser";
import User from "../models/User";
import Role from "../models/Role";
import RoleConfig, {RoleList} from "./RoleConfig";
import * as dotenv from "dotenv";
import {v4} from "uuid";
import SRole from "../services/SRole";

export function setUpUsers() {
    dotenv.config();

    SMySQL.getConnection(connection => {
        const ADMIN_ID = process.env.ADMIN_ID;
        const deleteSQL = "DELETE FROM users WHERE id = ?";
        connection?.execute(deleteSQL, [ADMIN_ID ?? ""]);

        const token = v4();

        const user = new User();
        user.roles = [new Role(RoleConfig.SUPER_ADMIN, RoleConfig[RoleConfig.SUPER_ADMIN])];
        user.id = ADMIN_ID ?? "";
        user.full_name = process.env.ADMIN_NAME ?? "";
        user.username = process.env.ADMIN_USERNAME ?? "";
        user.phone_number = process.env.ADMIN_PHONE_NUMBER ?? "";
        user.password = process.env.ADMIN_PASSWORD ?? "";
        user.token = token ?? "";

        SUser.storeUser(user, () => {
            SRole.addRolesToUser(user.id, [
                new Role(RoleList.USER, RoleList[RoleList.USER]),
                new Role(RoleList.BANNED_USER, RoleList[RoleList.BANNED_USER]),
                new Role(RoleList.ADMIN, RoleList[RoleList.ADMIN]),
                new Role(RoleList.SUPER_ADMIN, RoleList[RoleList.SUPER_ADMIN]),
            ], () => {});
        });
    });
}
