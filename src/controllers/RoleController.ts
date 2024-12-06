// @ts-ignore
import express from "express";
import SRole from "../services/SRole";
import SResponse, {ResponseStatus} from "../services/SResponse";
import Role from "../models/Role";
import SPermission from "../services/SPermission";
import User from "../models/User";
import SLog, {LogType} from "../services/SLog";

export default class RoleController {
  public static getAllRoles(request: express.Request, response: express.Response) {
    SRole.getAllRoles(roles => {
      SResponse.getResponse(ResponseStatus.OK, roles, "Get all roles", response);
    });
  }

  public static getAllRolesOfUser(request: express.Request, response: express.Response) {
    const user: User = request?.body?.user;

    if (!user || !user.id) {
      SLog.log(LogType.Error, "getAllRolesOfUser", "User not found");
      SResponse.getResponse(ResponseStatus.Internal_Server_Error, null, "Invalid user", response);
      return;
    }

    SRole.getRolesByUserId(user.id ,roles => {
      SLog.log(LogType.Info, "getAllRolesOfUser", "successfully", roles.length);
      SResponse.getResponse(ResponseStatus.OK, roles, "Get all roles", response);
    });
  }

  public static createRole(request: express.Request, response: express.Response) {
    const role: Role = request.body.role;

    if (!role || !role.name) {
      SResponse.getResponse(ResponseStatus.Internal_Server_Error, null, "Invalid role", response);
      return;
    }

    SRole.createRole(role, (result) => {
      if (result) {
        SResponse.getResponse(ResponseStatus.OK, null, "Role created successfully", response);
      } else {
        SResponse.getResponse(ResponseStatus.Internal_Server_Error, null, "Fail to create role", response);
      }
    });
  }

  public static deleteRole(request: express.Request, response: express.Response) {
    const id: number = request.params.id;

    if (!id || id <= 7) {
      SResponse.getResponse(ResponseStatus.Internal_Server_Error, null, "Invalid role", response);
      return;
    }

    SRole.deleteRole(id, (result) => {
      if (result) {
        SResponse.getResponse(ResponseStatus.OK, null, "Role deleted successfully", response);
      } else {
        SResponse.getResponse(ResponseStatus.Internal_Server_Error, null, "Fail to delete role", response);
      }
    });
  }

  public static updatePermissionsOfRole(request: express.Request, response: express.Response) {
    const role: Role = request.body.role;
    const permissions: number[] = request.body.permissions ?? [];

    if (!role || !role.id) {
      SResponse.getResponse(ResponseStatus.Internal_Server_Error, null, "Invalid role", response);
      return;
    }

    if (permissions.length < 1) {
      SResponse.getResponse(ResponseStatus.Internal_Server_Error, null, "Invalid permissions", response);
      return;
    }

    SPermission.updatePermissionsOfRole(role.id, permissions, (result) => {
      if (result) {
        SResponse.getResponse(ResponseStatus.OK, null, "Permissions updated successfully", response);
      } else {
        SResponse.getResponse(ResponseStatus.Internal_Server_Error, null, "Fail to update permissions", response);
      }
    });
  }
}