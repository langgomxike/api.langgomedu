// Import necessary modules and libraries
// @ts-ignore
import express, {Express, Request, Response} from "express";
// @ts-ignore
import dotenv from "dotenv";
import SLog, {LogType} from "./services/SLog";
import SMySQL from "./services/SMySQL";
import UserController from "./controllers/UserController";
import AttendanceController from "./controllers/AttendanceController";
import Config from "./configs/Config";
import CertificateController from "./controllers/CertificateController";
import ClassController from "./controllers/ClassController";
import ReportController from "./controllers/ReportController";
import CVController from "./controllers/CVController";
import MajorController from "./controllers/MajorController";
import MessageController from "./controllers/MessageController";
import OtherSkillController from "./controllers/OtherSkillController";
import PermissionController from "./controllers/PermissionController";
import RatingController from "./controllers/RatingController";
import RoleController from "./controllers/RoleController";
import StudentController from "./controllers/StudentController";
import LessonController from "./controllers/LessonController";
import DatabaseSeeder from "./seeders/DatabaseSeeder";
import SAuthentication, {OWNING_KEY_COLUMNS, OWNING_REF_COLUMNS, OWNING_REF_TABLES} from "./services/SAuthentication";
import PermissionList, {setUpPermissions} from "./configs/PermissionConfig";
import {setUpGenders} from "./configs/GenderConfig";
import SFirebase, {FirebaseNode} from "./services/SFirebase";
import AdminController from "./controllers/admin/AdminController";
import {uploadPayment, uploadReports} from "./configs/MulterConfig";
import SResponse, { ResponseStatus } from "./services/SResponse";
import { ClassLevelController } from "./controllers/ClassLevelController";
import {setUpRoles} from "./configs/RoleConfig";
import {setUpUsers} from "./configs/UserConfig";
import SMessage from "./services/SMessage";
import bodyParser = require("body-parser");
// @ts-ignore
import multer from "multer";
// @ts-ignore
import path from "path";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.redirect("/api");
});

app.get("/api", (req: Request, res: Response) => {
  res.sendFile(__dirname + "/index.html");
});

app.use('/', express.static('public'));

app.use('/avatars', express.static(path.join(__dirname, 'images/avatars')));


app.use(bodyParser.urlencoded({extended: true}));

const upload = multer({
  dest: 'public/uploads/messages/',
});

interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

// ClassLevel routes
const CLASSLEVEL_BASE_URL = Config.PREFIX + "/class-levels";
app.get(CLASSLEVEL_BASE_URL, ClassLevelController.getAllClassLevels);

// Attendance routes
const ATTENDANCE_BASE_URL = Config.PREFIX + "/attendances";
app.get(ATTENDANCE_BASE_URL + "/histories", AttendanceController.getAttendanceHistories);
app.post(ATTENDANCE_BASE_URL + "/request", AttendanceController.requestAttendance);
app.put(ATTENDANCE_BASE_URL + "/accept", AttendanceController.acceptAttendance);
app.get(ATTENDANCE_BASE_URL + "/learner/:class_id/:lesson_id/:user_id", AttendanceController.getAttendanceByLearnerClassLesson);
app.get(ATTENDANCE_BASE_URL + "/tutor/:class_id/:lesson_id/:user_id", AttendanceController.getAttendanceByTutorClassLesson);
app.post(ATTENDANCE_BASE_URL + "/pay", uploadPayment.single('file'),AttendanceController.updatePaymentOfLearner);
app.post(ATTENDANCE_BASE_URL + "/confirm_paid",AttendanceController.confirmPaymentByTutor);


// Define the base URL for certificate-related routes
const CERTIFICATE_BASE_URL = Config.PREFIX + "/certificates";
app.get(CERTIFICATE_BASE_URL, CertificateController.getAllCertificates);
app.post(CERTIFICATE_BASE_URL, CertificateController.createCertificate);
app.put(CERTIFICATE_BASE_URL, CertificateController.updateCertificate);
app.patch(CERTIFICATE_BASE_URL, CertificateController.updateCertificate);
app.delete(CERTIFICATE_BASE_URL, CertificateController.deleteCertificate);
app.get(CERTIFICATE_BASE_URL + "/levels", CertificateController.getAllLevels);
app.post(CERTIFICATE_BASE_URL + "/levels", CertificateController.createLevel);
app.put(CERTIFICATE_BASE_URL + "/levels", CertificateController.updateLevel);
app.patch(CERTIFICATE_BASE_URL + "/levels", CertificateController.updateLevel);
app.delete(CERTIFICATE_BASE_URL + "/levels", CertificateController.deleteLevel);
app.get(CERTIFICATE_BASE_URL + "/:id/levels", CertificateController.getAllLevelsOfOneCertificate);

const CLASS_BASE_URL = Config.PREFIX + "/classes";
app.get(CLASS_BASE_URL, ClassController.getAllClasses);
app.get(CLASS_BASE_URL + "/suggests/filter/:user_id", ClassController.getSuggestedClasses);
app.get(CLASS_BASE_URL + "/suggests/:user_id", ClassController.getSuggestsClasses);
app.get(CLASS_BASE_URL + "/attending/:user_id", ClassController.getAttendingClasses);
app.get(CLASS_BASE_URL + "/teaching/:user_id", ClassController.getTeachingClasses);
app.get(CLASS_BASE_URL + "/created/:user_id", ClassController.getCreatedClasses);
app.get(CLASS_BASE_URL + "/:class_id", ClassController.getClass);
app.post(CLASS_BASE_URL + "/create", ClassController.createClass);
app.put(CLASS_BASE_URL, ClassController.updateClass);
app.patch(CLASS_BASE_URL, ClassController.updateClass);
app.delete(CLASS_BASE_URL,
  (req, res, onNext) => SAuthentication.checkAuthorization(
    req, res, onNext,
    OWNING_REF_TABLES.PERSONAL_CLASS,
    OWNING_REF_COLUMNS.AUTHOR_ID,
    OWNING_KEY_COLUMNS.iD
  ),
  (req, res, onNext) => SAuthentication.checkAuthentication(
    req, res, onNext,
    [
      PermissionList.DELETE_PERSONAL_CLASS,
      PermissionList.DELETE_OTHER_USER_CLASS,
    ]
  ),
  ClassController.deleteClass
);
app.post(CLASS_BASE_URL + "/:class_id/join", ClassController.requestToAttendClass);
app.post(CLASS_BASE_URL + "/:class_id/accept_to_teach", ClassController.acceptClassToTeach);
app.post(CLASS_BASE_URL + "/approve/:id", ClassController.approveToAttendClass);

app.get(CLASS_BASE_URL + "/levels", ClassController.getAllLevels); //
app.post(CLASS_BASE_URL + "/levels", ClassController.createLevel);
app.put(CLASS_BASE_URL + "/levels/:id", ClassController.updateLevel);
app.patch(CLASS_BASE_URL + "/levels/:id", ClassController.updateLevel);
app.delete(CLASS_BASE_URL + "/levels/:id", ClassController.deleteLevel);

const LESSON_BASE_URL = Config.PREFIX + "/lessons";
app.get(LESSON_BASE_URL + "/:class", LessonController.getLessonsInClass);
// app.post(LESSON_BASE_URL + "/:class", LessonController.createLesson);
app.put(LESSON_BASE_URL + "/:id", LessonController.updateLesson);
app.patch(LESSON_BASE_URL + "/:id", LessonController.updateLesson);
app.delete(LESSON_BASE_URL + "/:id", LessonController.deleteLesson);
app.get(LESSON_BASE_URL, LessonController.getTutorSchedule);
//demo
// app.get(LESSON_BASE_URL, LessonController.demoLesson);

const REPORT_BASE_URL = Config.PREFIX + "/reports";
app.get(REPORT_BASE_URL + "/class", ReportController.getAllClassReports);
app.get(REPORT_BASE_URL + "/class/:id", ReportController.getClassReport);

app.post(REPORT_BASE_URL + "/class/:id", ReportController.approveClassReport);
app.get(REPORT_BASE_URL + "/user", ReportController.getAllUserReports);
app.get(REPORT_BASE_URL + "/user/:id", ReportController.getUserReport);
// app.post(REPORT_BASE_URL + "/user", ReportController.createUserReport);
app.post(REPORT_BASE_URL + "/user/:id", ReportController.approveUserReport);

//trừ điểm uy tín của người dùng
app.post(REPORT_BASE_URL + "/minusUserPoints", UserController.MinusUserPoints);
//khoá tài khoản của người dùng
app.post(REPORT_BASE_URL + "/lockUserAccount", UserController.LockUserAccount);
//khoá lớp học của người dùng
app.post(REPORT_BASE_URL + "/lockClass", ClassController.LockClass);
//khoá reports
app.post(REPORT_BASE_URL + "/lockReport", ReportController.LockReport);
//tạo report
app.post(REPORT_BASE_URL + "/created_report",uploadReports.array('reports', 10), ReportController.createReport);


const CV_BASE_URL = Config.PREFIX + "/cvs";
app.get(CV_BASE_URL, CVController.getAllCVs);
app.get(CV_BASE_URL + "/suggests", CVController.getSuggestedCVs);
app.get(CV_BASE_URL + "/suggests/filters", CVController.getSuggestedCVsFilter);
app.get(CV_BASE_URL + "/:id", CVController.getCV);
app.post(CV_BASE_URL, CVController.createCV);
app.put(CV_BASE_URL + "/:id", CVController.updateCV);
app.patch(CV_BASE_URL + "/:id", CVController.updateCV);
app.delete(CV_BASE_URL + "/:id", CVController.deleteCV);
app.post(CV_BASE_URL + "/approve/:id", CVController.approveCV);

const MAJOR_BASE_URL = Config.PREFIX + "/majors";
app.get(MAJOR_BASE_URL, MajorController.getAllMajors);
app.post(MAJOR_BASE_URL, MajorController.createMajor);
app.put(MAJOR_BASE_URL + "/:id", MajorController.updateMajor);
app.patch(MAJOR_BASE_URL + "/:id", MajorController.updateMajor);
app.delete(MAJOR_BASE_URL + "/:id", MajorController.deleteMajor);

const MESSAGE_BASE_URL = Config.PREFIX + "/messages";
app.get(MESSAGE_BASE_URL + "/contacts", MessageController.getContacts);
app.get(MESSAGE_BASE_URL + "/notifications", MessageController.getNotifications);
app.put(MESSAGE_BASE_URL + "/notifications/mark-as-read", MessageController.markAsReadNotifications);
app.patch(MESSAGE_BASE_URL + "/notifications/mark-as-read", MessageController.markAsReadNotifications);
app.delete(MESSAGE_BASE_URL + "/notifications/:id", MessageController.deleteNotification);
app.get(MESSAGE_BASE_URL + "/inboxes/group", MessageController.getInboxClasses);
app.get(MESSAGE_BASE_URL + "/inboxes", MessageController.getInboxUsers);
app.post(MESSAGE_BASE_URL + "/two-users", MessageController.getMessages);
app.post(MESSAGE_BASE_URL + "/image", upload.single('file'), MessageController.createImageMessage);
app.put(MESSAGE_BASE_URL + "/two-users/mark-as-read", MessageController.markAsRead);
app.patch(MESSAGE_BASE_URL + "/two-users/mark-as-read", MessageController.markAsRead);
app.put(MESSAGE_BASE_URL + "/group/mark-as-read", MessageController.markAsReadClassMessges);
app.patch(MESSAGE_BASE_URL + "/group/mark-as-read", MessageController.markAsReadClassMessges);
app.post(MESSAGE_BASE_URL + "/group", MessageController.createClassMessage);
app.put(MESSAGE_BASE_URL + "/group", MessageController.deleteClassMessage);
app.patch(MESSAGE_BASE_URL + "/group", MessageController.deleteClassMessage);
app.get(MESSAGE_BASE_URL + "/group/:id", MessageController.getClassMessages);
app.post(MESSAGE_BASE_URL, MessageController.createMessage);
app.put(MESSAGE_BASE_URL, MessageController.deleteMessage);
app.patch(MESSAGE_BASE_URL, MessageController.deleteMessage);

const OTHER_SKILL_BASE_URL = Config.PREFIX + "/skills";
app.get(OTHER_SKILL_BASE_URL, OtherSkillController.getAllSkills);
app.post(OTHER_SKILL_BASE_URL, OtherSkillController.createSkill);
app.put(OTHER_SKILL_BASE_URL, OtherSkillController.updateSkill);
app.patch(OTHER_SKILL_BASE_URL, OtherSkillController.updateSkill);
app.delete(OTHER_SKILL_BASE_URL, OtherSkillController.deleteSkill);

const PERMISSION_BASE_URL = Config.PREFIX + "/permissions";
app.get(PERMISSION_BASE_URL, PermissionController.getAllPermissions);
app.get(PERMISSION_BASE_URL + "/of-user", PermissionController.getPermissionsOfUser);
app.get(PERMISSION_BASE_URL + "/of-role/:id", PermissionController.getPermissionsOfRole);

const RATING_BASE_URL = Config.PREFIX + "/ratings";
app.get(RATING_BASE_URL + "/:id", RatingController.getRatings);
app.post(RATING_BASE_URL, RatingController.createRating);

const ROLE_BASE_URL = Config.PREFIX + "/roles";
app.get(ROLE_BASE_URL, RoleController.getAllRoles);
app.post(ROLE_BASE_URL, RoleController.createRole);
app.delete(ROLE_BASE_URL + "/:id", RoleController.deleteRole);
app.put(ROLE_BASE_URL + "/permissions", RoleController.updatePermissionsOfRole);
app.patch(ROLE_BASE_URL + "/permissions", RoleController.updatePermissionsOfRole);

const STUDENT_BASE_URL = Config.PREFIX + "/students";
// Student routes
app.get(STUDENT_BASE_URL, StudentController.getAllStudents);
app.get(STUDENT_BASE_URL + "/user/:user_id", StudentController.getStudentsBelongToUser);
app.get(STUDENT_BASE_URL + "/class/:class_id", StudentController.getStudentsInClass);
app.post(STUDENT_BASE_URL, StudentController.createStudent);
app.put(STUDENT_BASE_URL + "/:id", StudentController.updateStudent);
app.patch(STUDENT_BASE_URL + "/:id", StudentController.updateStudent);
app.delete(STUDENT_BASE_URL + "/:id", StudentController.deleteStudent);

const USER_BASE_URL = Config.PREFIX + "/users";
app.get(USER_BASE_URL, UserController.getAllUsers);
app.get(USER_BASE_URL + "/:id", UserController.getUserInfo);
app.post(USER_BASE_URL + "/register", UserController.registerUser);
app.post(USER_BASE_URL + "/register/admin", UserController.registerAdmin);
app.post(USER_BASE_URL + "/auth", UserController.auth);
app.post(USER_BASE_URL + "/login", UserController.login);
app.post(USER_BASE_URL + "/change-password", UserController.changePassword);
app.post(USER_BASE_URL + "/login/implicit", UserController.implicitLogin);
app.post(USER_BASE_URL + "/password/reset/:id", UserController.resetPassword);
app.post(USER_BASE_URL + "/password/change/:id", UserController.changePassword);
app.put(USER_BASE_URL, UserController.updateUserInfo);
app.patch(USER_BASE_URL, UserController.updateUserInfo);
app.delete(USER_BASE_URL + "/:id", UserController.deleteAccount);

// Define the base URL for user-related routes
const ADMIN_USER_BASE_URL = Config.PREFIX + "/admin";
app.get(ADMIN_USER_BASE_URL + "/users", AdminController.getUsers);
app.get(ADMIN_USER_BASE_URL + "/users/:user_id/reports", AdminController.getAllReportUserOfUser);
app.get(ADMIN_USER_BASE_URL + "/classes", AdminController.getAllClasses);
app.get(ADMIN_USER_BASE_URL + "/classes/:class_id", AdminController.getDetailClass);

app.listen(port, () => {
  SLog.log(LogType.Info, "Listen to the port", "server is running at http://127.0.0.1", port);
});

SMySQL.connect();
setUpPermissions();
setUpRoles();
setUpGenders();
setUpUsers();

export default app;

// SMessage.createNotification("thong bao thu " + new Date(), "000004_child001", () => {});