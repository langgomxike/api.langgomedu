import dotenv from "dotenv";
import admin, { database, initializeApp } from "firebase-admin";
import firebaseAccount from "../../admin_firebase_account_service.json";
import SLog, { LogType } from "./SLog";

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

  public static pushNotification(
    userId: number = -1,
    onSuccess: () => void = () => {},
    onFailure: (error: unknown) => void = () => {},
    onComlete: () => void = () => {}
  ) {
    if (userId < 1) {
      onFailure("Invalid user");
      onComlete();
      return;
    }

    this.init();

    const time = new Date().getTime();
    const path = "USERS/USER_ID:" + userId + "/NOFITICATIONS";
    const ref = this.dbRef.ref(path);
    ref.set(time, (error) => {
      if (!error) {
        onSuccess();
        onComlete();
      } else {
        onFailure(error);
        onComlete();
      }
    });
  }
}
