import CV, { cvJson } from "./../models/CV";
import SLog, { LogType } from "./SLog";
import SMySQL from "./SMySQL";
import db from "../configs/knex";


export default class SCV {

  //get all cvs
  public static getAllCVs(onNext: (cvs: CV[]) => void) {
    // cau truy van
    const sql = `SELECT JSON_OBJECT(
    'id', cvs.id,
    'user', JSON_OBJECT(
        'id', u.id,
        'username', u.user_name,
        'fullname', u.full_name,
        'email', u.email,
        'phone_number', u.phone_number,
        'avatar', u.avatar,
        'hometown', u.hometown,
        'address', JSON_OBJECT(
            'id', ad.id,
            'province', ad.province,
            'district', ad.district,
            'ward', ad.ward,
            'detail', ad.detail
        ),
        'gender', JSON_OBJECT(
            'id', g.id,
            'vn_name', g.vn_name,
            'en_name', g.en_name,
            'ja_name', g.ja_name
        ),
        'birthday', u.birthday,
        'point', u.point
    ),
    'biography', cvs.biography,
    'title', cvs.title,
    'approved_at', cvs.approved_at,
    'updated_at', cvs.updated_at,
    -- Subquery for educations
    'educations', (
        SELECT JSON_ARRAYAGG(JSON_OBJECT(
            'id', edu.id,
            'name', edu.name,
            'note', edu.note,
            'address', JSON_OBJECT(
                'id', ad_edu.id,
                'province', ad_edu.province,
                'district', ad_edu.district,
                'ward', ad_edu.ward,
                'detail', ad_edu.detail
            ),
            'started_at', edu.started_at,
            'ended_at', edu.ended_at,
            'evidence', JSON_OBJECT(
                'id', edu_evi.id,
                'name', edu_evi.name,
                'path', edu_evi.path,
                'ratio', edu_evi.ratio,
                'created_at', edu_evi.created_at,
                'updated_at', edu_evi.updated_at
            )
        ))
        FROM educations edu
        LEFT JOIN addresses ad_edu ON ad_edu.id = edu.address_id
        LEFT JOIN files edu_evi ON edu_evi.id = edu.evidence_id
        WHERE edu.cv_id = cvs.id
    ),
    -- Subquery for experiences
    'experiences', (
        SELECT JSON_ARRAYAGG(JSON_OBJECT(
            'id', exp.id,
            'name', exp.name,
            'note', exp.note,
            'address', JSON_OBJECT(
                'id', ad_exp.id,
                'province', ad_exp.province,
                'district', ad_exp.district,
                'ward', ad_exp.ward,
                'detail', ad_exp.detail
            ),
            'started_at', exp.started_at,
            'ended_at', exp.ended_at,
            'evidence', JSON_OBJECT(
                'id', exp_evi.id,
                'name', exp_evi.name,
                'path', exp_evi.path,
                'ratio', exp_evi.ratio,
                'created_at', exp_evi.created_at,
                'updated_at', exp_evi.updated_at
            )
        ))
        FROM experiences exp
        LEFT JOIN addresses ad_exp ON ad_exp.id = exp.address_id
        LEFT JOIN files exp_evi ON exp_evi.id = exp.evidence_id
        WHERE exp.cv_id = cvs.id
    ),
    -- Subquery for certificates
    'certificates', (
        SELECT JSON_ARRAYAGG(JSON_OBJECT(
            'id', cer.id,
            'name', cer.name,
            'score', cer.score,
            'valid_at', cer.valid_at,
            'expired_at', cer.expired_at,
            'evidence', JSON_OBJECT(
                'id', cer_evi.id,
                'name', cer_evi.name,
                'path', cer_evi.path,
                'ratio', cer_evi.ratio,
                'created_at', cer_evi.created_at,
                'updated_at', cer_evi.updated_at
            )
        ))
        FROM certificates cer
        LEFT JOIN files cer_evi ON cer_evi.id = cer.evidence_id
        WHERE cer.cv_id = cvs.id
    )
) AS cv
FROM cvs
LEFT JOIN users u ON u.id = cvs.id
LEFT JOIN addresses ad ON ad.id = u.address_id
LEFT JOIN genders g ON g.id = u.gender_id;`;

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
    'id', cvs.id,
    'user', JSON_OBJECT(
        'id', u.id,
        'username', u.user_name,
        'fullname', u.full_name,
        'email', u.email,
        'phone_number', u.phone_number,
        'avatar', u.avatar,
        'hometown', u.hometown,
        'address', JSON_OBJECT(
            'id', ad.id,
            'province', ad.province,
            'district', ad.district,
            'ward', ad.ward,
            'detail', ad.detail
        ),
        'gender', JSON_OBJECT(
            'id', g.id,
            'vn_name', g.vn_name,
            'en_name', g.en_name,
            'ja_name', g.ja_name
        ),
        'birthday', u.birthday,
        'point', u.point
    ),
    'biography', cvs.biography,
    'title', cvs.title,
    'approved_at', cvs.approved_at,
    'updated_at', cvs.updated_at,
    -- Subquery for educations
    'educations', (
        SELECT JSON_ARRAYAGG(JSON_OBJECT(
            'id', edu.id,
            'name', edu.name,
            'note', edu.note,
            'address', JSON_OBJECT(
                'id', ad_edu.id,
                'province', ad_edu.province,
                'district', ad_edu.district,
                'ward', ad_edu.ward,
                'detail', ad_edu.detail
            ),
            'started_at', edu.started_at,
            'ended_at', edu.ended_at,
            'evidence', JSON_OBJECT(
                'id', edu_evi.id,
                'name', edu_evi.name,
                'path', edu_evi.path,
                'ratio', edu_evi.ratio,
                'created_at', edu_evi.created_at,
                'updated_at', edu_evi.updated_at
            )
        ))
        FROM educations edu
        LEFT JOIN addresses ad_edu ON ad_edu.id = edu.address_id
        LEFT JOIN files edu_evi ON edu_evi.id = edu.evidence_id
        WHERE edu.cv_id = cvs.id
    ),
    -- Subquery for experiences
    'experiences', (
        SELECT JSON_ARRAYAGG(JSON_OBJECT(
            'id', exp.id,
            'name', exp.name,
            'note', exp.note,
            'address', JSON_OBJECT(
                'id', ad_exp.id,
                'province', ad_exp.province,
                'district', ad_exp.district,
                'ward', ad_exp.ward,
                'detail', ad_exp.detail
            ),
            'started_at', exp.started_at,
            'ended_at', exp.ended_at,
            'evidence', JSON_OBJECT(
                'id', exp_evi.id,
                'name', exp_evi.name,
                'path', exp_evi.path,
                'ratio', exp_evi.ratio,
                'created_at', exp_evi.created_at,
                'updated_at', exp_evi.updated_at
            )
        ))
        FROM experiences exp
        LEFT JOIN addresses ad_exp ON ad_exp.id = exp.address_id
        LEFT JOIN files exp_evi ON exp_evi.id = exp.evidence_id
        WHERE exp.cv_id = cvs.id
    ),
    -- Subquery for certificates
    'certificates', (
        SELECT JSON_ARRAYAGG(JSON_OBJECT(
            'id', cer.id,
            'name', cer.name,
            'score', cer.score,
            'valid_at', cer.valid_at,
            'expired_at', cer.expired_at,
            'evidence', JSON_OBJECT(
                'id', cer_evi.id,
                'name', cer_evi.name,
                'path', cer_evi.path,
                'ratio', cer_evi.ratio,
                'created_at', cer_evi.created_at,
                'updated_at', cer_evi.updated_at
            )
        ))
        FROM certificates cer
        LEFT JOIN files cer_evi ON cer_evi.id = cer.evidence_id
        WHERE cer.cv_id = cvs.id
    )
) AS cv
FROM cvs
LEFT JOIN users u ON u.id = cvs.id
LEFT JOIN addresses ad ON ad.id = u.address_id
LEFT JOIN genders g ON g.id = u.gender_id
WHERE cvs.id = ?;`
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

  //get User CV ver 2
  public static async getUserCV2(user_id: string , onNext: (cv: any)=> void){
    const results = await db('cvs')
    .select(db.raw(cvJson('cvs')))
    .leftJoin('users as user', 'user.id', 'cvs.id')
    .leftJoin('addresses as address', 'address.id', 'user.address_id')
    .leftJoin('genders as gender', 'gender.id', 'user.gender_id')
    .where('cvs.id', user_id);
    console.log(results[0]);
    
    onNext(results[0] as CV)
    // return (results[0] as CV)
  }

  //end service
}

