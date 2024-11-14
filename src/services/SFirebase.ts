import * as dotenv from "dotenv";
// @ts-ignore
import admin, { database, initializeApp } from "firebase-admin";
// @ts-ignore
import firebaseAccount from "../../admin_firebase_account_service.json";
import SLog, { LogType } from "./SLog";
// @ts-ignore
import firebaseNodeProps from "../../firebase_node_props.json";

export enum FirebaseNode {
  MAJOR = 0,
  CLASS = 1,
  CV = 2,
  USER = 3,
  ATTENDANCE = 4,
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

  public static push(firebaseNode: FirebaseNode, key: number | string, onNext: () => void) {
    this.init();

    const firebaseReference = this.dbRef.ref(`${firebaseNodeProps[firebaseNode].node}/${firebaseNodeProps[firebaseNode].key}:${key}`);
    const currentTime = new Date().getTime();

    firebaseReference.set(currentTime, (error) => {
      if (error) {
        SLog.log(
          LogType.Error,
          `push data into firebase`,
          `push data to the node ${firebaseNodeProps[firebaseNode].node} with key ${firebaseNodeProps[firebaseNode].key} = ${key} found error`,
          error
        );

      } else {
        SLog.log(
          LogType.Info,
          `push data into firebase`,
          `push data to the node ${firebaseNodeProps[firebaseNode].node} with key ${firebaseNodeProps[firebaseNode].key} = ${key} successfully`,
          error
        );

        onNext();
      }
    });
  }

  public static pushMessage(fromUserId: string, toUserId: string, onNext: () => void) {
    this.init();

    const firebaseReference = this.dbRef.ref(`MESSAGES/FROM_USER_ID:${fromUserId}|TO_USER_ID:${toUserId}`);
    const currentTime = new Date().getTime();

    firebaseReference.set(currentTime, (error) => {
      if (error) {
        SLog.log(
            LogType.Error,
            `push data into firebase`,
            `push data to the node MESSAGES with keys = [${fromUserId},${toUserId}] found error`,
            error
        );

      } else {
        SLog.log(
            LogType.Info,
            `push data into firebase`,
            `push data to the node MESSAGES with keys = [${fromUserId},${toUserId}] successfully`,
            error
        );

        onNext();
      }
    });
  }

  public static delete(firebaseNode: FirebaseNode, key: number | string, onNext: () => void) {
    this.init();

    const firebaseReference = this.dbRef.ref(`${firebaseNodeProps[firebaseNode].node}/${firebaseNodeProps[firebaseNode].key}:${key}`);

    firebaseReference.remove((error) => {
      if (error) {
        SLog.log(
          LogType.Error,
          `push data into firebase`,
          `push data to the node ${firebaseNodeProps[firebaseNode].node} with key ${firebaseNodeProps[firebaseNode].key} = ${key} found error`,
          error
        );

      } else {
        SLog.log(
          LogType.Info,
          `push data into firebase`,
          `push data to the node ${firebaseNodeProps[firebaseNode].node} with key ${firebaseNodeProps[firebaseNode].key} = ${key} successfully`,
          error
        );

        onNext();
      }
    });
  }
}
