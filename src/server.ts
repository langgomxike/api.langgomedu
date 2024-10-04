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
//THONG TIN CHUNG
//lay thong tin chung
app.get("/api/apps/info", (req: Request, res: Response) => {
  res.send("/api/apps/info");
})
//sua thong tin chung
app.put("/api/apps/info/update/:id",  (req: Request, res: Response) => {
})

//MON HOC
//xem tat ca
app.get("/api/majors", (req: Request, res: Response) => {
})
//xem 1
app.get("/api/majors/:id", (req: Request, res: Response) => {
})
//them
app.put("/api/majors/add", (req: Request, res: Response) => {
})
//xoa
app.delete("/api/majors/delete/:id",  (req: Request, res: Response) => {
})
//sua
app.put("/api/majors/update/:id",  (req: Request, res: Response) => {
})

//KY NANG
//xem tat ca
app.get("/api/skills", (req: Request, res: Response) => {
})
//xem 1
app.get("/api/skills/:id", (req: Request, res: Response) => {
})
//them
app.put("/api/skills/add", (req: Request, res: Response) => {
})
//xoa
app.delete("/api/skills/delete/:id",  (req: Request, res: Response) => {
})
//sua
app.put("/api/skills/update/:id",  (req: Request, res: Response) => {
})


//CHUNG CHI
//xem tat ca
app.get("/api/certificates", (req: Request, res: Response) => {
})
//xem 1
app.get("/api/certificates/:id", (req: Request, res: Response) => {
  res.send("a nhan nhan nhan")
})
//them
app.put("/api/certificates/add", (req: Request, res: Response) => {
})
//xoa
app.delete("/api/certificates/delete/:id",  (req: Request, res: Response) => {
})
//sua
app.put("/api/certificates/update/:id",  (req: Request, res: Response) => {
})



//THONG TIN CA NHAN
//xem 
app.get("/api/persional_infors", (req: Request, res: Response) => {
})
//them
app.put("/api/persional_infors/add", (req: Request, res: Response) => {
})
//xoa
app.delete("/api/persional_infors/delete/:id",  (req: Request, res: Response) => {
})
//sua
app.put("/api/persional_infors/update/:id",  (req: Request, res: Response) => {
})



//THONG TIN CUA NGUOI DUNG KHAC
//lay
//xem 
app.get("/api/order_person_infors", (req: Request, res: Response) => {
})
//them
app.put("/api/order_person_infors/add", (req: Request, res: Response) => {
})
//xoa
app.delete("/api/order_person_infors/delete/:id",  (req: Request, res: Response) => {
})
//sua
app.put("/api/order_person_infors/update/:id",  (req: Request, res: Response) => {
})



//BAO CAO NGUOI DUNG 
//xem 
app.get("/api/reports/persons", (req: Request, res: Response) => {
})
//them
app.put("/api/reports/persons/add", (req: Request, res: Response) => {
})
//xoa
app.delete("/api/reports/persons/delete/:id",  (req: Request, res: Response) => {
})
//sua
app.put("/api/reports/persons/update/:id",  (req: Request, res: Response) => {
})



//BAO CAO LOP HOC
//xem 
app.get("/api/reports/class", (req: Request, res: Response) => {
})
//them
app.put("/api/reports/class/add", (req: Request, res: Response) => {
})
//xoa
app.delete("/api/reports/class/delete/:id",  (req: Request, res: Response) => {
})
//sua
app.put("/api/reports/class/update/:id",  (req: Request, res: Response) => {
})



//DUYET LOP HOC
//xem tat ca
app.get("/api/approves/class", (req: Request, res: Response) => {
})
//xem 1
app.get("/api/approves/class/:id", (req: Request, res: Response) => {
})
//sua
app.put("/api/approves/class/update/:id",  (req: Request, res: Response) => {
})



//THONG TIN LOP HOC CA NHAN
//xem 
app.get("/api/personal_classes", (req: Request, res: Response) => {
})
//them
app.put("/api/personal_classes/add", (req: Request, res: Response) => {
})
//xoa
app.delete("/api/personal_classes/delete/:id",  (req: Request, res: Response) => {
})
//sua
app.put("/api/personal_classes/update/:id",  (req: Request, res: Response) => {
})



//THONG TIN LOP HOC CUA NGUOI DUNG KHAC
//xem 
app.get("/api/orther_person_classes", (req: Request, res: Response) => {
})
//xoa
app.delete("/api/orther_person_classes/delete/:id",  (req: Request, res: Response) => {
})
//sua
app.put("/api/orther_person_classes/update/:id",  (req: Request, res: Response) => {
})



//THONG TIN CV
//xem 
app.get("/api/cvs", (req: Request, res: Response) => {
})
//them
app.put("/api/cvs/add", (req: Request, res: Response) => {
})
//xoa
app.delete("/api/cvs/delete/:id",  (req: Request, res: Response) => {
})
//sua
app.put("/api/cvs/update/:id",  (req: Request, res: Response) => {
})

//LOGIN REGISTER OTP
app.post("/api/auth/login", (req: Request, res: Response) => {
})
app.post("/api/auth/register", (req: Request, res: Response) => {
})
app.post("/api/auth/otp", (req: Request, res: Response) => {
})



app.listen(port, () => {
  SLog.log(LogType.Infor, "Listen", "server is running at http://127.0.0.1", port);

  // goi mysql server de chay na
  SMySQL.connect();
});
