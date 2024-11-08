// @ts-ignore
// @ts-ignore
import express from "express";
import SUser from "../services/SUser";
import SResponse, {ResponseStatus} from "../services/SResponse";
import SLog, {LogType} from "../services/SLog";
import SMessage from "../services/SMessage";
import Message from "../models/Message";
import User from "../models/User";
import SUser from "../services/SUser";
import SResponse, {ResponseStatus} from "../services/SResponse";
import SLog, {LogType} from "../services/SLog";
import SMessage from "../services/SMessage";
import Message from "../models/Message";

export default class MessageController {
    public static getContacts(request: express.Request, response: express.Response) {
        const token: string = request?.headers?.authorization?.replace("Bearer ", "") ?? "";

        SUser.getUserByToken(token, (user) => {
            if (!user) {
                SLog.log(LogType.Error, "getContacts", "User not found");
                SResponse.getResponse(ResponseStatus.Unauthorized, null, "Invalid token", response);
                return;
            }

            SLog.log(LogType.Info, "getContacts", "get contacts successfully");
            SUser.getContactUsers(user.id, (inboxes) => {
                SResponse.getResponse(ResponseStatus.OK, inboxes, "get contacts", response);
            });
        });
        const token: string = request?.headers?.authorization?.replace("Bearer ", "") ?? "";

        SUser.getUserByToken(token, (user) => {
            if (!user) {
                SLog.log(LogType.Error, "getContacts", "User not found");
                SResponse.getResponse(ResponseStatus.Unauthorized, null, "Invalid token", response);
                return;
            }

            SLog.log(LogType.Info, "getContacts", "get contacts successfully");
            SUser.getContactUsers(user.id, (inboxes) => {
                SResponse.getResponse(ResponseStatus.OK, inboxes, "get contacts", response);
            });
        });
    }

    public static getInboxUsers(request: express.Request, response: express.Response) {
        const token: string = request?.headers?.authorization?.replace("Bearer ", "") ?? "";

        SUser.getUserByToken(token, (user) => {
            if (!user) {
                SLog.log(LogType.Error, "getInboxUsers", "User not found");
                SResponse.getResponse(ResponseStatus.Unauthorized, null, "Invalid token", response);
                return;
            }

            SLog.log(LogType.Info, "getInboxUsers", "get inboxes successfully");
            SMessage.getInboxes(user.id, (inboxes) => {
                SResponse.getResponse(ResponseStatus.OK, inboxes, "get inboxes successfully", response);
            });
        });
        const token: string = request?.headers?.authorization?.replace("Bearer ", "") ?? "";

        SUser.getUserByToken(token, (user) => {
            if (!user) {
                SLog.log(LogType.Error, "getInboxUsers", "User not found");
                SResponse.getResponse(ResponseStatus.Unauthorized, null, "Invalid token", response);
                return;
            }

            SLog.log(LogType.Info, "getInboxUsers", "get inboxes successfully");
            SMessage.getInboxes(user.id, (inboxes) => {
                SResponse.getResponse(ResponseStatus.OK, inboxes, "get inboxes successfully", response);
            });
        });
    }

    public static getMessages(request: express.Request, response: express.Response) {
        const token: string = request?.headers?.authorization?.replace("Bearer ", "")?? "";
        const fromUser : User = request?.body?.from_user ;
        const toUser : User = request?.body?.to_user;
        const batch: number = parseInt(request?.query?.batch?? "1");

        if (!fromUser || !toUser) {
            SLog.log(LogType.Info, "getMessages", "get messages unsuccessfully", "Cannot get the from_user or to_user");
            SResponse.getResponse(ResponseStatus.Internal_Server_Error, null, "Cannot get the from user or to user", response);
            return;
        }

        SUser.getUserByToken(token, (user) => {
            if (!user) {
                SLog.log(LogType.Error, "getMessages", "User not found");
                SResponse.getResponse(ResponseStatus.Unauthorized, null, "Invalid token", response);
                return;
            }

            SMessage.getMessages(fromUser.id, toUser.id, batch, (messages) => {
                SResponse.getResponse(ResponseStatus.OK, messages, "get messages successfully", response);
            });
        });
    }

    public static createMessage(request: express.Request, response: express.Response) {
        const token: string = request?.headers?.authorization?.replace("Bearer ", "") ?? "";
        const message: Message = request?.body?.message;

        if (!message) {
            SLog.log(LogType.Info, "createMessage", "create message unsuccessfully", "Cannot get the message");
            SResponse.getResponse(ResponseStatus.Internal_Server_Error, null, "Cannot get the message", response);
            return;
        }

        SUser.getUserByToken(token, (user) => {
            if (!user) {
                SLog.log(LogType.Error, "createMessage", "User not found");
                SResponse.getResponse(ResponseStatus.Unauthorized, null, "Invalid token", response);
                return;
            }

            SMessage.storeMessage(message, (result) => {
                if (result) {
                    SLog.log(LogType.Info, "createMessage", "create message successfully");
                    SResponse.getResponse(ResponseStatus.OK, null, "Message sent successfully", response);
                } else {
                    SLog.log(LogType.Info, "createMessage", "create message unsuccessfully");
                    SResponse.getResponse(ResponseStatus.Internal_Server_Error, null, "Create message unsuccessfully", response);
                }
            });
        });
        const token: string = request?.headers?.authorization?.replace("Bearer ", "") ?? "";
        const message: Message = request?.body?.message;

        SUser.getUserByToken(token, (user) => {
            if (!user) {
                SLog.log(LogType.Error, "createMessage", "User not found");
                SResponse.getResponse(ResponseStatus.Unauthorized, null, "Invalid token", response);
                return;
            }

            SMessage.storeMessage(message, (result) => {
                if (result) {
                    SLog.log(LogType.Info, "createMessage", "create message successfully");
                    SResponse.getResponse(ResponseStatus.OK, null, "Message sent successfully", response);
                } else {
                    SLog.log(LogType.Info, "createMessage", "create message unsuccessfully");
                    SResponse.getResponse(ResponseStatus.Internal_Server_Error, null, "Failed", response);
                }
            });
        });
    }

    public static deleteMessage(request: express.Request, response: express.Response) {
        const token: string = request?.headers?.authorization?.replace("Bearer ", "") ?? "";
        const message: Message = request?.body?.message;

        if (!message) {
            SLog.log(LogType.Error, "deleteMessage", "delete message unsuccessfully");
            SResponse.getResponse(ResponseStatus.Internal_Server_Error, null, "Message deleted unsuccessfully. Invalid message", response);
            return;
        }

        SUser.getUserByToken(token, (user) => {
            if (!user) {
                SLog.log(LogType.Error, "deleteMessage", "User not found");
                SResponse.getResponse(ResponseStatus.Unauthorized, null, "Invalid token", response);
                return;
            }

            SMessage.deleteMessage(message, (result) => {
                if (result) {
                    SLog.log(LogType.Info, "deleteMessage", "delete message successfully");
                    SResponse.getResponse(ResponseStatus.OK, null, "Message deleted successfully", response);
                } else {
                    SLog.log(LogType.Error, "deleteMessage", "delete message unsuccessfully");
                    SResponse.getResponse(ResponseStatus.Internal_Server_Error, null, "Message deleted unsuccessfully", response);
                }
            });
        });
    }
        const token: string = request?.headers?.authorization?.replace("Bearer ", "") ?? "";
        const id: number = parseInt(request?.params?.id ?? "-1");
        const fromUserStatus: boolean = request?.body?.from_user_status ?? true;
        const toUserStatus: boolean = request?.body?.to_user_status ?? true;

        SUser.getUserByToken(token, (user) => {
            if (!user) {
                SLog.log(LogType.Error, "deleteMessage", "User not found");
                SResponse.getResponse(ResponseStatus.Unauthorized, null, "Invalid token", response);
                return;
            }

            SMessage.deleteMessage(id, fromUserStatus, toUserStatus, (result) => {
                if (result) {
                    SLog.log(LogType.Info, "deleteMessage", "delete message successfully");
                    SResponse.getResponse(ResponseStatus.OK, null, "Message deleted successfully", response);
                } else {
                    SLog.log(LogType.Error, "deleteMessage", "delete message unsuccessfully");
                    SResponse.getResponse(ResponseStatus.Internal_Server_Error, null, "Message deleted unsuccessfully", response);
                }
            });
        });
    }
}