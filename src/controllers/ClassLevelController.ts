// @ts-ignore
import express from "express";
import SClassLevel from "../services/SClassLevel";
import SResponse, {ResponseStatus} from "../services/SResponse";
import ClassLevel from "../models/ClassLevel";

export class ClassLevelController {
    public static getAllClassLevels(request: express.Request, response: express.Response) {
        SClassLevel.getAllClassLevels((classLevels) => {
            SResponse.getResponse(ResponseStatus.OK, classLevels, "get All class level", response);
            return;
        })
    }

    public static getInterestedClassLevels(request: express.Request, response: express.Response) {
        const userId: string = request.body?.user_id ?? "-1";

        SClassLevel.getInterestedClassLevels(userId, (classLevels) => {
            SResponse.getResponse(ResponseStatus.OK, classLevels, "get interested class level", response);
            return;
        })
    }

    public static updateClasslevel(request: express.Request, response: express.Response) {
        const classLevel: ClassLevel = request?.body?.class_level;

        if (!classLevel ||!classLevel.id || (!classLevel.vn_name && !classLevel.en_name && !classLevel.ja_name)) {
            SResponse.getResponse(ResponseStatus.Internal_Server_Error, null, "Invalid class level", response);
            return;
        }

        SClassLevel.updateClassLevel(classLevel, (result) => {
            if (result) {
                SResponse.getResponse(ResponseStatus.OK, null, "Class level updated successfully", response);
            } else {
                SResponse.getResponse(ResponseStatus.Internal_Server_Error, null, "Fail to update class level", response);
            }
        });
    }

    public static createClassLevel(request: express.Request, response: express.Response) {
        const classLevel: ClassLevel = request?.body?.class_level;

        if (!classLevel || !classLevel.vn_name || !classLevel.en_name || !classLevel.ja_name) {
            SResponse.getResponse(ResponseStatus.Internal_Server_Error, null, "Invalid class level", response);
            return;
        }

        SClassLevel.storeClassLevel(classLevel, (result) => {
            if (result) {
                SResponse.getResponse(ResponseStatus.OK, null, "Class level created successfully", response);
            } else {
                SResponse.getResponse(ResponseStatus.Internal_Server_Error, null, "Fail to create class level", response);
            }
        });
    }

    public static deleteClassLevel(request: express.Request, response: express.Response) {
        const classLevel: ClassLevel = request?.body?.class_level;

        if (!classLevel || !classLevel.id) {
            SResponse.getResponse(ResponseStatus.Internal_Server_Error, null, "Invalid class level", response);
            return;
        }

        SClassLevel.deleteClasslevel(classLevel, () => {
            SResponse.getResponse(ResponseStatus.OK, null, "deleted class level", response);
            return;
        })
    }
}