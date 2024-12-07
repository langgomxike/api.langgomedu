// @ts-ignore
import express, {Response} from "express";
import SUser from "../services/SUser";
import SResponse, {ResponseStatus} from "../services/SResponse";
import User from "../models/User";
import {v4} from "uuid";
import SLog, {LogType} from "../services/SLog";
import SRole from "../services/SRole";
import RoleList from "../configs/RoleConfig";
import Role from "../models/Role";
import SStudent from "../services/SStudent";
import SFirebase, {FirebaseNode} from "../services/SFirebase";
import axios = require("axios");
import OTP from "../models/OTP";

export default class UserController {
  public static login(request: express.Request, response: express.Response) {
    const username = request.body.username ?? "";
    const phoneNumber = request.body.phone_number ?? "";
    const password = request.body.password ?? "";

    // if (
    //   !username &&
    //   !/^\s*(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?\s*$/.test(
    //     phoneNumber
    //   )
    // ) {
    //   SLog.log(
    //     LogType.Error,
    //     "login",
    //     "Login failed. Invalid Username or Phone Number"
    //   );
    //   SResponse.getResponse(
    //     ResponseStatus.Internal_Server_Error,
    //     null,
    //     "Login failed. Invalid Username or Phone Number",
    //     response
    //   );
    //   return;
    // }
    //
    // if (!password) {
    //   SLog.log(LogType.Error, "login", "Login failed. Invalid password");
    //   SResponse.getResponse(
    //     ResponseStatus.Internal_Server_Error,
    //     null,
    //     "Login failed. Invalid password",
    //     response
    //   );
    //   return;
    // }

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

      if (!SUser.verifyPassword(password, user.password)) {
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

  public static getUserAddress(request: express.Request, response: express.Response) {
    const userId: string = request.body.user_id ?? "-1";

    SUser.getUserAddress(userId, (adress) => {
      if (!adress) {
        SLog.log(LogType.Error, "getUserAddress", "User adress not found");
        SResponse.getResponse(
          ResponseStatus.Internal_Server_Error,
          null,
          "User adress not found",
          response
        );
        return;
      }

      SResponse.getResponse(
        ResponseStatus.OK,
        adress,
        "User adress successfully fetched",
        response
      );
    });
  }

  public static implicitLogin(
    request: express.Request,
    response: express.Response
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

  public static registerUser(
    request: express.Request,
    response: express.Response
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
    SFirebase.getData(FirebaseNode.OTPs, [{
        key: FirebaseNode.PhoneNumber,
        value: user.phone_number,
      }],
      (value) => {
        const otp: OTP = value;

        SLog.log(LogType.Info, "registerUser", "check otp", otp);

        if (otp.code !== requestCode || otp.expired_at < new Date().getTime()) {
          SLog.log(LogType.Error, "registerUser", "Invalid otp");
          SResponse.getResponse(ResponseStatus.Internal_Server_Error, {}, "Invalid otp", response);
          return;
        }

        SUser.storeUser(user, (result) => {
          if (!result) {
            SLog.log(LogType.Error, "registerUser", "Fail to store user");
            SResponse.getResponse(ResponseStatus.Internal_Server_Error, {}, "Fail to store user", response);
            return;
          }

          SRole.addRolesToUser(user.id, [
            new Role(RoleList.USER, RoleList[RoleList.USER]),
          ], () => {
            request.body.username = user.username;
            request.body.password = user.password;

            UserController.login(request, response);
          });
        });
      });
  }


  public static registerChild(
    request: express.Request,
    response: express.Response
  ) {
    const user: User = request?.body?.user;
    const parent: User = request?.body?.parent;
    const requestCode: number = request?.body?.otp ?? -1;

    SLog.log(LogType.Warning, "registerChild", "check params", {user, parent});

    if (!user || !user.password || !user.username || !user.full_name || !parent || !parent.username || !parent.full_name || !parent.id || !parent.phone_number) {
      SLog.log(LogType.Error, "registerChild", "Invalid user or parent");
      SResponse.getResponse(ResponseStatus.Internal_Server_Error, {}, "Invalid user or parent", response);
      return;
    }

    SFirebase.getData(FirebaseNode.OTPs, [{
        key: FirebaseNode.PhoneNumber,
        value: parent.phone_number,
      }],
      (value) => {
        const otp: OTP = value;

        SLog.log(LogType.Info, "registerUser", "check otp", otp);

        if (otp.code !== requestCode || otp.expired_at < new Date().getTime()) {
          SLog.log(LogType.Error, "registerUser", "Invalid otp");
          SResponse.getResponse(ResponseStatus.Internal_Server_Error, {}, "Invalid otp", response);
          return;
        }

        SStudent.getStudentByUserId(parent.id, (students) => {
          const quantity = students.length;

          SLog.log(LogType.Warning, "registerChild", "check children quantity", quantity);

          user.id = parent.id + "|c:" + quantity;
          user.phone_number = parent.phone_number + "|c:" + quantity;
          user.parent = parent;

          //check request code
          SUser.storeUser(user, (result) => {
            if (!result) {
              SLog.log(LogType.Error, "registerChild", "Fail to store child");
              SResponse.getResponse(ResponseStatus.Internal_Server_Error, {}, "Fail to store child", response);
              return;
            }

            SLog.log(LogType.Info, "registerChild", "Fail to store child");
            SResponse.getResponse(ResponseStatus.OK, {}, "Store child successfully", response);
          });
        });
      });
  }

  public static auth(
    request: express.Request,
    response: express.Response
  ) {
    const user: User = request?.body?.user;

    SLog.log(LogType.Info, "auth", "check params", user);

    if (!user || !user.phone_number) {
      SLog.log(LogType.Error, "auth", "invalid user");
      SResponse.getResponse(ResponseStatus.Internal_Server_Error, null, "Invalid user", response);
      return;
    }

    SUser.sendOTP(user.phone_number, (otp) => {
      SFirebase.getData(FirebaseNode.AppInfos, [],
        (value) => {
          const key: string = value?.otp_service_key ?? "";
          const appName: string = value?.app_name ?? "langgomedu";
          const phoneNumber = user.phone_number.replace(/^0/, "84");
          const text = `Your OTP for ${appName} App is: [${otp}]`
          const url = `http://v31mye.api.infobip.com/sms/3/text/query?to=${phoneNumber}&text=${text}`;

          axios.default.post(url, {}, {
            headers: {
              Authorization: `App ${key}`,
            }
          })
            .then((r) => {
              SLog.log(LogType.Error, "auth", "set otp successfully", r.data);
              SResponse.getResponse(ResponseStatus.OK, true, "set otp successfully", response);
            })
            .catch(error => {
              SLog.log(LogType.Error, "auth", "cannot set otp", error);
              SResponse.getResponse(ResponseStatus.Internal_Server_Error, null, "Cannot set otp", response);
            });
        });
    });
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

      SRole.getRolesByUserId(user.id, (roles) => {
        user.roles = roles;

        SResponse.getResponse(ResponseStatus.OK, user, "get user info", response);
      });
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

  public static changeUserRoles(
    request: express.Request,
    response: express.Response
  ) {
    const user: User = request?.body?.user;
    const roles: number[] = request?.body?.roles;

    if (!user || !user.id || roles.length < 1) {
      SLog.log(LogType.Error, "changeUserRoles", "Invalid user or roles");
      SResponse.getResponse(ResponseStatus.Internal_Server_Error, {}, "Invalid user or roles", response);
      return;
    }

    SRole.addRolesToUser(user.id, roles.map(r => new Role(r)), () => {
      SLog.log(LogType.Info, "changeUserRoles", "Added roles to user");
      SResponse.getResponse(ResponseStatus.OK, {}, "Added roles to user", response);
    });
  }

  public static changePassword(
    request: express.Request,
    response: express.Response
  ) {
    const user: User = request?.body?.user;
    const newPassword: string = request?.body?.new_password;
    const requestCode: number = request?.body?.otp ?? -1;

    if (!user || !user.phone_number || !user.id || !newPassword || requestCode < 111111 || requestCode > 999999) {
      SLog.log(LogType.Error, "changePassword", "Invalid user or new password or otp");
      SResponse.getResponse(ResponseStatus.Internal_Server_Error, {}, "Invalid user or new password or otp", response);
      return;
    }

    SFirebase.getData(FirebaseNode.OTPs, [{
        key: FirebaseNode.PhoneNumber,
        value: user.phone_number,
      }],
      (value) => {
        const otp: OTP = value ?? new OTP(-1, -1);

        if (otp.code !== requestCode || otp.expired_at < new Date().getTime()) {
          SLog.log(LogType.Error, "changePassword", "Invalid otp");
          SResponse.getResponse(ResponseStatus.Internal_Server_Error, {}, "Invalid otp", response);
          return;
        }

        SUser.updateUserPassword(user.id, newPassword, (result) => {
          if (!result) {
            SLog.log(LogType.Error, "changePassword", "Fail to change password");
            SResponse.getResponse(ResponseStatus.Internal_Server_Error, {}, "Fail to change password", response);
            return;
          }

          SResponse.getResponse(ResponseStatus.OK, {}, "change password", response);
        });
      });
  }

  public static resetPassword(
    request: express.Request,
    response: express.Response
  ) {
    const user: User = request?.body?.user;
    const newPassword: string = request?.body?.new_password;
    const requestCode: number = request?.body?.otp ?? -1;

    if (!user || !user.phone_number || !newPassword || requestCode < 111111 || requestCode > 999999) {
      SLog.log(LogType.Error, "resetPassword", "Invalid user or new password or otp");
      SResponse.getResponse(ResponseStatus.Internal_Server_Error, {}, "Invalid user or new password or otp", response);
      return;
    }

    SFirebase.getData(FirebaseNode.OTPs, [{
        key: FirebaseNode.PhoneNumber,
        value: user.phone_number,
      }],
      (value) => {
        const otp: OTP = value;

        if (otp.code !== requestCode || otp.expired_at < new Date().getTime()) {
          SLog.log(LogType.Error, "resetPassword", "Invalid otp");
          SResponse.getResponse(ResponseStatus.Internal_Server_Error, {}, "Invalid otp", response);
          return;
        }

        SUser.getUserByPhoneNumberOrUsername(user.phone_number, "", (_user) => {
          if (!_user) {
            SLog.log(LogType.Error, "resetPassword", "User not found");
            SResponse.getResponse(ResponseStatus.Internal_Server_Error, {}, "User not found", response);
            return;
          }

          SUser.updateUserPassword(_user.id, newPassword, (result) => {
            if (!result) {
              SLog.log(LogType.Error, "resetPassword", "Fail to reset password");
              SResponse.getResponse(ResponseStatus.Internal_Server_Error, {}, "Fail to reset password", response);
              return;
            }

            SResponse.getResponse(ResponseStatus.OK, {}, "Reset password", response);
          });
        });
      });
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
    const {user_id, point, report_id} = request.body; // Thêm report_id vào body request
    const pointsToDeduct = point ?? 30; // Mặc định trừ 30 nếu không truyền

    if (!user_id || pointsToDeduct == null || !report_id) {
      return response
        .status(400)
        .json({success: false, message: "User ID, point, and report ID are required."});
    }

    // Thực hiện trừ điểm và cập nhật bảng reports
    SUser.MinusUserPoints(user_id, pointsToDeduct, report_id, (result) => {
      if (result) {
        response.status(200).json({success: true, message: "Points subtracted and report updated successfully."});
      } else {
        response.status(500).json({success: false, message: "Failed to subtract points or update report."});
      }
    });
  }

  public static LockUserAccount(
    request: express.Request,
    response: express.Response
  ) {
    const userId = request.body.user_id; // Lấy `user_id` từ request
    const reportId = request.body.report_id; // Lấy `report_id` từ request
    let permissionIds: string[] = request.body.permission_ids || []; // Lấy danh sách `permission_ids` hoặc mảng rỗng

    console.log("Request body: " + JSON.stringify(request.body));
    console.log("UserId: " + userId);
    console.log("ReportId: " + reportId);
    console.log("PermissionIds: " + JSON.stringify(permissionIds));

    // Kiểm tra `userId` và `reportId` có tồn tại không
    if (!userId) {
      return response
        .status(400)
        .json({success: false, message: "User ID is required."});
    }

    if (!reportId) {
      return response
        .status(400)
        .json({success: false, message: "Report ID is required."});
    }

    // Nếu danh sách quyền rỗng, đặt mặc định là quyền `13`
    if (permissionIds.length === 0) {
      permissionIds = ["13"];
    }

    // Gọi hàm LockUserAccount với `userId`, `reportId`, và `permissionIds`
    SUser.LockUserAccount(userId, reportId, permissionIds, (result) => {
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




  //lấy profile user
  public static getUserProfile(
    request: express.Request,
    response: express.Response
  ) {
    const id: string = request?.params?.id;
    console.log("lay id", id);
    

    if (!id) {
      SLog.log(LogType.Error, "getUserInfo", "Invalid ID");
      SResponse.getResponse(
        ResponseStatus.Internal_Server_Error,
        {},
        "Invalid ID",
        response
      );
      return;
    }

    // Sử dụng hàm getProfileUserById để lấy thông tin người dùng và interesdMajors
    SUser.getProfileUserById(id, (userWithMajors) => {
      if (!userWithMajors) {
        SLog.log(LogType.Error, "getUserInfo", "User not found");
        SResponse.getResponse(
          ResponseStatus.Not_Found,
          {},
          "User not found",
          response
        );
        return;
      }

      SResponse.getResponse(
        ResponseStatus.OK,
        userWithMajors,
        "Get user profile info",
        response
      );
    });
  }

  //update User profile
  public static updateUserProfile(
    request: express.Request,
    response: express.Response
  ) {
    // Lấy dữ liệu từ body của request
    const {
      full_name,
      hometown,
      birthday,
      gender,
      province,
      district,
      ward,
      detail,
      majors,
      classes,
    } = request.body;
  
    const id: string = request.params.id;
  
    console.log("Request Params:", request.params); // Log ID
    console.log("Request Body:", request.body);     // Log dữ liệu `FormData`
  
    // Phần còn lại không cần thay đổi
    if (!id) {
      return response.status(404).json({ success: false, message: "Missing required user ID." });
    }
  
    const parsedMajors = majors ? JSON.parse(majors) : undefined;
    const parsedClasses = classes ? JSON.parse(classes) : undefined;
  
    console.log("Parsed Data:");
    console.log("Full Name:", full_name);
    console.log("Majors:", parsedMajors);
    console.log("Classes:", parsedClasses);
  
    SUser.updateUserProfile(
      id,
      (result) => {
        if (result) {
          console.log("User profile updated successfully for ID:", id);
          SResponse.getResponse(ResponseStatus.OK, {}, "User profile updated successfully.", response);
        } else {
          console.error("Failed to update user profile for ID:", id);
          SResponse.getResponse(ResponseStatus.Internal_Server_Error, {}, "Failed to update user profile.", response);
        }
      },
      full_name,
      hometown,
      birthday ? parseInt(birthday) : undefined,
      gender ? parseInt(gender) : undefined,
      province,
      district,
      ward,
      detail,
      parsedMajors,
      parsedClasses
    );
  }
  


  //
  public static updateAvatar(
    request: express.Request,
    response: express.Response
  ) {
    // Lấy id từ body của request
    console.log(request.body.id);
    
    const id : string = request.params.id ?? "-1";

    // Lấy file được tải lên từ request.file (chỉ 1 file)
    const file = (request as any).file;
    let avatarPath: string | null = null;
    console.log("id",id);
    

    if (file) {
      avatarPath = `uploads/avatars/${file.filename}`; // Lưu đường dẫn file vào avatarPath
      console.log("Uploaded file path:", avatarPath);
    } else {
      // Nếu không có file tải lên, trả về lỗi
      return response
        .status(400)
        .json({ success: false, message: "Avatar file is missing." });
    }

    // Kiểm tra tham số bắt buộc
    if (!id) {
      return response
        .status(400)
        .json({ success: false, message: "Missing required user ID." });
    }
    console.log("avatar", avatarPath);

    // Gọi phương thức SUser.updateAvatar để cập nhật avatar người dùng
    SUser.updateAvatar(
      id,
      avatarPath, // Đường dẫn tới avatar
      (result) => {
        if (result) {
          // Nếu thành công, trả về phản hồi JSON
          SResponse.getResponse(
            ResponseStatus.OK,
            {},
            "User avatar updated successfully.",
            response
          );
        } else {
          // Nếu thất bại, trả về lỗi
          SResponse.getResponse(
            ResponseStatus.Internal_Server_Error,
            {},
            "Failed to update user avatar.",
            response
          );
        }
      }
    );
  }
}
