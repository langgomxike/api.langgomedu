import CV from "./../models/CV";
import SLog, { LogType } from "./SLog";
import SMySQL from "./SMySQL";
export default class SCV {
  //get all cvs
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
          cv.information = data.info;
          cv.skills = data.skills;

          cvs.push(cv);
        });

        onNext(cvs);
        return;
      });
    });
  }

  //get User CV
  public static getUserCV( user_id: string ,onNext: (cv: any) => void) {
    const sql = `SELECT JSON_OBJECT(
    'user', JSON_OBJECT(
        'id', u.id,
        'full_name', u.full_name,
        'email', u.email,
        'phone_number', u.phone_number,
        'avatar', JSON_OBJECT(
            'id', f.id,
            'name', f.name,
            'path', f.path,
            'capacity', f.capacity,
            'image_width', f.image_with,
            'image_height', f.image_height
        )
    ),
    'information', JSON_OBJECT(
        'hometown', info.hometown,
        'address_1', info.address_1,
        'address_2', info.address_2,
        'address_3', info.address_3,
        'address_4', info.address_4,
        'birthday', info.birthday,
        'point', info.point,
        'banking_number', info.banking_number,
        'banking_code', info.banking_code
    ),
    'biography', cvs.biography,
    'title', cvs.title,
    'approved_at', cvs.approved_at,
    'skills', JSON_ARRAYAGG(JSON_OBJECT(
        'id', osk.id,
        'vn_name', osk.vn_name,
        'en_name', osk.en_name,
        'ja_name', osk.ja_name,
        'progress_percent', osk.progress_percent,
        'icon', JSON_OBJECT(
            'id', i_skill.id,
            'name', i_skill.name,
            'path', i_skill.path,
            'capacity', i_skill.capacity,
            'image_width', i_skill.image_with,
            'image_height', i_skill.image_height
        )
    )),
    'educations', JSON_ARRAYAGG(JSON_OBJECT(
        'id', edu.id,
        'title', edu.title,
        'description', edu.description,
        'iconPath', edu.iconPath,
        'started_at', edu.started_at,
        'ended_at', edu.ended_at
    )),
    'experiences', JSON_ARRAYAGG(JSON_OBJECT(
        'id', exp.id,
        'title', exp.title,
        'major', JSON_OBJECT(
            'id', majors.id,
            'icon', JSON_OBJECT(
                'id', i_major.id,
                'name', i_major.name,
                'path', i_major.path,
                'capacity', i_major.capacity,
                'image_width', i_major.image_with,
                'image_height', i_major.image_height
            ),
            'vn_name', majors.vn_name,
            'en_name', majors.en_name,
            'ja_name', majors.ja_name
        ),
        'address', exp.address,
        'initial', exp.initial,
        'approved', exp.approved,
        'started_at', exp.started_at,
        'ended_at', exp.ended_at
    )),
    'certificates', JSON_ARRAYAGG(JSON_OBJECT(
        'id', c.id,
        'name', c.name,
        'vn_desc', c.vn_desc,
        'en_desc', c.en_desc,
        'ja_desc', c.ja_desc,
        'icon', JSON_OBJECT(
            'id', i_cer.id,
            'name', i_cer.name,
            'path', i_cer.path,
            'capacity', i_cer.capacity,
            'image_width', i_cer.image_with,
            'image_height', i_cer.image_height,
            'created_at', i_cer.created_at,
            'updated_at', i_cer.updated_at
        )
    ))
) AS CV
FROM cvs
JOIN users u ON u.id = cvs.user_id
JOIN files f ON u.avatar_id = f.id
JOIN informations info ON info.user_id = cvs.user_id
JOIN educations edu ON edu.user_id = cvs.user_id
JOIN experiences exp ON exp.user_id = cvs.user_id
JOIN in_cv_skills ics ON ics.user_id = cvs.user_id
JOIN other_skills osk ON osk.id = ics.skill_id
JOIN files i_skill ON i_skill.id = osk.icon_id
JOIN majors ON majors.id = exp.major_id
JOIN files i_major ON i_major.id = majors.icon_id
JOIN in_cv_certificates icc ON icc.user_id = cvs.user_id
JOIN certificates c ON c.id = icc.certificate_id
JOIN files i_cer ON i_cer.id = c.icon_id
WHERE cvs.user_id = ?
        GROUP BY cvs.user_id;`
    SMySQL.getConnection((connection)=>{
      connection?.query<any[]>(sql, [user_id], (err, result)=>{
        if(err){
          SLog.log(LogType.Error, "fail to fetch cv", "can't fetch user cv", err),
          onNext(undefined)
          return;
        }

        onNext(result)
        return;

      })
    })

  }
}
