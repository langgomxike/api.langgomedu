import dotenv from "dotenv";
import admin, { database, initializeApp } from "firebase-admin";
import firebaseAccount from "../../admin_firebase_account_service.json";
import SLog, { LogType } from "./SLog";
import firebaseNodeProps from "../../firebase_node_props.json";

export enum FirebaseNode {
  CLASS = 1,
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
