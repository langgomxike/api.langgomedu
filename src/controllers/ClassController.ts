import express, { Response } from 'express';
export default class ClassController {
    public static login(request: express.Request, response: express.Response): Response<any, Record<string, any>> {
        return response.send("login");
    }

    public static register(request: express.Request, response: express.Response): Response<any, Record<string, any>> {
        return response.send("login");
    }

    public static auth(request: express.Request, response: express.Response): Response<any, Record<string, any>> {
        return response.send("login");
    }

    public static updateUserInfo(request: express.Request, response: express.Response): Response<any, Record<string, any>> {
        return response.send("login");
    }

    public static deleteAccount(request: express.Request, response: express.Response): Response<any, Record<string, any>> {
        return response.send("login");
    }

    public static getAllUsers(request: express.Request, response: express.Response): Response<any, Record<string, any>> {
        return response.send("login");
    }

    public static getUserInfo(request: express.Request, response: express.Response): Response<any, Record<string, any>> {
        return response.send("login");
    }

}