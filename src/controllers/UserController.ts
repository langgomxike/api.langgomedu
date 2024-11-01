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
            updatedUser.token = v4();
            //then store a new message as notification
            SUser.updateUserInfo(updatedUser,
                () => SMessage.storeMessage(message, () => {
                        //response
                        user.token = updatedUser.token;
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
        return response.send("login");
    }

    public static registerAdmin(request: express.Request, response: express.Response) {
        return response.send("login");
    }

    public static auth(request: express.Request, response: express.Response) {
        return response.send("login");
    }

    public static getUserInfo(request: express.Request, response: express.Response) {
        return response.send("login");
    }

    public static updateUserInfo(request: express.Request, response: express.Response) {
        return response.send("login");
    }

    public static deleteAccount(request: express.Request, response: express.Response) {
        return response.send("login");
    }

    public static getAllUsers(request: express.Request, response: express.Response) {
        SUser.getAllUsers((users) => {
            SResponse.getResponse(ResponseStatus.OK, users, "get all users", response);
        });
    }

    public static getUser(request: express.Request, response: express.Response) {

    }

    public static changeUserPermissions(request: express.Request, response: express.Response) {

    }

    public static resetPassword(request: express.Request, response: express.Response) {

    }

    public static changePassword(request: express.Request, response: express.Response) {

    }

}