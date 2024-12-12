import * as dotenv from "dotenv";
// @ts-ignore
import admin, {database, initializeApp} from "firebase-admin";
// @ts-ignore
import firebaseAccount from "../../admin_firebase_account_service.json";
import SLog, {LogType} from "./SLog";
// @ts-ignore
import firebaseNodeProps from "../../firebase_node_props.json";

export enum FirebaseNode {
  AppInfos = "general_infos",
  initialPoint = "initial_point",
  PhoneNumber = "phone_number",
  OTPServiceKey = "otp_service_key",
  Addresses = "addresses",
  Attendances = "attendances",
  Certificates = "certificates",
  ClassLevels = "class_levels",
  ClassMembers = "class_members",
  Classes = "classes",
  CVs = "cvs",
  Educations = "educations",
  Experiences = "experiences",
  Files = "files",
  Genders = "genders",
  InterestedClassLevels = "interested_class_levels",
  InterestedMajors = "interested_majors",
  Lessons = "lessons",
  Majors = "majors",
  Messages = "messages",
  Notifications = "notifications",
  OTPs = "otps",
  Permissions = "permissions",
  Ratings = "ratings",
  ReportFiles = "report_files",
  Reports = "reports",
  RolePermission = "role_permission",
  Roles = "roles",
  Statuses = "statuses",
  UserRole = "user_role",
  Users = "users",
  Id = "id",
  ClassId = "class_id",
  LessonId = "lesson_id",
  UserId = "user_id",
  FromUserId = "from_user_id",
  ToUserId = "to_user_id",
  MessageId = "message_id",
  ClassLevelId = "class_level_id",
  MajorId = "major_id",
  GenderId = "gender_id",
  CertificateId = "certificate_id",
  EducationId = "education_id",
  ExperienceId = "experience_id",
  ReportId = "report_id",
  RoleId = "role_id",
  PermissionId = "permission_id",
  StatusId = "status_id",
  ReportFileId = "report_file_id",
  FileId = "file_id",
  OTPId = "otp_id",
}

export default class SFirebase {
  private static dbRef: admin.database.Database;

  private static init() {
    if (!this.dbRef) {
      dotenv.config();

      const dbURL = process.env.FIREBASE_DATABASE || "";

      this.dbRef = admin
        .initializeApp({
          credential: admin.credential.cert(
            firebaseAccount as admin.ServiceAccount
          ),
          databaseURL: dbURL,
        })
        ?.database();

      SLog.log(
        LogType.Info,
        "Firebase Database",
        "Connected to firebase realtime database",
        (this.dbRef.app.name as unknown) ?? {}
      );
    }
  }

  public static push(parentNode: FirebaseNode, keyNodes: {
    key: FirebaseNode,
    value: string | number | any
  }[], onNext: () => void, value?: string | number | any) {
    this.init();

    let node = `${parentNode}/${keyNodes.map((keyNode) => `${keyNode.key}:${keyNode.value}`).join("|")}`;
    const firebaseReference = this.dbRef.ref(node);
    const currentTime = new Date().getTime();

    firebaseReference.set(value ?? currentTime, (error) => {
      if (error) {
        SLog.log(
          LogType.Error,
          `push data into firebase`,
          `push data to the node ${parentNode} with key ${node} found error`,
          error
        );

      } else {
        SLog.log(
          LogType.Info,
          `push data into firebase`,
          `push data to the node ${parentNode} with key ${node} successfully`,
        );
      }
      onNext();
    });
  }

  public static delete(parentNode: FirebaseNode, keyNodes: {
    key: FirebaseNode,
    value: string | number
  }[], onNext: () => void) {
    this.init();

    let node = `${parentNode}/${keyNodes.map((keyNode) => `${keyNode.key}:${keyNode.value}`).join("|")}`;
    const firebaseReference = this.dbRef.ref(node);

    firebaseReference.remove((error) => {
      if (error) {
        SLog.log(
          LogType.Error,
          `remove node in firebase`,
          `remove the node ${parentNode} with key ${node} found error`,
          error
        );

      } else {
        SLog.log(
          LogType.Info,
          `remove node in firebase`,
          `remove the node ${parentNode} with key ${node} successfully`,
        );
      }
      onNext();
    });
  }

  public static getData(
    parentNode: FirebaseNode, keyNodes: {
      key: FirebaseNode,
      value: string | number
    }[], onNext: (data: any) => void) {
    this.init();

    let node = `${parentNode}/${keyNodes.map((keyNode) => `${keyNode.key}:${keyNode.value}`).join("|")}`;
    const firebaseReference = this.dbRef.ref(node);

    firebaseReference.get<number>()
      .then((value) => {
        SLog.log(
          LogType.Info,
          `get data from node in firebase`,
          `get data from the node ${parentNode} with key ${node} successfully`,
        );

        onNext(value?.val());

      })
      .catch(error => {
        SLog.log(
          LogType.Error,
          `get data from node in firebase`,
          `get data from the node ${parentNode} with key ${node} found error`,
          error
        );
      });
  }

}
