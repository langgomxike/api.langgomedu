// @ts-ignore
import express, {Response} from 'express';
import SUser from '../services/SUser';
import SResponse, {ResponseStatus} from '../services/SResponse';
import User from '../models/User';
import Message from "../models/Message";
import * as dotenv from "dotenv";
import SMessage from "../services/SMessage";
import {v4} from "uuid";
import SLog, {LogType} from "../services/SLog";
import SInformation from "../services/SInformation";
import PermissionList from "../configs/PermissionConfig";
import SPermission from "../services/SPermission";
import Permission from "../models/Permission";

export default class UserController {
    public static login(request: express.Request, response: express.Response) {
        const token: string = request?.headers?.authorization?.replace("Bearer ", "") ?? "";
        const email = request.body.email ?? "";
        const phoneNumber = request.body.phone_number ?? "";
        const password = request.body.password ?? "";

        // done
        SLog.log(LogType.Warning, "login", "check parameters", {
            email: email,
            phoneNumber: phoneNumber,
            password: password,
            token: token
        });

        const onNext = (user: User | undefined) => {
            // done
            // SLog.log(LogType.Warning, "Login", "onNext", user);

            if (!user) {
                SLog.log(LogType.Error, "Login", "login failed. User not found");
                SResponse.getResponse(
                    ResponseStatus.Internal_Server_Error,
                    user,
                    "Login with parameters failed. User not found",
                    response
                );
                return;
            }

            if (password && user.password !== password) {
                SLog.log(LogType.Error, "Login", "login failed. Password incorrect");
                SResponse.getResponse(
                    ResponseStatus.Internal_Server_Error,
                    null,
                    "Login with parameters failed. Password is incorrect",
                    response
                );
            } else {
                onProcess(user);
            }
        }

        const onProcess = (user: User) => {
            //save message
            dotenv.config();
            const message = new Message();
            message.from_user = new User(process.env.ADMIN_ID, process.env.ADMIN_NAME, "***", "***", "***");
            message.to_user = user;
            message.content = "Login in successfully";
            message.created_at = new Date().getTime();

            //update user's token
            const updatedUser = new User(user.id);
            const token = v4();
            updatedUser.token = token;
            //then store a new message as notification
            SUser.updateUserInfo(updatedUser,
                () => SMessage.storeMessage(message, () => {
                        //response
                        user.token = token;
                        SLog.log(LogType.Warning, "Login", "login successfully", message);
                        SResponse.getResponse(
                            ResponseStatus.OK,
                            user,
                            "Login successfully",
                            response
                        );
                    }
                ));
        }

        if (token) { //implicitly login
            SUser.getUserByToken(token, onNext);
        } else { //login with parameters
            //done
            if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
                    .test(email) &&
                !/^\s*(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?\s*$/
                    .test(phoneNumber)
            ) {
                SLog.log(LogType.Error, "login", "Login failed. Invalid Email or Phone Number");
                SResponse.getResponse(
                    ResponseStatus.Internal_Server_Error,
                    null,
                    "Login failed. Invalid Email or Phone Number",
                    response
                );
                return;
            }

            if (!/(?=^.{6,}$)(?=.*[0-9])(?=.*[A-Z]).*/.test(password)) {
                SLog.log(LogType.Error, "login", "Login failed. Invalid password");
                SResponse.getResponse(
                    ResponseStatus.Internal_Server_Error,
                    null,
                    "Login failed. Invalid password",
                    response
                );
                return;
            }

            if (email) {
                SUser.getUserByEmail(email, onNext);
            } else if (phoneNumber) {
                SUser.getUserByPhoneNumber(phoneNumber, onNext);
            }
        }
    }

    public static registerUser(request: express.Request, response: express.Response) {
        const user: User = request?.body?.user;

        if (!user || !user.id || !user.email || !user.password || !user.phone_number || !user.full_name || !user.information || !user.avatar) {
            SLog.log(LogType.Error, "registerUser", "Invalid user");
            SResponse.getResponse(ResponseStatus.Internal_Server_Error, {}, "Invalid user", response);
            return;
        }

        SUser.storeUser(user, (result) => {
            if (!result) {
                SLog.log(LogType.Error, "registerUser", "Fail to store user");
                SResponse.getResponse(ResponseStatus.Internal_Server_Error, {}, "Fail to store user", response);
                return;
            }

            //add permissions
            const permissions = [
                PermissionList.DELETE_PERSONAL_CLASS,
                PermissionList.CREATE_NEW_PERSONAL_CLASS,
                PermissionList.CREATE_NEW_REPORT_USER,
                PermissionList.CREATE_NEW_CV,
                PermissionList.CREATE_NEW_REPORT_CLASS,
                PermissionList.CREATE_NEW_USER_INFORMATION,
                PermissionList.UPDATE_CV,
                PermissionList.UPDATE_USER_INFORMATION,
                PermissionList.UPDATE_PERSONAL_CLASS,
                PermissionList.UPDATE_REPORT_CLASS,
                PermissionList.VIEW_CV,
                PermissionList.VIEW_CERTIFICATE_LIST,
                PermissionList.VIEW_OTHER_USER_CLASS_LIST,
                PermissionList.VIEW_PERSONAL_CLASS,
                PermissionList.VIEW_OTHER_USER_CLASS_LIST,
                PermissionList.VIEW_OTHER_USER_CLASS,
                PermissionList.VIEW_USER_INFORMATION,
            ];
            const userPermissions: Permission[] = [];

            permissions.forEach(permission => {
                userPermissions.push(new Permission(permission, PermissionList[permission]));
            });

            SPermission.addPermissionsToUser(user.id, userPermissions, result => {
                if (!result) {
                    SLog.log(LogType.Error, "registerUser", "Fail to add permissions to user");
                    SResponse.getResponse(ResponseStatus.Internal_Server_Error, {}, "Fail to add permissions to user", response);
                    return;
                }
                request.body.email = user.email;
                request.body.password = user.password;

                UserController.login(request, response);
            });
        });
    }

    public static registerAdmin(request: express.Request, response: express.Response) {
        return response.send("login");
    }

    public static auth(request: express.Request, response: express.Response) {
        return response.send("login");
    }

    public static getUserInfo(request: express.Request, response: express.Response) {
        const id: string = request?.params?.id;

        if (!id) {
            SLog.log(LogType.Error, "getUserInfo", "Invalid ID");
            SResponse.getResponse(ResponseStatus.Internal_Server_Error, {}, "Invalid ID", response);
            return;
        }

        SUser.getUserById(id, (user: User | undefined) => {
            if (!user) {
                SLog.log(LogType.Error, "getUserInfo", "User not found");
                SResponse.getResponse(ResponseStatus.Not_Found, {}, "User not found", response);
                return;
            }

            SResponse.getResponse(ResponseStatus.OK, user, "get user info", response);
        });
    }

    public static updateUserInfo(request: express.Request, response: express.Response) {
        const user: User = request?.body?.user;

        if (!user || !user.id || !(user.full_name || user.email || user.phone_number || user.password || user.information || user.avatar || user.role)) {
            SLog.log(LogType.Error, "updateUserInfo", "Invalid user");
            SResponse.getResponse(ResponseStatus.Internal_Server_Error, {}, "Invalid user", response);
            return;
        }

        const mainUpdate = () => {
            SUser.updateUserInfo(user, (result) => {
                if (!result) {
                    SLog.log(LogType.Error, "updateUserInfo", "Fail to update user info");
                    SResponse.getResponse(ResponseStatus.Internal_Server_Error, {}, "Fail to update user info", response);
                    return;
                }

                SResponse.getResponse(ResponseStatus.OK, {}, "update user info", response);
            });
        }

        if (user.information) {
            SInformation.updateInformation(user.information, mainUpdate);
        } else {
            mainUpdate();
        }
    }

    public static deleteAccount(request: express.Request, response: express.Response) {
        const id = request?.params?.id;

        if (!id) {
            SLog.log(LogType.Error, "deleteAccount", "Invalid ID");
            SResponse.getResponse(ResponseStatus.Internal_Server_Error, {}, "Invalid ID", response);
            return;
        }

        SUser.softDeleteUser(id, (result) => {
            if (!result) {
                SLog.log(LogType.Error, "deleteAccount", "Fail to delete user");
                SResponse.getResponse(ResponseStatus.Internal_Server_Error, {}, "Fail to delete user", response);
                return;
            }

            SResponse.getResponse(ResponseStatus.OK, {}, "delete user", response);
        });
    }

    public static getAllUsers(request: express.Request, response: express.Response) {
        SUser.getAllUsers((users) => {
            SResponse.getResponse(ResponseStatus.OK, users, "get all users", response);
        });
    }

    public static changeUserPermissions(request: express.Request, response: express.Response) {

    }

    public static resetPassword(request: express.Request, response: express.Response) {

    }

    public static changePassword(request: express.Request, response: express.Response) {

    }

}