import express, { Response } from 'express';
import SUser from '../services/SUser';
import SResponse, { ResponseStatus } from '../services/SResponse';
import SLog, { LogType } from '../services/SLog';
import User from '../models/User';
export default class UserController {
    public static login(request: express.Request, response: express.Response) {
        const token: string = request?.headers?.authorization?.replace("Bearer ", "") ?? "";

        const onNext = (user: User | undefined) => {
            SResponse.getResponse(
                (!user ? ResponseStatus.Internal_Server_Error : ResponseStatus.OK),
                user,
                "Login with token " + (!user ? "failed" : "successfully"),
                response
            );
            return;
        }

        const onNextWithPasswordProcessing = (user: User | undefined, password: string) => {
            if (!user) {
                SResponse.getResponse(
                    ResponseStatus.Internal_Server_Error,
                    user,
                    "Login with parameters failed. User not found",
                    response
                );
                return;
            }

            SUser.checkUserPassword(user.id, password, (result) => {
                if (result) {
                    SResponse.getResponse(
                        ResponseStatus.OK,
                        user,
                        "Login with parameters successfully",
                        response
                    );
                    return;
                } else {
                    SResponse.getResponse(
                        ResponseStatus.Internal_Server_Error,
                        user,
                        "Login with parameters failed. Password is incorrect",
                        response
                    );
                    return;
                }
            });
        }

        if (token) { //implicitly login
            SUser.getUserByToken(token, onNext);
        } else { //login with parameters
            const email = request.body.email ?? "";
            const phoneNumber = request.body.phone_number ?? "";
            const password = request.body.password ?? "";

            if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
                .test(email) &&
                !/^\s*(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?\s*$/
                    .test(phoneNumber)
            ) {
                SResponse.getResponse(
                    ResponseStatus.Internal_Server_Error,
                    null,
                    "Login failed. Invalid Email or Phone Number",
                    response
                );
                return;
            }

            if (!/(?=^.{6,}$)(?=.*[0-9])(?=.*[A-Z]).*/.test(password)) {
                SResponse.getResponse(
                    ResponseStatus.Internal_Server_Error,
                    null,
                    "Login failed. Invalid password",
                    response
                );
                return;
            }

            if (email) {
                SUser.getUserByEmail(email, (user) => onNextWithPasswordProcessing(user, password));
            } else if (phoneNumber) {
                SUser.getUserByPhoneNumber(phoneNumber, (user) => onNextWithPasswordProcessing(user, password));
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
        // SUser.getAllUsers((users) => {
        //     const userDTOs: UserDTO[] = [];

        //     users.forEach(user => {
        //         const userDTO = new UserDTO(user);
        //         userDTOs.push(userDTO);
        //     });

        //     SLog.log(LogType.Info, "getAllUsers", "users", users);
        //     SLog.log(LogType.Info, "getAllUsers", "userDTOs", userDTOs);

        //     return response.json(SResponse.getResponse(ResponseStatus.OK, userDTOs, "get all users", response));
        // });
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