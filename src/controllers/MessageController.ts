// @ts-ignore
import express from "express";
import SUser from "../services/SUser";
import SResponse, {ResponseStatus} from "../services/SResponse";
import SLog, {LogType} from "../services/SLog";
import SMessage from "../services/SMessage";
import Message from "../models/Message";
import User from "../models/User";
import Class from "../models/Class";

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
      SUser.getContactUsers(user.id, (contacts) => {
        SResponse.getResponse(ResponseStatus.OK, contacts, "get contacts", response);
      });
    });
  }

  public static getNotifications(request: express.Request, response: express.Response) {
    const token: string = request?.headers?.authorization?.replace("Bearer ", "") ?? "";

    SUser.getUserByToken(token, (user) => {
      if (!user) {
        SLog.log(LogType.Error, "getNotifications", "User not found");
        SResponse.getResponse(ResponseStatus.Unauthorized, null, "Invalid token", response);
        return;
      }

      SLog.log(LogType.Info, "getNotifications", "get notifications successfully");
      SMessage.getAllNotifications(user.id, (contacts) => {
        SResponse.getResponse(ResponseStatus.OK, contacts, "get notifications", response);
      });
    });
  }

  public static deleteNotification(request: express.Request, response: express.Response) {
    const token: string = request?.headers?.authorization?.replace("Bearer ", "") ?? "";
    const id: number = request?.params?.id ?? -1;

    SUser.getUserByToken(token, (user) => {
      if (!user) {
        SLog.log(LogType.Error, "request", "User not found");
        SResponse.getResponse(ResponseStatus.Unauthorized, null, "Invalid token", response);
        return;
      }

      SLog.log(LogType.Info, "request", "delete notifications successfully");
      SMessage.deleteNotifications(id, user.id, (result) => {
        SResponse.getResponse(ResponseStatus.OK, result, "delete notifications", response);
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
  }

  public static getInboxClasses(request: express.Request, response: express.Response) {
    const token: string = request?.headers?.authorization?.replace("Bearer ", "") ?? "";

    SUser.getUserByToken(token, (user) => {
      if (!user) {
        SLog.log(LogType.Error, "getInboxUsers", "User not found");
        SResponse.getResponse(ResponseStatus.Unauthorized, null, "Invalid token", response);
        return;
      }

      SLog.log(LogType.Info, "getInboxUsers", "get inboxes successfully");
      SMessage.getGroupInboxes(user.id, (inboxes) => {
        SResponse.getResponse(ResponseStatus.OK, inboxes, "get inboxes successfully", response);
      });
    });
  }

  public static getMessages(request: express.Request, response: express.Response) {
    const token: string = request?.headers?.authorization?.replace("Bearer ", "") ?? "";

    const fromUser: User = request?.body?.from_user;
    const toUser: User = request?.body?.to_user;
    const batch: number = parseInt(request?.query?.batch ?? "100");

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

      SMessage.getMessages(user.id === fromUser.id, fromUser.id, toUser.id, batch, (messages) => {
        SResponse.getResponse(ResponseStatus.OK, messages, "get messages successfully", response);
      });
    });
  }

  public static getClassMessages(request: express.Request, response: express.Response) {
    const token: string = request?.headers?.authorization?.replace("Bearer ", "") ?? "";
    const classId: number = request?.params?.id ?? -1;

    if (!classId) {
      SLog.log(LogType.Info, "getMessages", "get messages unsuccessfully", "Cannot get the class");
      SResponse.getResponse(ResponseStatus.Internal_Server_Error, null, "Cannot get the class", response);
      return;
    }

    SUser.getUserByToken(token, (user) => {
      if (!user) {
        SLog.log(LogType.Error, "getMessages", "User not found");
        SResponse.getResponse(ResponseStatus.Unauthorized, null, "Invalid token", response);
        return;
      }

      SMessage.getClassMessages(classId, (messages) => {
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
  }

  public static sendNotifications(request: express.Request, response: express.Response) {

    const content: string = request?.body?.content ?? "";
    let index: number = +(request?.body?.index ?? "1");
    if (index < 1 || index > 3) index = 1;
    const user_id: string = request?.body?.user_id ?? "-1";

    if (!content) {
      SLog.log(LogType.Info, "sendNotifications", "send notifications unsuccessfully", "Cannot get the content");
      SResponse.getResponse(ResponseStatus.Internal_Server_Error, null, "Cannot get the content", response);
      return;
    }

    let vnNoti = index === 1 ? content : "";
    let enNoti = index === 2 ? content : "";
    let jaNoti = index === 3 ? content : "";

    SMessage.createNotification(vnNoti, enNoti, jaNoti, user_id, (result) => {
      if (result) {
        SLog.log(LogType.Info, "sendNotifications", "send notifications successfully");
        SResponse.getResponse(ResponseStatus.OK, null, "Notifications sent successfully", response);
      } else {
        SLog.log(LogType.Info, "sendNotifications", "send notifications unsuccessfully");
        SResponse.getResponse(ResponseStatus.Internal_Server_Error, null, "Send notifications unsuccessfully", response);
      }
    });
  }

  public static createClassMessage(request: express.Request, response: express.Response) {
    const token: string = request?.headers?.authorization?.replace("Bearer ", "") ?? "";
    const message: Message = request?.body?.message;

    if (!message) {
      SLog.log(LogType.Info, "createClassMessage", "create group message unsuccessfully", "Cannot get the message");
      SResponse.getResponse(ResponseStatus.Internal_Server_Error, null, "Cannot create the group message", response);
      return;
    }

    SUser.getUserByToken(token, (user) => {
      if (!user) {
        SLog.log(LogType.Error, "createClassMessage", "User not found");
        SResponse.getResponse(ResponseStatus.Unauthorized, null, "Invalid token", response);
        return;
      }

      SMessage.storeClassMessage(message, (result) => {
        if (result) {
          SLog.log(LogType.Info, "createClassMessage", "create group message successfully");
          SResponse.getResponse(ResponseStatus.OK, null, "Message sent successfully", response);
        } else {
          SLog.log(LogType.Info, "createClassMessage", "create group message unsuccessfully");
          SResponse.getResponse(ResponseStatus.Internal_Server_Error, null, "Create group message unsuccessfully", response);
        }
      });
    });
  }

  public static createImageMessage(request: express.Request, response: express.Response) {
    const file = request?.file;

    SLog.log(LogType.Warning, "createImageMessage", "path", file.path);

    SResponse.getResponse(ResponseStatus.OK, {
      path: file?.path?.replace('public/', '')
    }, "Image message sent successfully", response);
  }

  public static markAsRead(request: express.Request, response: express.Response) {
    const fromUser: User = request?.body?.sender;
    const toUser: User = request?.body?.receiver;

    if (!fromUser || !toUser) {
      SLog.log(LogType.Info, "markAsRead", "mark as read messages unsuccessfully", "Cannot get the from_user or to_user");
      SResponse.getResponse(ResponseStatus.Internal_Server_Error, null, "Cannot get the from user or to user", response);
      return;
    }

    SMessage.markAsRead(fromUser.id, toUser.id, () => {
      SLog.log(LogType.Info, "markAsRead", "read all");
      SResponse.getResponse(ResponseStatus.OK, null, "mark as read messages successfully", response);
    });
  }

  public static markAsReadClassMessges(request: express.Request, response: express.Response) {
    const receiver: User = request?.body?.receiver;
    const _class: Class = request?.body?.class;

    if (!receiver || !_class) {
      SLog.log(LogType.Info, "markAsReadClassMessges", "mark as read messages unsuccessfully", "Cannot get the from_user or class");
      SResponse.getResponse(ResponseStatus.Internal_Server_Error, null, "Cannot get the from user or class", response);
      return;
    }

    SMessage.markAsReadClassMessages(receiver.id, _class.id, () => {
      SLog.log(LogType.Info, "markAsReadClassMessges", "read all");
      SResponse.getResponse(ResponseStatus.OK, null, "mark as read messages successfully", response);
    });
  }

  public static markAsReadNotifications(request: express.Request, response: express.Response) {
    const token: string = request?.headers?.authorization?.replace("Bearer ", "") ?? "";

    SUser.getUserByToken(token, (user) => {
      if (!user) {
        SLog.log(LogType.Error, "markAsRead", "User not found");
        SResponse.getResponse(ResponseStatus.Unauthorized, null, "Invalid token", response);
        return;
      }

      SMessage.markAsReadNotifications(user.id, () => {
        SLog.log(LogType.Info, "markAsRead", "read all");
        SResponse.getResponse(ResponseStatus.OK, null, "mark as read messages successfully", response);
      });
    });
  }

  public static deleteMessage(request: express.Request, response: express.Response) {
    const message: Message = request?.body?.message;

    SLog.log(LogType.Info, "deleteMessage", "check data", message);

    if (!message || !message.sender || !message.receiver) {
      SLog.log(LogType.Info, "deleteMessage", "delete message unsuccessfully", "Cannot get the message");
      SResponse.getResponse(ResponseStatus.Internal_Server_Error, null, "Cannot get the message", response);
      return;
    }

    SMessage.deleteMessage(message.id, message.sender.id, message.receiver.id, (result) => {
      SResponse.getResponse(ResponseStatus.OK, result, "delete message", response);
    });
  }

  public static deleteClassMessage(request: express.Request, response: express.Response) {
    const message: Message = request?.body?.message;

    SLog.log(LogType.Info, "deleteClassMessage", "check data", message);

    if (!message || !message.sender || !message.class) {
      SLog.log(LogType.Info, "deleteClassMessage", "delete message unsuccessfully", "Cannot get the message");
      SResponse.getResponse(ResponseStatus.Internal_Server_Error, null, "Cannot get the message", response);
      return;
    }

    SMessage.deleteClassMessage(message.id, message.class.id, (result) => {
      SResponse.getResponse(ResponseStatus.OK, result, "delete message", response);
    });
  }
}