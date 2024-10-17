import CV from "./../models/CV";
import SLog, { LogType } from "./SLog";
import SMySQL from "./SMySQL";
export default class SCV {
  public static getAllCVs(onNext: (cvs: CV[]) => void) {
    // cau truy van
    const sql = `SELECT 
	JSON_OBJECT(
        'id', cvs.user_id,
        'biography', cvs.biography,
        'title', cvs.title,
        'approve_at', cvs.approved_at
    ) as cv,
    JSON_OBJECT(
        'full_name', u.full_name,
        'phone_number', u.phone_number,
        'email', u.email,
        'avatar', JSON_OBJECT(
            'path', COALESCE(avatar_file.path, 'No avatar')
            )
    ) as user,
    JSON_OBJECT(
        'birthday', i.birthday,
        'address_1', i.address_1,
        'address_2', i.address_2,
        'address_3', i.address_3,
        'address_4', i.address_4
    ) as info,
    JSON_ARRAYAGG(
        JSON_OBJECT(
            'vn_name', os.vn_name,
            'en_name', os.en_name,
            'ja_name', os.ja_name
        )
    ) as skills
FROM cvs
LEFT JOIN users u ON u.id = cvs.user_id
LEFT JOIN informations i ON i.user_id = cvs.user_id
LEFT JOIN in_cv_skills ics ON ics.user_id = cvs.user_id
LEFT JOIN other_skills os ON os.id = ics.skill_id
LEFT JOIN files avatar_file ON avatar_file.id = u.avatar_id
WHERE cvs.approved_at IS NOT NULL
GROUP BY cvs.user_id, cvs.biography, cvs.title, cvs.approved_at, u.full_name, u.phone_number, u.email, avatar_file.path, i.birthday, i.address_1, i.address_2, i.address_3, i.address_4;`;

    SMySQL.getConnection((connection) => {
      connection?.query<any[]>(sql, [], (err, result) => {
        // kiem tra xem co err khong
        if (err) {
          SLog.log(
            LogType.Error,
            "get all cv",
            "fail to get all cv in database",
            err
          );
          onNext([]);
          return;
        }

        // khoi tao mang moi de luu
        const cvs: CV[] = [];

        result.forEach((data) => {
          const cv: CV = data.cv;
          cv.user = data.user;
          cv.information = data.information;
          cv.skills = data.skills;

          cvs.push(cv);
        });

        onNext(cvs);
        return;
      });
    });
  }
}
