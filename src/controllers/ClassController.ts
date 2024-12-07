import express from "express";
import moment from "moment"; // Thư viện hỗ trợ xử lý thời gian
import SResponse, {ResponseStatus} from "../services/SResponse";
import SLog, {LogType} from "../services/SLog";
import Class from "../models/Class";
import SClass from "../services/SClass";
import {UserType} from "../configs/UserType";
import Filters from "../models/Filters";
import {parseQueryBoolean, parseQueryNumber, parseQueryString} from "../configs/QueryHelpers";
import SAddress from "../services/SAddress";


export default class ClassController {

  public static getSuggestsClasses(
    request: express.Request,
    response: express.Response
  ) {
    const query = request.query

    const user_id = request.params.user_id;

    const user_type: number =  Number(query.user_type) ?? UserType.LEANER;

     // Lấy các giá trị filter từ query parameters
    const filter: Filters = {
    //Địa chỉ:
    province: parseQueryString(query.province),
    district: parseQueryString(query.district),
    ward: parseQueryString(query.ward),

    // Ngành học (nếu có)
    major: parseQueryString(query.major),
    // classLevelId: 
    classLevelId: parseQueryString(query.classLevelId),
  };

  const page = Number(request.query.page) || 1;
  const perPage = Number(request.query.perPage) || 2;

    SClass.getSuggestsClasses(user_id, user_type, filter, page, perPage ,
      (classes, pagination) => {
      SResponse.getResponse(
        ResponseStatus.OK,
        {classes, pagination} ,
        "get sugget classes",
        response
      );
    });
  }

  public static getFilterClasses(
    request: express.Request,
    response: express.Response
  ) {
    const query = request.query

    const user_id = request.params.user_id;

    const user_type: number =  Number(query.user_type) ?? UserType.LEANER;

     // Lấy các giá trị filter từ query parameters
    const filter: Filters = {
    // Giá lớp học tối thiểu
    minPrice: parseQueryNumber(query.minPrice),

    // Giá lớp học tối đa
    maxPrice: parseQueryNumber(query.maxPrice),

    //Địa chỉ:
    province: parseQueryString(query.province),
    district: parseQueryString(query.district),
    ward: parseQueryString(query.ward),

    // Hình thức học: online/offline
    isOnline: parseQueryBoolean(query.isOnline),

    // Ngành học (nếu có)
    major: parseQueryString(query.major),
    // classLevelId: 
    classLevelId: parseQueryString(query.classLevelId),

    // Số lượng tối đa trong lớp 
    maxLearners: parseQueryNumber(query.maxLearners),
    // Ngày bắt đầu & Ngày kết thúc
    startedAtMin: parseQueryNumber(query.startedAtMin),
    endedAtMax: parseQueryNumber(query.endedAtMax),
  };

  // Lấy các tham số sắp xếp từ query parameters
  const sortBy = parseQueryString(request.query.sort) ?? "started_at"; 

  const page = Number(request.query.page) || 1;
  const perPage = Number(request.query.perPage) || 2;

    SClass.getFilterClasses(user_id, user_type, filter, sortBy, page, perPage ,
      (classes, pagination) => {
      SResponse.getResponse(
        ResponseStatus.OK,
        {classes, pagination} ,
        "get sugget classes with filters",
        response
      );
    });
  }

  public static getAllClasses(
    request: express.Request,
    response: express.Response
  ) {
    SClass.getAllClasses((classes) => {
      SResponse.getResponse(
        ResponseStatus.OK,
        classes,
        "get All classes",
        response
      );
      return;
    });
  }
  public static getAuthorClasses(
    request: express.Request,
    response: express.Response
  ) {
    const author_id: string = request?.body?.author_id ?? "";
    //get fail when get author_id incorrect type or null
    if (author_id === "") {
      SResponse.getResponse(
        ResponseStatus.Internal_Server_Error,
        null,
        "unknown this user_id! ",
        response
      );
      return;
    }
    SClass.getAuthorClasses(author_id, (classes) => {
      SResponse.getResponse(
        ResponseStatus.OK,
        classes,
        "Get all classes create by this user",
        response
      );
      return;
    });
  }

  public static getClassesByUserId(
    request: express.Request,
    response: express.Response
  ) {
    const user_id = request.params.user_id;
    
    SClass.getClassByUserId(user_id, (classes) => {
      SResponse.getResponse(
        ResponseStatus.OK,
        classes,
        "get classes width user id",
        response
      );
    });
  }

  public static getClass(request: express.Request, response: express.Response) {
    const classId: number = Number(request.params.class_id) ?? -1;
    const userId: string = String(request.query.user_id) ?? "";

    SLog.log(LogType.Info, "getClass", "check params: " , {classId, userId});

    if (classId <= 0) {
      SResponse.getResponse(
        ResponseStatus.Internal_Server_Error,
        null,
        "unknown this class id",
        response
      );
      return;
    }
    
    SClass.getClassDetailWithUser(
      classId,
      userId,
      (_class) => {
        SResponse.getResponse(
          ResponseStatus.OK,
          { class: _class},
          "get detail class by id",
          response
        );
        return;
      }
    );
  }

  public static getconflictingLessonsWithClassUsers(
    request: express.Request,
    response: express.Response
  ) {
    const userId = request.body.user_id;
    const classId = Number(request.body.class_id);
    
    SClass.getconflictingLessonsWithClassUsers(classId, userId, (data) => {
      SResponse.getResponse(
        ResponseStatus.OK,
        data,
        "get conflicting lessons with class users",
        response
      );
      return;
    });
  }

  public static createClass(
    request: express.Request,
    response: express.Response
  ) {
    const {
      title,
      description,
      major_id,
      tutor_id, // Yêu cầu từ frontend
      author_id, // Yêu cầu từ frontend
      class_level_id,
      max_learners,
      price,
      started_at,
      ended_at,
      province,
      district,
      ward,
      detail,
      lessons, // Mảng các bài học, chứa thông tin ngày học (vd: thứ 2, thứ 3)
    } = request.body;

    // Kiểm tra tính hợp lệ
    if (
      !title ||
      !description ||
      !major_id ||
      !tutor_id ||
      !author_id ||
      !class_level_id ||
      !max_learners ||
      !price ||
      !started_at ||
      !ended_at ||
      !province ||
      !district ||
      !ward ||
      !detail ||
      !Array.isArray(lessons) ||
      lessons.length === 0
    ) {
      return SResponse.getResponse(
        ResponseStatus.Internal_Server_Error,
        { message: "Dữ liệu đầu vào không hợp lệ." },
        "Invalid input data.",
        response
      );
    }

    // Tính toán danh sách các buổi học
    const fullLessons = lessons.flatMap((lesson) =>
      calculateLessonDates(
        started_at,
        ended_at,
        [lesson.day] // Dựa vào từng ngày trong tuần
      ).map((calculatedLesson) => ({
        ...lesson,
        day: calculatedLesson.day,
        started_at: calculatedLesson.started_at,
      }))
    );

    console.log("Danh sách đầy đủ các buổi học:", fullLessons);

    // Tiếp tục xử lý như bình thường
    SAddress.createAddress(
      province,
      district,
      ward,
      detail,
      (addressResult, addressId) => {
        if (!addressResult || !addressId) {
          return SResponse.getResponse(
            ResponseStatus.Internal_Server_Error,
            { message: "Không thể tạo địa chỉ." },
            "Failed to create address.",
            response
          );
        }

        SClass.createClass(
          title,
          description,
          major_id,
          tutor_id,
          author_id,
          class_level_id,
          max_learners,
          price,
          started_at,
          ended_at,
          addressId,
          fullLessons, // Truyền danh sách đầy đủ các buổi học
          (result: boolean, insertId?: number) => {
            if (result) {
              SResponse.getResponse(
                ResponseStatus.OK,
                { message: "Tạo lớp học thành công.", classId: insertId },
                "Create class successfully!",
                response
              );
            } else {
              SResponse.getResponse(
                ResponseStatus.Internal_Server_Error,
                { message: "Không thể tạo lớp học." },
                "Create class failed!",
                response
              );
            }
          }
        );
      }
    );
  }

  // tạo lớp cho phụ huynh
  public static createClassForLearner(
    request: express.Request,
    response: express.Response
  ) {
    const {
      title,
      description,
      major_id,
      tutor_id,
      author_id,
      class_level_id,
      price,
      started_at,
      ended_at,
      max_learners,
      province,
      district,
      ward,
      detail,
      lessons,
      userIds,
    } = request.body;
  
    console.log("data: ", request.body);
    
    if (
      !title ||
      !description ||
      !major_id ||
      !author_id ||
      !class_level_id ||
      !price ||
      !started_at ||
      !ended_at ||
      !max_learners ||
      !province ||
      !district ||
      !ward ||
      !detail ||
      !Array.isArray(lessons) ||
      lessons.length === 0 ||
      !userIds ||
      !Array.isArray(userIds)
    ) {
      return SResponse.getResponse(
        ResponseStatus.Internal_Server_Error,
        { message: 'Dữ liệu đầu vào không hợp lệ.' },
        'Invalid input data.',
        response
      );
    }
  
    SAddress.createAddress(
      province,
      district,
      ward,
      detail,
      (addressResult, addressId) => {
        if (!addressResult || !addressId) {
          return SResponse.getResponse(
            ResponseStatus.Internal_Server_Error,
            { message: 'Không thể tạo địa chỉ.' },
            'Failed to create address.',
            response
          );
        }
  
        SClass.createClassForLearner(
          title,
          description,
          major_id,
          tutor_id || "",
          author_id,
          class_level_id,
          price,
          started_at,
          ended_at,
          max_learners,
          addressId,
          lessons,
          userIds,
          (result: boolean, insertId?: number) => {
            if (result) {
              SResponse.getResponse(
                ResponseStatus.OK,
                { message: 'Tạo lớp học thành công.', classId: insertId },
                'Create class successfully!',
                response
              );
            } else {
              SResponse.getResponse(
                ResponseStatus.Internal_Server_Error,
                { message: 'Không thể tạo lớp học.' },
                'Failed to create class!',
                response
              );
            }
          }
        );
      }
    );
  };
  

  /**
   * Updates a class based on the data provided in the request body.
   *
   * @param request - The Express request object containing the class data in the request body.
   * @param response - The Express response object used to send the response back to the client.
   */
  public static updateClass(
    request: express.Request,
    response: express.Response
  ) {
    // Extract the class object from the request body, or set to undefined if not provided
    const updatedClass: Class | undefined = request?.body?.class ?? undefined;

    // If the class object is not valid, return an internal server error response
    if (!updatedClass) {
      SResponse.getResponse(
        ResponseStatus.Internal_Server_Error,
        null,
        "Class is not valid",
        response
      );
      return;
    }

    // Update the class using SClass.updateClass and handle the callback
    SClass.updateClass(updatedClass, (result) => {
      // If the update fails, return an internal server error response
      if (!result) {
        SResponse.getResponse(
          ResponseStatus.Internal_Server_Error,
          null,
          "Server cannot update",
          response
        );
        return;
      }

      // If the update succeeds, return a success response
      SResponse.getResponse(
        ResponseStatus.OK,
        null,
        "Update class successfully",
        response
      );
      return;
    });
  }

  /**
   * Deletes a class based on the ID provided in the request query parameters.
   *
   * @param request - The Express request object containing the class ID in the query parameters.
   * @param response - The Express response object used to send the response back to the client.
   */
  public static deleteClass(
    request: express.Request,
    response: express.Response
  ) {
    // Parse the class ID from the query parameters, defaulting to -1 if not provided
    const id: number = +(request?.query?.id ?? -1);

    // Log the request query parameters for debugging purposes
    SLog.log(LogType.Info, "deleteClass", "show query params", request?.query);

    // If the ID is not valid (less than or equal to zero), return an internal server error response
    if (id <= 0) {
      SResponse.getResponse(
        ResponseStatus.Internal_Server_Error,
        null,
        "Server cannot deleted class with id " + id,
        response
      );
      return;
    }

    // Attempt to perform a soft delete on the class with the specified ID
    SClass.softDeleteClass(id, (result) => {
      // If the deletion fails, return an internal server error response
      if (!result) {
        SResponse.getResponse(
          ResponseStatus.Internal_Server_Error,
          null,
          "Server cannot deleted class with id " + id,
          response
        );
        return;
      }

      // If the deletion succeeds, return a success response
      SResponse.getResponse(
        ResponseStatus.OK,
        null,
        "Update class with id " + id + " successfully",
        response
      );
      return;
    });
  }

  public static requestToAttendClass(
    request: express.Request,
    response: express.Response
  ) {
    const userIds = request.body.user_ids;
    const classId = Number(request.params.class_id) ?? -1;

    SClass.joinClass(classId, userIds, (message, result) => {
      // Trả về phản hồi thành công khi lớp học đã được tham gia
      SResponse.getResponse(
        ResponseStatus.OK,
        { message, result },
        "Request to attend class successfully",
        response
      );
    });
  }

  public static acceptClassToTeach(
    request: express.Request,
    response: express.Response
  ) {
    const userId = request.body.tutor_id;
    const classId = Number(request.params.class_id) ?? -1;

    SClass.acceptClassToTeach(classId, userId, (message, result) => {
      // Trả về phản hồi thành công khi lớp học đã được nhận
      SResponse.getResponse(
        ResponseStatus.OK,
        { message, result },
        "Request to accept class successfully",
        response
      );
    });
  }

  public static payForClass(
    request: express.Request,
    response: express.Response
  ) {
    const classId = Number(request.body.class_id) ?? -1;
    const classFee = Number(request.body.class_fee) ?? -1;

    // Lấy đường dẫn file đã upload
    const file = (request as any).file;
    const paidPath = file ? `/uploads/payments/${file.filename}` : null;

    SClass.payForClass(classId, classFee ,paidPath, (message, result) => {
      // Trả về phản hồi thành công khi lớp học đã được nhận
      SResponse.getResponse(
        ResponseStatus.OK,
        { message, result },
        "Pay for class",
        response
      );
    });
  }

  public static acceptTutorForClass(
    request: express.Request,
    response: express.Response
  ) {
    const classId = Number(request.body.class_id) ?? -1;
    const authorAccpeted = Boolean(request.body.author_accepted);

    SClass.acceptTutorForClass(classId, authorAccpeted, (message, result) => {
      // Trả về phản hồi thành công khi lớp học đã được nhận
      SResponse.getResponse(
        ResponseStatus.OK,
        { message, result },
        "Accept tutor for class",
        response
      );
    });
  }



  public static approveToAttendClass(
    request: express.Request,
    response: express.Response
  ) {}

  public static getAllLevels(
    request: express.Request,
    response: express.Response
  ) {}

  public static createLevel(
    request: express.Request,
    response: express.Response
  ) {}

  public static updateLevel(
    request: express.Request,
    response: express.Response
  ) {}

  public static deleteLevel(
    request: express.Request,
    response: express.Response
  ) {}
  // Hàm khoá lớp học
  // Hàm khoá lớp học
  public static LockClass(
    request: express.Request,
    response: express.Response
  ) {
    const classId = request?.body?.classId; // Sửa lại trường `classId`
    console.log("request: " + JSON.stringify(request.body));
    console.log("classId: " + classId);

    // Kiểm tra nếu `classId` không tồn tại
    if (!classId) {
      return response
        .status(400)
        .json({ success: false, message: "Class ID is required." });
    }

    // Gọi phương thức LockClass của SClass
    SClass.LockClass(classId, (result) => {
      if (result) {
        // Nếu thành công, gửi phản hồi JSON
        response
          .status(200)
          .json({ success: true, message: "Class locked successfully." });
      } else {
        // Nếu thất bại, gửi phản hồi lỗi
        response
          .status(500)
          .json({ success: false, message: "Failed to lock class." });
      }
    });
  }
}

// Hàm tính danh sách các ngày cho một ngày cụ thể trong tuần
function calculateLessonDates(
  startDate: number,
  endDate: number,
  daysOfWeek: number[]
): { day: number; started_at: number }[] {
  const result: { day: number; started_at: number }[] = [];
  let current = moment(startDate).startOf("day");

  const end = moment(endDate).endOf("day");
  while (current <= end) {
    const currentDayOfWeek = current.isoWeekday(); // Lấy thứ trong tuần (1: Thứ 2, 7: Chủ Nhật)
    if (daysOfWeek.includes(currentDayOfWeek)) {
      result.push({
        day: currentDayOfWeek,
        started_at: current.valueOf(), // Lưu timestamp
      });
    }
    current.add(1, "day");
  }

  return result;
}