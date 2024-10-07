import express, { Response } from 'express';
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
        return response.send("login");
    }

    public static getUser(request: express.Request, response: express.Response) {

    }

    public static changeUserPermissons(request: express.Request, response: express.Response) {

    }

   public static resetPassword(request: express.Request, response: express.Response) {

   }

   public static changePassword(request: express.Request, response: express.Response) {

   }

}