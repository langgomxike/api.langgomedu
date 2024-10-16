import express, { Response } from 'express';
import SResponse, { ResponseStatus } from '../services/SResponse';
import SLog, { LogType } from '../services/SLog';
import Class from '../models/Class';
import SMySQL from '../services/SMySQL';
import SClass from '../services/SClass';
export default class ClassController {
    public static getSuggestedClasses(request: express.Request, response: express.Response) {

    }

    public static getTeachingClasses(request: express.Request, response: express.Response) {

    }

    public static getAttendingClasses(request: express.Request, response: express.Response) {

    }

    public static getAllClasses(request: express.Request, response: express.Response) {

    }

    public static getClass(request: express.Request, response: express.Response) {

    }

    public static createClass(request: express.Request, response: express.Response) {

    }

    /**
  * Updates a class based on the data provided in the request body.
  * 
  * @param request - The Express request object containing the class data in the request body.
  * @param response - The Express response object used to send the response back to the client.
  */
    public static updateClass(request: express.Request, response: express.Response) {
        // Extract the class object from the request body, or set to undefined if not provided
        const updatedClass: Class | undefined = request?.body?.class ?? undefined;

        // If the class object is not valid, return an internal server error response
        if (!updatedClass) {
            SResponse.getResponse(ResponseStatus.Internal_Server_Error, null, "Class is not valid", response);
            return;
        }

        // Update the class using SClass.updateClass and handle the callback
        SClass.updateClass(updatedClass, (result) => {
            // If the update fails, return an internal server error response
            if (!result) {
                SResponse.getResponse(ResponseStatus.Internal_Server_Error, null, "Server cannot update", response);
                return;
            }

            // If the update succeeds, return a success response
            SResponse.getResponse(ResponseStatus.OK, null, "Update class successfully", response);
            return;
        });
    }

    /**
     * Deletes a class based on the ID provided in the request query parameters.
     * 
     * @param request - The Express request object containing the class ID in the query parameters.
     * @param response - The Express response object used to send the response back to the client.
     */
    public static deleteClass(request: express.Request, response: express.Response) {
        // Parse the class ID from the query parameters, defaulting to -1 if not provided
        const id: number = +(request?.query?.id ?? -1);

        // Log the request query parameters for debugging purposes
        SLog.log(LogType.Info, "deleteClass", "show query params", request?.query);

        // If the ID is not valid (less than or equal to zero), return an internal server error response
        if (id <= 0) {
            SResponse.getResponse(ResponseStatus.Internal_Server_Error, null, "Server cannot deleted class with id " + id, response);
            return;
        }

        // Attempt to perform a soft delete on the class with the specified ID
        SClass.softDeleteClass(id, (result) => {
            // If the deletion fails, return an internal server error response
            if (!result) {
                SResponse.getResponse(ResponseStatus.Internal_Server_Error, null, "Server cannot deleted class with id " + id, response);
                return;
            }

            // If the deletion succeeds, return a success response
            SResponse.getResponse(ResponseStatus.OK, null, "Update class with id " + id + " successfully", response);
            return;
        });
    }


    public static requestToAttendClass(request: express.Request, response: express.Response) {

    }

    public static acceptToAttendClass(request: express.Request, response: express.Response) {

    }

    public static approveToAttendClass(request: express.Request, response: express.Response) {

    }

    public static getAllLevels(request: express.Request, response: express.Response) {

    }

    public static createLevel(request: express.Request, response: express.Response) {

    }

    public static updateLevel(request: express.Request, response: express.Response) {

    }

    public static deleteLevel(request: express.Request, response: express.Response) {

    }

}