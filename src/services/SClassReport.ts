import ClassReport from "../models/ClassReport";
import SLog, { LogType } from "./SLog";
import SMySQL from "./SMySQL";
export default class SClassReport {
  public static getAllClassReport(
    onNext: (classReport: ClassReport[]) => void
  ) {
    const sql = `SELECT   
    JSON_OBJECT(
        'id', MAX(class_reports.id),
        'created_at', MAX(class_reports.created_at),
        'class',
            JSON_OBJECT(
                'class_id', MAX(class.id),
                'title', MAX(class.title),
                'description', MAX(class.description),
                'author',
                    JSON_OBJECT(
                        'id', MAX(to_user.id),
                        'full_name', MAX(to_user.full_name),
                        'information',
                        JSON_OBJECT(
                            'point', MAX(itu.point)
                        ),
                        'avatar',
                        JSON_OBJECT(
                            'path', MAX(to_user_avatar.path)
                        )
                    )
            ),
        'user',
            JSON_OBJECT(
                'id', MAX(from_user.id),
                'full_name', MAX(from_user.full_name),
                'information',
                JSON_OBJECT(
                    'point', MAX(ifu.point)
                ),
                'avatar',
                JSON_OBJECT(
                    'path', MAX(from_user_avatar.path)
                )
            ),
        'content', MAX(class_reports.content),
           'status', MAX(class_reports.status),
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
FROM class_reports
LEFT JOIN classes AS class ON class.id = class_reports.class_id COLLATE utf8mb4_general_ci
LEFT JOIN users AS from_user ON from_user.id = class_reports.user_id COLLATE utf8mb4_general_ci
LEFT JOIN users AS to_user ON to_user.id = class.author_id COLLATE utf8mb4_general_ci
LEFT JOIN informations AS ifu ON ifu.user_id = from_user.id COLLATE utf8mb4_general_ci
LEFT JOIN informations AS itu ON itu.user_id = to_user.id COLLATE utf8mb4_general_ci
LEFT JOIN files AS from_user_avatar ON from_user_avatar.id = from_user.avatar_id COLLATE utf8mb4_general_ci
LEFT JOIN files AS to_user_avatar ON to_user_avatar.id = to_user.avatar_id COLLATE utf8mb4_general_ci
LEFT JOIN class_report_files AS crf ON crf.report_id = class_reports.id COLLATE utf8mb4_general_ci
LEFT JOIN files ON files.id = crf.file_id COLLATE utf8mb4_general_ci
LEFT JOIN class_reports AS ur ON ur.class_id = class.id AND ur.id < class_reports.id COLLATE utf8mb4_general_ci
GROUP BY class_reports.id;
`;
    SMySQL.getConnection((connection) => {
      connection?.execute<any[]>(sql, (err, results) => {
        if (err) {
          SLog.log(
            LogType.Error,
            "get all class report",
            "failed to execute",
            err
          );
          onNext([]);
          return;
        }
        //   const cserReports: ClassReport = ;
        //   results.forEach((result) => {
        //     const userReport: ClassReport = result;
        //     cserReports.push(userReport);
        //   });
        onNext(results);
      });
    });
  }

  public static getClassReportById(
    reportId: string,
    onNext: (classReport: ClassReport | null) => void
  ) {
    const sql = `SELECT   
    JSON_OBJECT(
        'id', MAX(class_reports.id),
        'created_at', MAX(class_reports.created_at),
        'class',
            JSON_OBJECT(
                'class_id', MAX(class.id),
                'title', MAX(class.title),
                'description', MAX(class.description),
                'author',
                    JSON_OBJECT(
                        'id', MAX(to_user.id),
                        'full_name', MAX(to_user.full_name),
                        'information',
                        JSON_OBJECT(
                            'point', MAX(itu.point)
                        ),
                        'avatar',
                        JSON_OBJECT(
                            'path', MAX(to_user_avatar.path)
                        )
                    )
            ),
        'user',
            JSON_OBJECT(
                'id', MAX(from_user.id),
                'full_name', MAX(from_user.full_name),
                'information',
                JSON_OBJECT(
                    'point', MAX(ifu.point)
                ),
                'avatar',
                JSON_OBJECT(
                    'path', MAX(from_user_avatar.path)
                )
            ),
        'content', MAX(class_reports.content),
          'status', MAX(class_reports.status),
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
FROM class_reports
LEFT JOIN classes AS class ON class.id = class_reports.class_id COLLATE utf8mb4_general_ci
LEFT JOIN users AS from_user ON from_user.id = class_reports.user_id COLLATE utf8mb4_general_ci
LEFT JOIN users AS to_user ON to_user.id = class.author_id COLLATE utf8mb4_general_ci
LEFT JOIN informations AS ifu ON ifu.user_id = from_user.id COLLATE utf8mb4_general_ci
LEFT JOIN informations AS itu ON itu.user_id = to_user.id COLLATE utf8mb4_general_ci
LEFT JOIN files AS from_user_avatar ON from_user_avatar.id = from_user.avatar_id COLLATE utf8mb4_general_ci
LEFT JOIN files AS to_user_avatar ON to_user_avatar.id = to_user.avatar_id COLLATE utf8mb4_general_ci
LEFT JOIN class_report_files AS crf ON crf.report_id = class_reports.id COLLATE utf8mb4_general_ci
LEFT JOIN files ON files.id = crf.file_id COLLATE utf8mb4_general_ci
LEFT JOIN class_reports AS ur ON ur.class_id = class.id AND ur.id < class_reports.id COLLATE utf8mb4_general_ci
WHERE class_reports.id = ?
GROUP BY class_reports.id;`; // Thêm điều kiện WHERE để lọc theo reportId

    SMySQL.getConnection((connection) => {
      connection?.execute<any>(sql, [reportId], (err, result) => {
        if (err) {
          SLog.log(
            LogType.Error,
            "get class report by ID",
            "failed to execute",
            err
          );
          onNext(null); // Nếu có lỗi, trả về null
          return;
        }

        const userReport: ClassReport = result[0].report; // Giả sử chỉ có 1 kết quả
        onNext(userReport);
      });
    });
  }
}
