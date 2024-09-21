import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import SLog, { LogType } from "./services/SLog";
import SMySQL from "./services/SMySQL";
import SFirebase from "./services/SFirebase";

dotenv.config(); // doc bien moi truong

const app: Express = express();
const port = process.env.PORT || 3000;

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World");
});

let a = 0;
app.get("/api/notification", (req: Request, res: Response) => {

  const onSuccess = () => {
    SLog.log(LogType.Infor, "api/notification", "success")
  };
  const onFailure = (error:unknown) => {
    SLog.log(LogType.Error, "api/notification", "failed", error)
  };
  const onComplete = () => {
    a++;
    res.status(200).json(a);
  };

  SFirebase.pushNotification(2, onSuccess, onFailure, onComplete);  

})

app.listen(port, () => {
  SLog.log(LogType.Infor, "Listen", "server is running at http://localhost", port);

  // goi mysql server de chay na
  SMySQL.connect();
});
