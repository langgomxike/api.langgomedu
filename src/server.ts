import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import SLog, { LogType } from "./services/SLog";
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

dotenv.config(); // doc bien moi truong

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.redirect("/api");
});

app.get("/api", (req: Request, res: Response) => {
  res.sendFile(__dirname + "/index.html");
});

app.use('/public', express.static('public'));

const ATTENDANCE_BASE_URL = Config.PREFIX + "/attendances";
app.get(ATTENDANCE_BASE_URL + "/histories", AttendanceController.getAttendanceHistories);
app.post(ATTENDANCE_BASE_URL + "/request", AttendanceController.requestAttendance);
app.post(ATTENDANCE_BASE_URL + "/accept", AttendanceController.acceptAttendance);
app.get(ATTENDANCE_BASE_URL + "/id", AttendanceController.getAttendance);

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
app.get(CLASS_BASE_URL + "/suggests", ClassController.getSuggestedClasses);
app.get(CLASS_BASE_URL + "/attending", ClassController.getAttendingClasses);
app.get(CLASS_BASE_URL + "/teaching", ClassController.getTeachingClasses);
app.get(CLASS_BASE_URL + "/:id", ClassController.getClass);
app.post(CLASS_BASE_URL, ClassController.createClass);
app.put(CLASS_BASE_URL, ClassController.updateClass);
app.patch(CLASS_BASE_URL, ClassController.updateClass);
app.delete(CLASS_BASE_URL + "/:id", ClassController.deleteClass);
app.post(CLASS_BASE_URL + "/request/:id", ClassController.requestToAttendClass);
app.post(CLASS_BASE_URL + "/accept/:id", ClassController.acceptToAttendClass);
app.post(CLASS_BASE_URL + "/approve/:id", ClassController.approveToAttendClass);
app.get(CLASS_BASE_URL + "/levels", ClassController.getAllLevels);
app.post(CLASS_BASE_URL + "/levels", ClassController.createLevel);
app.put(CLASS_BASE_URL + "/levels/:id", ClassController.updateLevel);
app.patch(CLASS_BASE_URL + "/levels/:id", ClassController.updateLevel);
app.delete(CLASS_BASE_URL + "/levels/:id", ClassController.deleteLevel);

const LESSON_BASE_URL = Config.PREFIX + "/lessons";
app.get(LESSON_BASE_URL + "/:class", LessonController.getLessonsInClass);
app.post(LESSON_BASE_URL + "/:class", LessonController.createLesson);
app.put(LESSON_BASE_URL + "/:id", LessonController.updateLesson);
app.patch(LESSON_BASE_URL + "/:id", LessonController.updateLesson);
app.delete(LESSON_BASE_URL + "/:id", LessonController.deleteLesson);

const REPORT_BASE_URL = Config.PREFIX + "/reports";
app.get(REPORT_BASE_URL + "/class", ReportController.getAllClassReports);
app.get(REPORT_BASE_URL + "/class/:id", ReportController.getClassReport);
app.post(REPORT_BASE_URL + "/class", ReportController.createClassReport);
app.post(REPORT_BASE_URL + "/class/:id", ReportController.approveClassReport);
app.get(REPORT_BASE_URL + "/user", ReportController.getAllUserReports);
app.get(REPORT_BASE_URL + "/user/:id", ReportController.getUserReport);
app.post(REPORT_BASE_URL + "/user", ReportController.createUserReport);
app.post(REPORT_BASE_URL + "/user/:id", ReportController.approveUserReport);

const CV_BASE_URL = Config.PREFIX + "/cvs";
app.get(CV_BASE_URL, CVController.getAllCVs);
app.get(CV_BASE_URL + "/suggest", CVController.getSuggestedCVs);
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
app.get(MESSAGE_BASE_URL + "/contacts/:id", MessageController.getContacts);
app.get(MESSAGE_BASE_URL + "/inboxes/:id", MessageController.getInboxUsers);
app.get(MESSAGE_BASE_URL + "/:from/:to", MessageController.getMessages);
app.post(MESSAGE_BASE_URL, MessageController.createMessage);
app.delete(MESSAGE_BASE_URL, MessageController.deleteMessage);

const OTHER_SKILL_BASE_URL = Config.PREFIX + "/skills";
app.get(OTHER_SKILL_BASE_URL, OtherSkillController.getAllSkills);
app.post(OTHER_SKILL_BASE_URL, OtherSkillController.createSkill);
app.put(OTHER_SKILL_BASE_URL, OtherSkillController.updateSkill);
app.patch(OTHER_SKILL_BASE_URL, OtherSkillController.updateSkill);
app.delete(OTHER_SKILL_BASE_URL, OtherSkillController.deleteSkill);

const PERMISSION_BASE_URL = Config.PREFIX + "/permissions"; // host:port/PREFIX/permissions (PREFIX: /api)
app.get(PERMISSION_BASE_URL, PermissionController.getAllPermissions);

const RATING_BASE_URL = Config.PREFIX + "/ratings";
app.get(RATING_BASE_URL + "/:class", RatingController.getRatings);
app.post(RATING_BASE_URL, RatingController.createRating);

const ROLE_BASE_URL = Config.PREFIX + "/roles";
app.get(ROLE_BASE_URL, RoleController.getAllRoles);

const STUDENT_BASE_URL = Config.PREFIX + "/students";
app.get(STUDENT_BASE_URL + "/:user", StudentController.getStudentsBelongToUser);
app.get(STUDENT_BASE_URL + "/:class", StudentController.getStudentsInClass);
app.post(STUDENT_BASE_URL, StudentController.createStudent);
app.put(STUDENT_BASE_URL + "/:id", StudentController.updateStudent);
app.patch(STUDENT_BASE_URL + "/:id", StudentController.updateStudent);
app.delete(STUDENT_BASE_URL + "/:id", StudentController.deleteStudent);


const USER_BASE_URL = Config.PREFIX + "/users";
app.get(USER_BASE_URL, UserController.getAllUsers);
app.get(USER_BASE_URL + "/:id", UserController.getUser);
app.post(USER_BASE_URL + "/register", UserController.registerUser);
app.post(USER_BASE_URL + "/register/admin", UserController.registerAdmin);
app.post(USER_BASE_URL + "/auth", UserController.auth);
app.post(USER_BASE_URL + "/login", UserController.login);
app.post(USER_BASE_URL + "/password/reset/:id", UserController.resetPassword);
app.post(USER_BASE_URL + "/password/change/:id", UserController.changePassword);
app.put(USER_BASE_URL + "/:id", UserController.updateUserInfo);
app.patch(USER_BASE_URL + "/:id", UserController.updateUserInfo);
app.delete(USER_BASE_URL + "/:id", UserController.deleteAccount);

app.listen(port, () => {
  SLog.log(LogType.Info, "Listen", "server is running at http://127.0.0.1", port);

  SMySQL.connect();
  DatabaseSeeder.seed();
});

DatabaseSeeder.fake();

export default app;