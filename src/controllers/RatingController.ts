// @ts-ignore
import express from "express";
import SResponse, {ResponseStatus} from "../services/SResponse";
import SRating from "../services/SRating";
import Rating from "../models/Rating";
import SLog, {LogType} from "../services/SLog";

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

        if (!rating || !rating.rater || !rating.ratee || !rating.class || !rating.value) {
            SLog.log(LogType.Error, "createRating", "Invalid rating");
            SResponse.getResponse(ResponseStatus.Internal_Server_Error,{}, "Invalid rating", response);
            return;
        }

        SRating.storeRating(rating, (result) => {
           if (!result) {
               SLog.log(LogType.Error, "createRating", "Fail to store rating");
               SResponse.getResponse(ResponseStatus.Internal_Server_Error, {}, "Fail to store rating", response);
               return;
           }

           SLog.log(LogType.Info, "createRating", "Success to store rating");
           SResponse.getResponse(ResponseStatus.OK, {}, "Create rating successfully", response);
        });
    }
}