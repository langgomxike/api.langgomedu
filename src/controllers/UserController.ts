import express, { Response } from 'express';
import SUser from '../services/SUser';
import UserDTO from './../dtos/UserDTO';
import SResponse, { ResponseStatus } from '../services/SResponse';
import SLog, { LogType } from '../services/SLog';
export default class UserController {
    public static login(request: express.Request, response: express.Response) {
        return response.send("login");
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
            const userDTOs: UserDTO[] = [];

            users.forEach(user => {
                const userDTO = new UserDTO(user);
                userDTOs.push(userDTO);
            });

            SLog.log(LogType.Info, "getAllUsers", "users", users);
            SLog.log(LogType.Info, "getAllUsers", "userDTOs", userDTOs);

            return response.json(SResponse.getResponse(ResponseStatus.OK, userDTOs, "get all users", response));
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