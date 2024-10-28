import UserReport from "../models/UserReport";
import SLog, { LogType } from "./SLog";
import SMySQL from "./SMySQL";

export default class SUserReport {
  public static getAllUserReports(onNext: (userReport: UserReport[]) => void) {
    const sql = `SELECT   
    JSON_OBJECT(
        'report_id', user_reports.id,
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
        'files',
            CONCAT('[', GROUP_CONCAT(JSON_OBJECT(
                'id', files.id,
                'path', files.path
            ) SEPARATOR ','), ']')
    ) AS report
FROM user_reports
LEFT JOIN users AS from_user ON from_user.id = user_reports.from_user_id
LEFT JOIN users AS to_user ON to_user.id = user_reports.to_user_id
LEFT JOIN user_report_files AS urf ON urf.report_id = user_reports.id
LEFT JOIN informations AS ifu ON ifu.user_id = user_reports.from_user_id
LEFT JOIN informations AS itu ON itu.user_id = user_reports.to_user_id
LEFT JOIN files ON files.id = urf.file_id
GROUP BY user_reports.id`;
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
}
