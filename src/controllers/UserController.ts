// @ts-ignore
import express, {Response} from "express";
import SUser from "../services/SUser";
import SResponse, {ResponseStatus} from "../services/SResponse";
import User from "../models/User";
import Message from "../models/Message";
import * as dotenv from "dotenv";
import SMessage from "../services/SMessage";
import { v4 } from "uuid";
import SLog, { LogType } from "../services/SLog";
import SInformation from "../services/SInformation";
import PermissionList from "../configs/PermissionConfig";
import SPermission from "../services/SPermission";
import Permission from "../models/Permission";
import SRole from "../services/SRole";
import RoleList from "../configs/RoleConfig";
import Role from "../models/Role";

export default class UserController {
  public static login(request: express.Request, response: express.Response) {
    const username = request.body.username ?? "";
    const phoneNumber = request.body.phone_number ?? "";
    const password = request.body.password ?? "";

    if (
      !username &&
      !/^\s*(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?\s*$/.test(
        phoneNumber
      )
    ) {
      SLog.log(
        LogType.Error,
        "login",
        "Login failed. Invalid Username or Phone Number"
      );
      SResponse.getResponse(
        ResponseStatus.Internal_Server_Error,
        null,
        "Login failed. Invalid Username or Phone Number",
        response
      );
      return;
    }

    if (!password) {
      SLog.log(LogType.Error, "login", "Login failed. Invalid password");
      SResponse.getResponse(
        ResponseStatus.Internal_Server_Error,
        null,
        "Login failed. Invalid password",
        response
      );
      return;
    }

    SUser.getUserByPhoneNumberOrUsername(phoneNumber, username, (user) => {
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

      if (user.password !== password) {
        SLog.log(LogType.Error, "Login", "login failed. Password incorrect");
        SResponse.getResponse(
          ResponseStatus.Internal_Server_Error,
          null,
          "Login with parameters failed. Password is incorrect",
          response
        );
        return;
      }

      SRole.getRolesByUserId(user.id, roles => {
        SLog.log(LogType.Info, "Login", "login successfully");

        user.password = user.password.replace(/^.$/, "*");
        user.roles = roles;
        const token = v4();

        const updatedUser = new User();
        updatedUser.token = token;
        updatedUser.id = user.id;

        //update token
        SUser.updateUserInfo(updatedUser, () => {
          user.token = token;

          SResponse.getResponse(
            ResponseStatus.OK,
            user,
            "Login with parameters successfully.",
            response
          );
        });
      });
    });
  }

  public static implicitLogin(request
                                :
                                express.Request, response
                                :
                                express.Response
  ) {
    const token: string =
      request?.headers?.authorization?.replace("Bearer ", "") ?? "";

    if (!token) {
      //implicitly login
      SLog.log(LogType.Error, "implicitLogin", "Token not found");
      SResponse.getResponse(
        ResponseStatus.Internal_Server_Error,
        null,
        "Token not found",
        response);
      return;
    }

    SUser.getUserByToken(token, (user) => {
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

      SRole.getRolesByUserId(user.id, roles => {
        user.roles = roles;


        //update user's token
        const token = v4();
        const updatedUser = new User();
        updatedUser.id = user.id;
        updatedUser.token = token;

        //then store a new message as notification
        SUser.updateUserInfo(updatedUser, () => {
          user.token = token;
          SResponse.getResponse(
            ResponseStatus.OK,
            user,
            "Login successfully",
            response
          );
        });
      });
    });
  }

  public static

  registerUser(request
                 :
                 express.Request, response
                 :
                 express.Response
  ) {
    const user: User = request?.body?.user;
    const requestCode: number = request.body.code ?? 0;

    SLog.log(LogType.Warning, "regiterUser", "check params", {user, requestCode});

    if (!user || !user.id || !user.password || !user.phone_number || !user.full_name || !requestCode) {
      SLog.log(LogType.Error, "registerUser", "Invalid user");
      SResponse.getResponse(ResponseStatus.Internal_Server_Error, {}, "Invalid user", response);
      return;
    }

    //check request code
    if (requestCode === 123456) {
      SUser.storeUser(user, (result) => {
        if (!result) {
          SLog.log(LogType.Error, "registerUser", "Fail to store user");
          SResponse.getResponse(ResponseStatus.Internal_Server_Error, {}, "Fail to store user", response);
          return;
        }

        SRole.addRolesToUser(user.id, [
          new Role(RoleList.USER, RoleList[RoleList.USER]),
          new Role(RoleList.BANNED_USER, RoleList[RoleList.BANNED_USER]),
        ], () => {
          request.body.username = user.username;
          request.body.password = user.password;

          UserController.login(request, response);
        });
      });
    } else {
      SLog.log(LogType.Error, "registerUser", "Invalid otp");
      SResponse.getResponse(ResponseStatus.Internal_Server_Error, {}, "Invalid otp", response);
    }
  }


  public static

  auth(request
         :
         express.Request, response
         :
         express.Response
  ) {
    return response.send("login");
  }

  public static

  getUserInfo(request
                :
                express.Request, response
                :
                express.Response
  ) {
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

  public static

  updateUserInfo(request
                   :
                   express.Request, response
                   :
                   express.Response
  ) {
    const user: User = request?.body?.user;

    if (!user || !user.id || !(user.full_name || user.username || user.phone_number || user.password || user.avatar || user.roles)) {
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

    mainUpdate();
  }

  public static

  deleteAccount(request
                  :
                  express.Request, response
                  :
                  express.Response
  ) {
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

  public static

  getAllUsers(
    request
      :
      express.Request,
    response
      :
      express.Response
  ) {
    SUser.getAllUsers((users) => {
      SResponse.getResponse(
        ResponseStatus.OK,
        users,
        "get all users",
        response
      );
    });
  }

  public static

  getUser(request
            :
            express.Request, response
            :
            express.Response
  ) {
  }

  public static

  changeUserPermissions(
    request
      :
      express.Request,
    response
      :
      express.Response
  ) {
  }

  public static

  resetPassword(
    request
      :
      express.Request,
    response
      :
      express.Response
  ) {
  }

  public static

  changePassword(
    request
      :
      express.Request,
    response
      :
      express.Response
  ) {
  }

  public static

  MinusUserPoints(
    request
      :
      express.Request,
    response
      :
      express.Response
  ) {
    const userId = request?.body?.user_id;
    const point = request?.body?.point || 30; // Mặc định là 30 nếu không truyền

    console.log("request: " + JSON.stringify(request.body));
    console.log("userId: " + userId);
    console.log("point: " + point);

    // Kiểm tra nếu `point` hoặc `userId` không tồn tại
    if (!userId || point == null) {
      return response
        .status(400)
        .json({success: false, message: "User ID and point are required."});
    }

    // Trừ điểm uy tín của người dùng
    SUser.MinusUserPoints(userId, point, (result) => {
      if (result) {
        // Khóa tài khoản người dùng sau khi trừ điểm thành công nếu cần thiết
        SUser.LockUserAccount(userId, (lockResult) => {
          if (lockResult) {
            response
              .status(200)
              .json({
                success: true,
                message:
                  "Points subtracted and user account locked successfully.",
              });
          } else {
            response
              .status(500)
              .json({
                success: false,
                message: "Points subtracted but failed to lock user account.",
              });
          }
        });
      } else {
        response
          .status(500)
          .json({success: false, message: "Failed to subtract points."});
      }
    });
  }

  //khoá user
  public static

  LockUserAccount(
    request
      :
      express.Request,
    response
      :
      express.Response
  ) {
    const userId = request.body.user_id;  // Đổi từ `request.body.user.id` thành `request.body.user_id`
    console.log("request: " + JSON.stringify(request.body));
    console.log("userId: " + userId);

    if (!userId) {
      return response
        .status(400)
        .json({success: false, message: "User ID is required."});
    }

    SUser.LockUserAccount(userId, (result) => {
      if (result) {
        response.status(200).json({
          success: true,
          message: "User account locked successfully.",
        });
      } else {
        response.status(500).json({success: false, message: "Failed to lock user account."});
      }
    });
  }

  //tạo admin

  public static

  registerAdmin(
    request
      :
      express.Request,
    response
      :
      express.Response
  ) {
    const {phone, email, password} = request.body;

    // Kiểm tra các thông số cần thiết
    if (!phone || !email || !password) {
      return response.status(400).json({
        success: false,
        message: "Phone number, email, and password are required.",
      });
    }

    // Gọi phương thức CreateAdminUser để tạo tài khoản admin
    SUser.CreateAdminUser(phone, email, password, (result) => {
      if (result) {
        response.status(200).json({
          success: true,
          message: "Admin account created successfully.",
        });
      } else {
        response.status(500).json({
          success: false,
          message: "Failed to create admin account.",
        });
      }
    });
  }
}
