// Import necessary modules and libraries
import express, { Express, Request, Response } from "express"; // Import express and types for Request and Response
import dotenv from "dotenv"; // Import dotenv for environment variable management
import SLog, { LogType } from "./services/SLog"; // Import custom logging service
import SMySQL from "./services/SMySQL"; // Import custom MySQL service for database interactions
import UserController from "./controllers/UserController"; // Import UserController for user-related routes
import AttendanceController from "./controllers/AttendanceController"; // Import AttendanceController for attendance-related routes
import Config from "./configs/Config"; // Import configuration settings
import CertificateController from "./controllers/CertificateController"; // Import CertificateController for certificate-related routes
import ClassController from "./controllers/ClassController"; // Import ClassController for class-related routes
import ReportController from "./controllers/ReportController"; // Import ReportController for report-related routes
import CVController from "./controllers/CVController"; // Import CVController for CV-related routes
import MajorController from "./controllers/MajorController"; // Import MajorController for major-related routes
import MessageController from "./controllers/MessageController"; // Import MessageController for messaging-related routes
import OtherSkillController from "./controllers/OtherSkillController"; // Import OtherSkillController for skill-related routes
import PermissionController from "./controllers/PermissionController"; // Import PermissionController for permissions-related routes
import RatingController from "./controllers/RatingController"; // Import RatingController for ratings-related routes
import RoleController from "./controllers/RoleController"; // Import RoleController for role-related routes
import StudentController from "./controllers/StudentController"; // Import StudentController for student-related routes
import LessonController from "./controllers/LessonController"; // Import LessonController for lesson-related routes
import DatabaseSeeder from "./seeders/DatabaseSeeder"; // Import DatabaseSeeder for seeding the database
import SAuthentication, { OWNING_KEY_COLUMNS, OWNING_REF_COLUMNS, OWNING_REF_TABLES } from "./services/SAuthentication"; // Import SAuthentication for authentication checks
import PermissionList, { setUpPermissions } from "./configs/PermissionConfig"; // Import permissions configuration and setup function
import { setUpGenders } from "./configs/GenderConfig";
import SFirebase, { FirebaseNode } from "./services/SFirebase";

// Load environment variables from a .env file into process.env
dotenv.config(); // doc bien moi truong

// Create an Express application
const app: Express = express();
const port = process.env.PORT || 3000; // Set the port to the value from environment variables or default to 3000

// Middleware to parse JSON bodies from incoming requests
app.use(express.json());



// Route to redirect root requests to the API documentation
app.get("/", (req: Request, res: Response) => {
  res.redirect("/api");
});

// Route to serve the main API documentation page
app.get("/api", (req: Request, res: Response) => {
  res.sendFile(__dirname + "/index.html"); // Send the index.html file located in the root directory
});

// Serve static files from the 'public' directory
app.use('/', express.static('public'));

// Define the base URL for attendance-related routes using the prefix from the config
const ATTENDANCE_BASE_URL = Config.PREFIX + "/attendances";

// Attendance routes
app.get(ATTENDANCE_BASE_URL + "/histories", AttendanceController.getAttendanceHistories); // Get attendance histories
app.post(ATTENDANCE_BASE_URL + "/request", AttendanceController.requestAttendance); // Request attendance
app.post(ATTENDANCE_BASE_URL + "/accept", AttendanceController.acceptAttendance); // Accept attendance
app.get(ATTENDANCE_BASE_URL + "/id", AttendanceController.getAttendance); // Get specific attendance

// Define the base URL for certificate-related routes
const CERTIFICATE_BASE_URL = Config.PREFIX + "/certificates";
// Certificate routes
app.get(CERTIFICATE_BASE_URL, CertificateController.getAllCertificates); // Get all certificates
app.post(CERTIFICATE_BASE_URL, CertificateController.createCertificate); // Create a new certificate
app.put(CERTIFICATE_BASE_URL, CertificateController.updateCertificate); // Update an existing certificate
app.patch(CERTIFICATE_BASE_URL, CertificateController.updateCertificate); // Partially update a certificate
app.delete(CERTIFICATE_BASE_URL, CertificateController.deleteCertificate); // Delete a certificate
app.get(CERTIFICATE_BASE_URL + "/levels", CertificateController.getAllLevels); // Get all levels for certificates
app.post(CERTIFICATE_BASE_URL + "/levels", CertificateController.createLevel); // Create a new certificate level
app.put(CERTIFICATE_BASE_URL + "/levels", CertificateController.updateLevel); // Update an existing certificate level
app.patch(CERTIFICATE_BASE_URL + "/levels", CertificateController.updateLevel); // Partially update a certificate level
app.delete(CERTIFICATE_BASE_URL + "/levels", CertificateController.deleteLevel); // Delete a certificate level
app.get(CERTIFICATE_BASE_URL + "/:id/levels", CertificateController.getAllLevelsOfOneCertificate); // Get levels of a specific certificate

// Define the base URL for class-related routes
const CLASS_BASE_URL = Config.PREFIX + "/classes";
// Class routes
app.get(CLASS_BASE_URL, ClassController.getAllClasses); // Get all classes
app.get(CLASS_BASE_URL + "/suggests", ClassController.getSuggestedClasses); // Get suggested classes
app.get(CLASS_BASE_URL + "/attending", ClassController.getAttendingClasses); // Get classes currently attended
app.get(CLASS_BASE_URL + "/teaching", ClassController.getTeachingClasses); // Get classes currently taught
app.get(CLASS_BASE_URL + "/:id", ClassController.getClass); // Get specific class by ID
app.post(CLASS_BASE_URL, ClassController.createClass); // Create a new class
app.put(CLASS_BASE_URL, ClassController.updateClass); // Update an existing class
app.patch(CLASS_BASE_URL, ClassController.updateClass); // Partially update a class

// DELETE endpoint for CLASS_BASE_URL to handle class deletion
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
      PermissionList.DELETE_PERSONAL_CLASS, // Permission for personal class deletion
      PermissionList.DELETE_OTHER_USER_CLASS, // Permission for deleting another user's class
    ]
  ),
  ClassController.deleteClass
); // Class deletion (authentication required)

app.post(CLASS_BASE_URL + "/request/:id", ClassController.requestToAttendClass); // Request to attend a class
app.post(CLASS_BASE_URL + "/accept/:id", ClassController.acceptToAttendClass); // Accept a request to attend a class
app.post(CLASS_BASE_URL + "/approve/:id", ClassController.approveToAttendClass); // Approve attendance for a class
app.get(CLASS_BASE_URL + "/levels", ClassController.getAllLevels); // Get all levels for classes
app.post(CLASS_BASE_URL + "/levels", ClassController.createLevel); // Create a new class level
app.put(CLASS_BASE_URL + "/levels/:id", ClassController.updateLevel); // Update an existing class level
app.patch(CLASS_BASE_URL + "/levels/:id", ClassController.updateLevel); // Partially update a class level
app.delete(CLASS_BASE_URL + "/levels/:id", ClassController.deleteLevel); // Delete a class level

// Define the base URL for lesson-related routes
const LESSON_BASE_URL = Config.PREFIX + "/lessons";
// Lesson routes
app.get(LESSON_BASE_URL + "/:class", LessonController.getLessonsInClass); // Get lessons for a specific class
app.post(LESSON_BASE_URL + "/:class", LessonController.createLesson); // Create a new lesson in a specific class
app.put(LESSON_BASE_URL + "/:id", LessonController.updateLesson); // Update an existing lesson
app.patch(LESSON_BASE_URL + "/:id", LessonController.updateLesson); // Partially update a lesson
app.delete(LESSON_BASE_URL + "/:id", LessonController.deleteLesson); // Delete a lesson

// Define the base URL for report-related routes
const REPORT_BASE_URL = Config.PREFIX + "/reports";
// Report routes for classes
app.get(REPORT_BASE_URL + "/class", ReportController.getAllClassReports); // Get all class reports 
app.get(REPORT_BASE_URL + "/class/:id", ReportController.getClassReport); // Get a specific class report by ID
app.post(REPORT_BASE_URL + "/class", ReportController.createClassReport); // Create a new class report
app.post(REPORT_BASE_URL + "/class/:id", ReportController.approveClassReport); // Approve a class report
// Report routes for users
app.get(REPORT_BASE_URL + "/user", ReportController.getAllUserReports); // Get all user reports
app.get(REPORT_BASE_URL + "/user/:id", ReportController.getUserReport); // Get a specific user report by ID
app.post(REPORT_BASE_URL + "/user", ReportController.createUserReport); // Create a new user report
app.post(REPORT_BASE_URL + "/user/:id", ReportController.approveUserReport); // Approve a user report

// Define the base URL for CV-related routes
const CV_BASE_URL = Config.PREFIX + "/cvs";
// CV routes
app.get(CV_BASE_URL, CVController.getAllCVs); // Get all CVs
app.get(CV_BASE_URL + "/suggest", CVController.getSuggestedCVs); // Get suggested CVs
app.get(CV_BASE_URL + "/:id", CVController.getCV); // Get specific CV by ID
app.post(CV_BASE_URL, CVController.createCV); // Create a new CV
app.put(CV_BASE_URL + "/:id", CVController.updateCV); // Update an existing CV
app.patch(CV_BASE_URL + "/:id", CVController.updateCV); // Partially update a CV
app.delete(CV_BASE_URL + "/:id", CVController.deleteCV); // Delete a CV
app.post(CV_BASE_URL + "/approve/:id", CVController.approveCV); // Approve a CV

// Define the base URL for major-related routes
const MAJOR_BASE_URL = Config.PREFIX + "/majors";
// Major routes
app.get(MAJOR_BASE_URL, MajorController.getAllMajors); // Get all majors
app.post(MAJOR_BASE_URL, MajorController.createMajor); // Create a new major
app.put(MAJOR_BASE_URL + "/:id", MajorController.updateMajor); // Update an existing major
app.patch(MAJOR_BASE_URL + "/:id", MajorController.updateMajor); // Partially update a major
app.delete(MAJOR_BASE_URL + "/:id", MajorController.deleteMajor); // Delete a major

// Define the base URL for message-related routes
const MESSAGE_BASE_URL = Config.PREFIX + "/messages";
// Message routes
app.get(MESSAGE_BASE_URL + "/contacts/:id", MessageController.getContacts); // Get contacts for a user
app.get(MESSAGE_BASE_URL + "/inboxes/:id", MessageController.getInboxUsers); // Get inbox users for a user
app.get(MESSAGE_BASE_URL + "/:from/:to", MessageController.getMessages); // Get messages between two users
app.post(MESSAGE_BASE_URL, MessageController.createMessage); // Create a new message
app.delete(MESSAGE_BASE_URL, MessageController.deleteMessage); // Delete a message

// Define the base URL for other skill-related routes
const OTHER_SKILL_BASE_URL = Config.PREFIX + "/skills";
// Other skill routes
app.get(OTHER_SKILL_BASE_URL, OtherSkillController.getAllSkills); // Get all skills
app.post(OTHER_SKILL_BASE_URL, OtherSkillController.createSkill); // Create a new skill
app.put(OTHER_SKILL_BASE_URL, OtherSkillController.updateSkill); // Update an existing skill
app.patch(OTHER_SKILL_BASE_URL, OtherSkillController.updateSkill); // Partially update a skill
app.delete(OTHER_SKILL_BASE_URL, OtherSkillController.deleteSkill); // Delete a skill

// Define the base URL for permission-related routes
const PERMISSION_BASE_URL = Config.PREFIX + "/permissions"; // host:port/PREFIX/permissions (PREFIX: /api)
// Permission routes
app.get(PERMISSION_BASE_URL, PermissionController.getAllPermissions); // Get all permissions

// Define the base URL for rating-related routes
const RATING_BASE_URL = Config.PREFIX + "/ratings";
// Rating routes
app.get(RATING_BASE_URL + "/:class", RatingController.getRatings); // Get ratings for a specific class
app.post(RATING_BASE_URL, RatingController.createRating); // Create a new rating

// Define the base URL for role-related routes
const ROLE_BASE_URL = Config.PREFIX + "/roles";
// Role routes
app.get(ROLE_BASE_URL, RoleController.getAllRoles); // Get all roles

// Define the base URL for student-related routes
const STUDENT_BASE_URL = Config.PREFIX + "/students";
// Student routes
app.get(STUDENT_BASE_URL + "/:user", StudentController.getStudentsBelongToUser); // Get students belonging to a user
app.get(STUDENT_BASE_URL + "/:class", StudentController.getStudentsInClass); // Get students in a specific class
app.post(STUDENT_BASE_URL, StudentController.createStudent); // Create a new student
app.put(STUDENT_BASE_URL + "/:id", StudentController.updateStudent); // Update an existing student
app.patch(STUDENT_BASE_URL + "/:id", StudentController.updateStudent); // Partially update a student
app.delete(STUDENT_BASE_URL + "/:id", StudentController.deleteStudent); // Delete a student

// Define the base URL for user-related routes
const USER_BASE_URL = Config.PREFIX + "/users";
// User routes
app.get(USER_BASE_URL, UserController.getAllUsers); // Get all users
app.get(USER_BASE_URL + "/:id", UserController.getUser); // Get specific user by ID
app.post(USER_BASE_URL + "/register", UserController.registerUser); // Register a new user
app.post(USER_BASE_URL + "/register/admin", UserController.registerAdmin); // Register a new admin user
app.post(USER_BASE_URL + "/auth", UserController.auth); // Authenticate a user
app.post(USER_BASE_URL + "/login", UserController.login); // Login a user
app.post(USER_BASE_URL + "/password/reset/:id", UserController.resetPassword); // Reset a user's password
app.post(USER_BASE_URL + "/password/change/:id", UserController.changePassword); // Change a user's password
app.put(USER_BASE_URL + "/:id", UserController.updateUserInfo); // Update user information
app.patch(USER_BASE_URL + "/:id", UserController.updateUserInfo); // Partially update user information
app.delete(USER_BASE_URL + "/:id", UserController.deleteAccount); // Delete a user account

// Start the Express server and listen on the specified port
app.listen(port, () => {
  SLog.log(LogType.Info, "Listen to the port", "server is running at http://127.0.0.1", port); // Log server start information
});

// Database settings
// SMySQL.connect(); // Connect to the MySQL database
setUpPermissions(); // Set up permissions in the database
setUpGenders(); // Set up genders in the database

// Uncomment these lines to seed the database with initial data
// DatabaseSeeder.seed(); // Seed the database
// DatabaseSeeder.fake(); // Generate fake data

// Export the Express app for testing or further configuration
export default app;


// SFirebase.push(FirebaseNode.CLASS, 2, () => {
//   SLog.log(LogType.Warning, "push class", "push a new class done");
// });