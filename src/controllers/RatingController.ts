// @ts-ignore
import express from "express";
import SResponse, { ResponseStatus } from "../services/SResponse";
import SRating from "../services/SRating";
import Rating from "../models/Rating";
import SLog, { LogType } from "../services/SLog";
import SFirebase, { FirebaseNode } from "../services/SFirebase";
import SUser from "../services/SUser";
import User from "../models/User";

export default class RatingController {
    public static getRatings(request: express.Request, response: express.Response) {
        const classId = parseInt(request?.params?.id ?? -1);

        if (classId < 1) {
            SResponse.getResponse(ResponseStatus.Internal_Server_Error, null, "Invalid class ID", response);
            return;
        }

        SRating.getRatingsInClass(classId, (ratings) => {
            SResponse.getResponse(ResponseStatus.OK, ratings, "Get ratings of one class", response);
        });
    }

    public static createRating(request: express.Request, response: express.Response) {
        const rating: Rating = request?.body?.rating;

        SLog.log(LogType.Warning, "createRating", "check params", rating);

        if (!rating || !rating.rater || !rating.ratee || !rating.class || !rating.value || (rating.value < 1 || rating.value > 5)) {
            SLog.log(LogType.Error, "createRating", "Invalid rating");
            SResponse.getResponse(ResponseStatus.Internal_Server_Error, {}, "Invalid rating", response);
            return;
        }

        SRating.storeRating(rating, (result) => {
            if (!result) {
                SLog.log(LogType.Error, "createRating", "Fail to store rating");
                SResponse.getResponse(ResponseStatus.Internal_Server_Error, {}, "Fail to store rating", response);
                return;
            }

            SFirebase.getData(FirebaseNode.AppInfos, [], (infos) => {
                const rateePoint1: number = +(infos?.ratee_rated_point_1 ?? "0");
                const rateePoint2: number = +(infos?.ratee_rated_point_2 ?? "0");
                const rateePoint3: number = +(infos?.ratee_rated_point_3 ?? "0");
                const rateePoint4: number = +(infos?.ratee_rated_point_4 ?? "0");
                const rateePoint5: number = +(infos?.ratee_rated_point_5 ?? "0");
                const raterPoint: number = +(infos?.rater_rating_point ?? "0");

                const rateePoints = [rateePoint1, rateePoint2, rateePoint3, rateePoint4, rateePoint5];

                SUser.plusPointForUser(rating.rater?.id ?? "-1", rateePoints[rating.value - 1], () => {
                    SUser.plusPointForUser(rating.ratee?.id ?? "-1", raterPoint, () => {
                        SLog.log(LogType.Info, "createRating", "Success to store rating");
                        SResponse.getResponse(ResponseStatus.OK, {}, "Create rating successfully", response);
                    });
                });
            });
        });
    }

    public static getRatingsOfUser(request: express.Request, response: express.Response) {
        const user_id = request.params.id;
        const userId = user_id?.toString();
        if (userId) {
            SRating.getAllRatingsOfUser(userId, (ratings) => {
                SResponse.getResponse(ResponseStatus.OK, ratings, "get All Rating of user", response);
            })
        }
        else {
            SResponse.getResponse(ResponseStatus.Internal_Server_Error, [], "can't get User with this ID", response)
        }
    }
}