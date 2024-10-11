import nodemailer from "nodemailer";
import dotenv from "dotenv";
import SLog, { LogType } from "./SLog";

export default class SEmail {
  public static validateEmail(email: string): boolean {
    const emailRegex =
      /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
    return Boolean(email && emailRegex.test(email));
  }

  public static sendEmail(
    toEmail: string,
    subject: string,
    message: string,
    onSuccess: () => void = () => {},
    onFailure: (err: unknown) => void = () => {},
    onComplete: () => void = () => {}
  ) {
    
    // Kiểm tra email hợp lệ
    if (!this.validateEmail(toEmail)) {
      onFailure("Invalid email");
      onComplete();
      return; // Dừng lại nếu email không hợp lệ
    }

    // Lấy thông tin từ biến môi trường dotenv
    const user = dotenv.config().parsed?.ADMIN_EMAIL;
    const pass = dotenv.config().parsed?.ADMIN_APP_PASSWORD;

    // Kiểm tra xem user và pass có tồn tại không
    if (!user || !pass) {
      onFailure("Missing email or password in environment variables");
      onComplete();
      return; // Dừng lại nếu thiếu thông tin đăng nhập
    }

    // Tạo transporter để gửi email
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: user,
        pass: pass,
      },
    });

    // Thiết lập thông tin email
    let mailOptions = {
      from: user,
      to: toEmail,
      subject: subject,
      text: message,
    };

    // Ghi log thông tin email
    SLog.log(
      LogType.Info,
      "Email options check",
      "show email options",
      mailOptions
    );

    // Gửi email
    transporter
      .sendMail(mailOptions)
      .then(onSuccess)
      .catch(onFailure)
      .finally(onComplete);
  }
}
