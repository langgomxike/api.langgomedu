import UserReport from "../models/UserReport";
import SLog, { LogType } from "./SLog";
import SMySQL from "./SMySQL";

export default class SUserReport {
  public static getAllUserReports(onNext: (userReport: UserReport[]) => void) {
    const sql = `SELECT   
    JSON_OBJECT(
        'report_id', user_reports.id,
         'created_at', user_reports.created_at,
        'from_user',
            JSON_OBJECT(
                'id', from_user.id,
                'full_name', from_user.full_name,
                'information',
                JSON_OBJECT(
                    'point', ifu.point
                )
            ),
        'to_user',
            JSON_OBJECT(
                'id', to_user.id,
                'full_name', to_user.full_name,
                'information',
                JSON_OBJECT(
                    'point', itu.point
                )
            ),
        'report_content', user_reports.content,
          'status', user_reports.status,
        'reports_before', 
            CONCAT('[', GROUP_CONCAT(
                JSON_OBJECT(
                    'report_id', ur.id,
                    'content', ur.content,
                      'created_at', ur.created_at

                    
                ) 
                ORDER BY ur.id ASC
                SEPARATOR ',' 
            ), ']'),
        'files',
            CONCAT('[', GROUP_CONCAT(
                JSON_OBJECT(
                    'id', files.id,
                    'path', files.path
                ) 
                SEPARATOR ','
            ), ']')
    ) AS report
FROM user_reports
LEFT JOIN users AS from_user ON from_user.id = user_reports.from_user_id
LEFT JOIN users AS to_user ON to_user.id = user_reports.to_user_id
LEFT JOIN user_report_files AS urf ON urf.report_id = user_reports.id
LEFT JOIN informations AS ifu ON ifu.user_id = user_reports.from_user_id
LEFT JOIN informations AS itu ON itu.user_id = user_reports.to_user_id
LEFT JOIN files ON files.id = urf.file_id
LEFT JOIN user_reports AS ur ON ur.to_user_id = to_user.id AND ur.id < user_reports.id
GROUP BY user_reports.id;
`;
    SMySQL.getConnection((connection) => {
      connection?.execute<any[]>(sql, (err, results) => {
        if (err) {
          SLog.log(LogType.Error, "get all users", "failed to execute", err);
          onNext([]);
          return;
        }
        const userReports: UserReport[] = [];
        results.forEach((result) => {
          const userReport: UserReport = result;
          userReports.push(userReport);
        });
        onNext(userReports);
      });
    });
  }
  public static geUserReportsById(
    id: string,
    onNext: (userReport: UserReport[]) => void
  ) {
    const sql = `SELECT   
  JSON_OBJECT(
      'report_id', user_reports.id,
       'created_at', user_reports.created_at,
      'from_user',
          JSON_OBJECT(
              'id', from_user.id,
              'full_name', from_user.full_name,
              'information',
              JSON_OBJECT(
                  'point', ifu.point
              ),
              'avatar_of_fromUser',
              JSON_OBJECT(
                  'from_user_avatar', from_user_avatar.path
              )
          ),
      'to_user',
          JSON_OBJECT(
              'id', to_user.id,
              'full_name', to_user.full_name,
              'information',
              JSON_OBJECT(
                  'point', itu.point
              ),
              'avatar_of_toUser',
              JSON_OBJECT(
                  'to_user_avatar', to_user_avatar.path
              )
          ),
      'report_content', user_reports.content,
        'status', user_reports.status,
      'reports_before', 
          JSON_ARRAYAGG(
              JSON_OBJECT(
                  'report_id', ur.id,
                  'content', ur.content,
                  'created_at', ur.created_at
              )
          ),
      'files',
          JSON_ARRAYAGG(
              JSON_OBJECT(
                  'id', files.id,
                  'path', files.path
              )
          )
  ) AS report
FROM user_reports
LEFT JOIN users AS from_user ON from_user.id = user_reports.from_user_id
LEFT JOIN users AS to_user ON to_user.id = user_reports.to_user_id
LEFT JOIN user_report_files AS urf ON urf.report_id = user_reports.id
LEFT JOIN informations AS ifu ON ifu.user_id = user_reports.from_user_id
LEFT JOIN informations AS itu ON itu.user_id = user_reports.to_user_id
LEFT JOIN files AS from_user_avatar ON from_user_avatar.id = from_user.avatar_id
LEFT JOIN files AS to_user_avatar ON to_user_avatar.id = to_user.avatar_id
LEFT JOIN files ON files.id = urf.file_id
LEFT JOIN user_reports AS ur ON ur.to_user_id = to_user.id AND ur.id < user_reports.id
WHERE user_reports.id = ?
GROUP BY user_reports.id, from_user.id, from_user.full_name, ifu.point, to_user.id, to_user.full_name, itu.point;
 `;
    SMySQL.getConnection((connection) => {
      connection?.execute<any[]>(sql, [id], (err, results) => {
        if (err) {
          SLog.log(LogType.Error, "get user", "failed to execute", err);
          onNext([]);
          return;
        }
        const userReports: UserReport[] = [];
        results.forEach((result) => {
          const userReport: UserReport = result;
          userReports.push(userReport);
        });
        onNext(userReports);
      });
    });
  }
  //khoá user reports
  //   UPDATE user_reports
  // SET status = 1
  // WHERE id = ?
  // LIMIT 1;
  public static LockReport(
    report_id: string,
    reason: string,
    onNext: (result: boolean) => void
  ) {
    // Câu truy vấn SQL để khóa báo cáo người dùng
    const sql = `
      UPDATE reports
      SET status_id = 2,
       reason = ?
      WHERE id = ?
      LIMIT 1;
  `;

    // Lấy kết nối và thực thi truy vấn
    SMySQL.getConnection((connection) => {
      connection?.execute(
        sql,
        [reason, report_id], // Truyền vào `report_id` làm tham số
        (error, result) => {
          // Nếu có lỗi, ghi log lỗi và gọi callback với `false`
          if (error) {
            onNext(false);
            SLog.log(
              LogType.Error,
              "LockUserReport",
              "Cannot lock user report",
              error
            );
            return;
          }

          // Nếu thành công, ghi log và gọi callback với `true`
          SLog.log(
            LogType.Info,
            "LockUserReport",
            "Locked user report successfully"
          );
          onNext(true);
        }
      );
    });
  }
  //tạo report
  public static CreatedReport(
    reporter: string,
    reportee: string,
    class_id: string,
    content: string,
    onNext: (result: boolean) => void
  ) {
    let reason = "";
    let level_id=0;
    let desc_point=0;
    let status_id=0;
    let updated_at=0;
    // Câu truy vấn SQL để thêm báo cáo mới
    const sql = `
      INSERT INTO reports (reporter_id, reportee_id, class_id, content, created_at,reason,level_id, desc_point, status_id, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `;

    // Thời điểm hiện tại tính bằng mili giây
    const createdAt = Date.now();

    // Lấy kết nối và thực thi truy vấn
    SMySQL.getConnection((connection) => {
      connection?.execute(
        sql,
        [
          reporter,
          reportee,
          class_id ? class_id : 0,
          content,
          createdAt,
          reason,
          level_id,
          desc_point,
          status_id,
          updated_at

        ], // Truyền các tham số vào truy vấn
        (error, result) => {
          // Nếu có lỗi, ghi log lỗi và gọi callback với `false`
          if (error) {
            onNext(false);
            SLog.log(
              LogType.Error,
              "CreatedReport",
              "Cannot create report",
              error
            );
            return;
          }

          // Nếu thành công, ghi log và gọi callback với `true`
          SLog.log(
            LogType.Info,
            "CreatedReport",
            "Report created successfully"
          );
          onNext(true);
        }
      );
    });
  }
}
