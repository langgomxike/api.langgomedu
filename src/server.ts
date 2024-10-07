import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import SLog, { LogType } from "./services/SLog";
import SMySQL from "./services/SMySQL";
import SFirebase from "./services/SFirebase";
import UserController from "./controllers/UserController";
import path, { dirname } from "path";
import AttendanceController from "./controllers/AttendanceController";
import Config from "./configs/Config";

dotenv.config(); // doc bien moi truong

const app: Express = express();
const port = process.env.PORT || 3000;

app.get("/", (req: Request, res: Response) => {
  res.redirect("/api");
});

app.get("/api", (req: Request, res: Response) => {
  res.sendFile(__dirname + "/index.html");
});

const ATTENDANCE_BASE_URL = Config.PREFIX + "/attendances";
app.get(ATTENDANCE_BASE_URL + "/histories", AttendanceController.getAttendanceHistories);
app.post(ATTENDANCE_BASE_URL + "/request", AttendanceController.requestAttendance);
app.post(ATTENDANCE_BASE_URL + "/accept", AttendanceController.acceptAttendance);
app.get(ATTENDANCE_BASE_URL + "/:id", AttendanceController.getAttendance);

const CERTIFICATE_BASE_URL = Config.PREFIX + "/certificates";

const CERTIFICATE_LEVEL_BASE_URL = Config.PREFIX + "/certificates/levels";

const CLASS_BASE_URL = Config.PREFIX + "/classes";

const CLASS_LEVEL_BASE_URL = Config.PREFIX + "/classes/levels";

const CLASS_REPORT_BASE_URL = Config.PREFIX + "/classes/reports";

const CV_BASE_URL = Config.PREFIX + "/cvs";

const EDUCATION_BASE_URL = Config.PREFIX + "/educations";

const EXPERIENCE_BASE_URL = Config.PREFIX + "/experiences";

const FILE_BASE_URL = Config.PREFIX + "/files";

const GENDER_BASE_URL = Config.PREFIX + "/genders";

const IN_CV_CERTIFICATE_BASE_URL = Config.PREFIX + "/cvs/certificates";

const INFORMATION_BASE_URL = Config.PREFIX + "/infos";

const LESSON_BASE_URL = Config.PREFIX + "/lessons";

const MAJOR_BASE_URL = Config.PREFIX + "/majors";

const MESSAGE_BASE_URL = Config.PREFIX + "/messages";

const OTHER_SKILL_BASE_URL = Config.PREFIX + "/skills";

const PERMISSION_BASE_URL = Config.PREFIX + "/permissions";

const RATING_BASE_URL = Config.PREFIX + "/ratings";

const ROLE_BASE_URL = Config.PREFIX + "/roles";

const STUDENT_BASE_URL = Config.PREFIX + "/students";

const USER_BASE_URL = Config.PREFIX + "/users";
app.post(USER_BASE_URL + "/register", UserController.register);
app.post(USER_BASE_URL + "/auth", UserController.auth);
app.post(USER_BASE_URL + "/login", UserController.login);
app.post(USER_BASE_URL + "/password/reset", (req: Request, res: Response) => res.send)
app.post(USER_BASE_URL + "/password/forget", (req: Request, res: Response) => res.send)
app.put(USER_BASE_URL);
app.patch(USER_BASE_URL);

const USER_REPORT_BASE_URL = "/users/report";

app.listen(port, () => {
  SLog.log(LogType.Info, "Listen", "server is running at http://127.0.0.1", port);

  // goi mysql server de chay na
  SMySQL.connect();
});

export default app;