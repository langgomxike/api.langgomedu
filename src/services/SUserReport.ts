import UserReport from "../models/UserReport";
import SLog, {LogType} from "./SLog";
import SMySQL from "./SMySQL";
import SFirebase, {FirebaseNode} from "./SFirebase";

export default class SUserReport {
  public static getAllUserReports(onNext: (userReport: UserReport[]) => void) {
    const sql = `SELECT JSON_OBJECT(
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
                                'content', user_reports.content,
                                'status', user_reports.status,
                                'reports_before',
                                CONCAT('[', GROUP_CONCAT(
                                        JSON_OBJECT(
                                                'report_id', ur.id,
                                                'content', ur.content,
                                                'created_at', ur.created_at
                                        ) ORDER BY ur.id ASC
                SEPARATOR ','
                                            ), ']'),
                                'files',
                                CONCAT('[', GROUP_CONCAT(
                                        JSON_OBJECT(
                                                'id', files.id,
                                                'path', files.path
                                        ) SEPARATOR ','
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
    const sql = `SELECT JSON_OBJECT(
                                'report_id', reports.id,
                                'created_at', reports.created_at,
                                'reporter',
                                JSON_OBJECT(
                                        'id', from_user.id,
                                        'full_name', from_user.full_name,
                                        'point', from_user.point,
                                        'avatar', from_user.avatar
                                ),
                                'reportee',
                                JSON_OBJECT(
                                        'id', to_user.id,
                                        'full_name', to_user.full_name,
                                        'point', to_user.point,
                                        'avatar', to_user.avatar,
                                        'roles',
                                        IFNULL(
                                                JSON_ARRAYAGG(
                                                        JSON_OBJECT(
                                                                'role_id', roles.id,
                                                                'role_name', roles.name
                                                        )
                                                ), JSON_ARRAY()
                                        )
                                ),
                                'content', reports.content,
                                'status', reports.status_id,
                                'class',
                                JSON_OBJECT(
                                        'id', classes.id,
                                        'title', classes.title,
                                        'tutor_id', classes.tutor_id,
                                        'author_id', classes.author_id
                                ),
                                'reports_before',
                                IFNULL(
                                        JSON_ARRAYAGG(
                                                JSON_OBJECT(
                                                        'report_id', ur.id,
                                                        'content', ur.content,
                                                        'created_at', ur.created_at
                                                )
                                        ), JSON_ARRAY()
                                ),
                                'files',
                                IFNULL(
                                        JSON_ARRAYAGG(
                                                JSON_OBJECT(
                                                        'id', files.id,
                                                        'path', files.path
                                                )
                                        ), JSON_ARRAY()
                                )
                        ) AS report
                 FROM reports
                          LEFT JOIN users AS from_user ON from_user.id = reports.reporter_id
                          LEFT JOIN users AS to_user ON to_user.id = reports.reportee_id
                          LEFT JOIN classes ON classes.id = reports.class_id
                          LEFT JOIN report_files AS urf ON urf.report_id = reports.id
                          LEFT JOIN files ON files.id = urf.file_id
                          LEFT JOIN reports AS ur ON ur.reportee_id = reports.reportee_id AND ur.id < reports.id
-- JOIN bảng user_role và roles để lấy thông tin quyền của reportee
                          LEFT JOIN user_role ON user_role.user_id = to_user.id
                          LEFT JOIN roles ON roles.id = user_role.role_id
                 WHERE reports.id = ?
                 GROUP BY reports.id,
                          reports.created_at,
                          reports.content,
                          reports.status_id,
                          from_user.id,
                          from_user.full_name,
                          from_user.point,
                          from_user.avatar,
                          to_user.id,
                          to_user.full_name,
                          to_user.point,
                          to_user.avatar,
                          classes.id,
                          classes.title,
                          classes.tutor_id,
                          classes.author_id;
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

  public static performReport(
    id: number,
    reason: string,
    level: number,
    onNext: (result: boolean) => void
  ) {
    const sql = `
        UPDATE reports
        SET level_id   = ?,
            reason     = ?,
            updated_at = ?
        WHERE id = ?
    `;

    SMySQL.getConnection((connection) => {
      connection?.execute(
        sql,
        [level, reason, new Date().getTime(), id],
        (error, result) => {
          if (error) {
            SLog.log(
              LogType.Error,
              "performReport",
              "Cannot perform user report",
              error
            );
            onNext(false);
          }

          SLog.log(
            LogType.Info,
            "performReport",
            "Performed user report successfully"
          );
          SFirebase.push(FirebaseNode.Reports, [{key: FirebaseNode.Id, value: id}], () => {
            onNext(true);
          });
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
    files: string[],  // Các file gửi kèm theo báo cáo
    onNext: (result: boolean) => void
  ) {
    let reason = "";
    let level_id = 0;
    let desc_point = 0;
    let status_id = 0;
    let updated_at = Date.now();  // Cập nhật thời điểm hiện tại (milliseconds)
    let createdAt = Date.now();   // Thời điểm tạo báo cáo

    // Câu truy vấn SQL để thêm báo cáo mới
    const sql = `
        INSERT INTO reports (reporter_id, reportee_id, class_id, content, created_at, reason, level_id, desc_point,
                             status_id, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `;

    // Thực hiện truy vấn để thêm báo cáo
    SMySQL.getConnection((connection) => {
      connection?.execute(
        sql,
        [
          reporter,
          reportee,
          class_id ? class_id : -1,
          content,
          createdAt,
          reason,
          level_id,
          desc_point,
          status_id,
          updated_at,
        ],
        (error, result) => {
          if (error) {
            onNext(false);
            SLog.log(LogType.Error, "CreatedReport", "Cannot create report", error);
            return;
          }

          // Kiểm tra kiểu trả về của result và lấy insertId
          let reportId: number | null = null;
          if ((result as any).insertId) {
            reportId = (result as any).insertId;
          } else if (Array.isArray(result) && result[0] && (result[0] as any).insertId) {
            reportId = (result[0] as any).insertId;
          }

          if (!reportId) {
            onNext(false);
            SLog.log(LogType.Error, "CreatedReport", "Failed to get report ID");
            return;
          }

          // Thêm các file vào bảng files
          const fileSql = `
              INSERT INTO files (name, path, ratio, created_at, updated_at)
              VALUES (?, ?, ?, ?, ?);
          `;
          let fileInsertPromises = files.map((filePath) => {
            return new Promise((resolve, reject) => {
              const fileName = filePath.split('/').pop(); // Lấy tên file từ đường dẫn
              connection?.execute(
                fileSql,
                [
                  fileName,
                  filePath,
                  1,  // Tỷ lệ mặc định là 1
                  createdAt,
                  updated_at
                ],
                (fileError, fileResult) => {
                  if (fileError) {
                    SLog.log(LogType.Error, "CreatedReport", "Failed to insert file", fileError);
                    reject(fileError);
                    return;
                  }

                  // Kiểm tra kiểu trả về và lấy fileId
                  let fileId: number | null = null;
                  if ((fileResult as any).insertId) {
                    fileId = (fileResult as any).insertId;
                  } else if (Array.isArray(fileResult) && fileResult[0] && (fileResult[0] as any).insertId) {
                    fileId = (fileResult[0] as any).insertId;
                  }

                  if (!fileId) {
                    SLog.log(LogType.Error, "CreatedReport", "Failed to get file ID");
                    reject(new Error("Failed to get file ID"));
                    return;
                  }

                  // Thêm vào bảng report_file
                  const reportFileSql = `
                      INSERT INTO report_files (report_id, file_id)
                      VALUES (?, ?);
                  `;
                  connection?.execute(
                    reportFileSql,
                    [reportId, fileId],
                    (reportFileError) => {
                      if (reportFileError) {
                        SLog.log(LogType.Error, "CreatedReport", "Failed to link file to report", reportFileError);
                        reject(reportFileError);
                        return;
                      }
                      SLog.log(LogType.Info, "CreatedReport", "File linked to report successfully");
                      resolve(true);
                    }
                  );
                }
              );
            });
          });

          // Chờ tất cả các file được thêm và liên kết
          Promise.all(fileInsertPromises)
            .then(() => {
              SLog.log(LogType.Info, "CreatedReport", "Report created successfully with files");
              SFirebase.push(FirebaseNode.Reports, [{ key: FirebaseNode.ReportId, value: reportId }], () => {
                onNext(true);
              })
            })
            .catch((error) => {
              SLog.log(LogType.Error, "CreatedReport", "Error while processing files", error);
              onNext(false);
            });
        }
      );
    });
  }
}
