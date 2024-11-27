import CV, { cvJson, cvJson2 } from "./../models/CV";
import SLog, { LogType } from "./SLog";
import SMySQL from "./SMySQL";
import db from "../configs/knex";
import mysql from "mysql2";
import Filters from "../models/Filters";
import Pagination from "../models/Pagination";
import { cvJoin } from "../models/User";


export default class SCV {

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
  public static async getUserCV3(user_id: string, onNext: (cv: any)=> void) {
    await cvJoin('cvs', 'user', 'address', 'gender', 'icl', 'im', 
        db('cvs').
        select(db.raw(cvJson2('cvs', 'user', 'address', 'gender', 'icl', 'im')))
        .where('cvs.id', user_id)
        .groupBy('user.id')
    )
    .then((results)=>{
        onNext(results[0])
    })
    .catch((err)=>{
        SLog.log(LogType.Error, "getUserCV3", "ERR", err);
    })

    
  }

  public static async getAllCVs(onNext: (cv: CV[])=> void){
    const results = await db('cvs')
    .select(db.raw(cvJson('cvs')))
    .leftJoin('users as user', 'user.id', 'cvs.id')
    .leftJoin('addresses as address', 'address.id', 'user.address_id')
    .leftJoin('genders as gender', 'gender.id', 'user.gender_id')
    
    const cvs: CV[] = [];
    results.forEach(result => {
        const cv = result.cv
        cvs.push(cv);
    });
    onNext(cvs)
  }

  public static cvJsonSQL = `JSON_OBJECT(
        'id', cvs.id,
        'user', JSON_OBJECT(
            'id', users.id,
            'username', users.user_name,
            'fullname', users.full_name,
            'phone_number', users.phone_number,
            'avatar', users.avatar,
            'hometown', users.hometown,
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
            'birthday', users.birthday,
            'point', users.point
        )
    ) AS user_data
  `

  public static getSugestedCVs2(
    page: number, perPage: number,
    province: string | undefined, district: string | undefined, ward: string | undefined,
    onNext: (cvs: CV[], pagination: Pagination) => void,
  ){
    const sql = `
        WITH SuggestedCVs AS (
        SELECT
          ${this.cvJsonSQL}
        FROM cvs
        LEFT JOIN users ON users.id = cvs.id
        LEFT JOIN addresses ad ON ad.id = users.address_id
        LEFT JOIN genders g ON g.id = users.gender_id
        WHERE
          ad.province LIKE "%?%" AND ad.district LIKE "%?%" 
        ),
        RandomCVs AS (
        SELECT
          ${this.cvJsonSQL}
        FROM cvs
        LEFT JOIN users ON users.id = cvs.id
        LEFT JOIN addresses ad ON ad.id = users.address_id
        LEFT JOIN genders g ON g.id = users.gender_id
        WHERE cvs.id NOT IN (SELECT cvs.id FROM SuggestedCVs)
        ),
        CombinedCVs AS (
        SELECT * FROM SuggestedCVs
        UNION ALL
        SELECT * FROM RandomCVs
        )
        -- Lấy dữ liệu phân trang
        SELECT (SELECT COUNT(*) FROM CombinedCVs) AS totalCount,
        CombinedCVs.*
        FROM CombinedCVs
        ORDER BY RAND()
        LIMIT ${perPage} OFFSET ${(page - 1) * perPage};
    `;

    console.log("getSugestedCVs");
    
    // console.log(mysql.format(sql, [province, district]));

    SMySQL.getConnection((connection)=>{
      connection?.query<any[]>(sql, [province, district], (err, results)=>{
        if(err){
          SLog.log(LogType.Error, "fail to fetch cv", "can't fetch user cv", err),
          onNext([], new Pagination)
          return;
        }

        const totalCount = results[0]?.totalCount
        const cvs: CV[] = []
        results.forEach((result) => {
          const cv = result.user_data
          cvs.push(cv)

        })
        const pagination: Pagination = {
          page: page,
          perPage: perPage,
          total_pages: Math.ceil(totalCount / perPage),
          total_items: totalCount,
        };

        onNext(cvs, pagination)
        return;

      })
    })
  }

  public static getSugestedCVs(
    page: number, perPage: number,
    filter: Filters,
    onNext: (cvs: CV[], pagination: Pagination) => void,
  ){

    // Build SQL query dynamically based on provided filters
    let filterConditions = "1=1 AND cvs.approved_at IS NOT NULL";
    let queryParams: any[] = []; 

    // Add filter conditions if they are provided
  if (filter.province) {
    const provinces = filter.province.split(",").map((p) => `%${p.trim()}%`);
    filterConditions += ` AND (${provinces.map(() => "ad.province LIKE ?").join(" OR ")})`;
    queryParams.push(...provinces);
  }

  if (filter.district) {
    const districts = filter.district.split(",").map((d) => `%${d.trim()}%`);
    filterConditions += ` AND (${districts.map(() => "ad.district LIKE ?").join(" OR ")})`;
    queryParams.push(...districts); 
  }

  if (filter.ward) {
    const wards = filter.ward.split(",").map((w) => `%${w.trim()}%`);
    filterConditions += ` AND (${wards.map(() => "ad.ward LIKE ?").join(" OR ")})`;
    queryParams.push(...wards);
  }

    const sql = `
        WITH SuggestedCVs AS (
        SELECT
          ${this.cvJsonSQL}
        FROM cvs
        LEFT JOIN users ON users.id = cvs.id
        LEFT JOIN addresses ad ON ad.id = users.address_id
        LEFT JOIN genders g ON g.id = users.gender_id
        WHERE ${filterConditions}
        ),
        RandomCVs AS (
        SELECT
          ${this.cvJsonSQL}
        FROM cvs
        LEFT JOIN users ON users.id = cvs.id
        LEFT JOIN addresses ad ON ad.id = users.address_id
        LEFT JOIN genders g ON g.id = users.gender_id
        WHERE cvs.approved_at IS NOT NULL AND cvs.id NOT IN (SELECT cvs.id FROM SuggestedCVs)
        ),
        CombinedCVs AS (
        SELECT * FROM SuggestedCVs
        UNION ALL
        SELECT * FROM RandomCVs
        )
        -- Lấy dữ liệu phân trang
        SELECT (SELECT COUNT(*) FROM CombinedCVs) AS totalCount,
        CombinedCVs.*
        FROM CombinedCVs
        LIMIT ${perPage} OFFSET ${(page - 1) * perPage};
    `;

    console.log("getSugestedCVs", mysql.format(sql, queryParams));
    
    // console.log(mysql.format(sql, [province, district]));

    SMySQL.getConnection((connection)=>{
      connection?.query<any[]>(sql, queryParams, (err, results)=>{
        if(err){
          SLog.log(LogType.Error, "fail to fetch cv", "can't fetch user cv", err),
          onNext([], new Pagination)
          return;
        }

        const totalCount = results[0]?.totalCount
        const cvs: CV[] = []
        results.forEach((result) => {
          const cv = result.user_data
          cvs.push(cv)

        })
        const pagination: Pagination = {
          page: page,
          perPage: perPage,
          total_pages: Math.ceil(totalCount / perPage),
          total_items: totalCount,
        };

        onNext(cvs, pagination)
        return;

      })
    })
  }

  public static getSugestedCVsFilter(
    page: number, perPage: number,
    filter: Filters,
    onNext: (cvs: CV[], pagination: Pagination) => void
){
    
    // Build SQL query dynamically based on provided filters
    let filterConditions = "1=1";
    let queryParams: any[] = []; 

    // Add filter conditions if they are provided
  if (filter.province) {
    const provinces = filter.province.split(",").map((p) => `%${p.trim()}%`);
    filterConditions += ` AND (${provinces.map(() => "ad.province LIKE ?").join(" OR ")})`;
    queryParams.push(...provinces);
  }

  if (filter.district) {
    const districts = filter.district.split(",").map((d) => `%${d.trim()}%`);
    filterConditions += ` AND (${districts.map(() => "ad.district LIKE ?").join(" OR ")})`;
    queryParams.push(...districts); 
  }

  if (filter.ward) {
    const wards = filter.ward.split(",").map((w) => `%${w.trim()}%`);
    filterConditions += ` AND (${wards.map(() => "ad.ward LIKE ?").join(" OR ")})`;
    queryParams.push(...wards);
  }

    // Full SQL query with dynamic filter conditions
    const sql = `
        SELECT
          ${this.cvJsonSQL}
        FROM cvs
        LEFT JOIN users ON users.id = cvs.id
        LEFT JOIN addresses ad ON ad.id = users.address_id
        LEFT JOIN genders g ON g.id = users.gender_id
        LEFT JOIN interested_majors im ON im.user_id = users.id
        LEFT JOIN interested_class_levels icl ON icl.user_id = users.id
        WHERE ${filterConditions}
        LIMIT ${perPage} OFFSET ${(page - 1) * perPage};
    `;

    const totalSql = `
     SELECT COUNT(*) as totalCount
    FROM cvs
    LEFT JOIN users ON users.id = cvs.id
    LEFT JOIN addresses ad ON ad.id = users.address_id
    LEFT JOIN genders g ON g.id = users.gender_id
    LEFT JOIN interested_majors im ON im.user_id = users.id
    LEFT JOIN interested_class_levels icl ON icl.user_id = users.id
    WHERE ${filterConditions}
    `

    console.log("getSugestedCVs with filters:", filter);
    console.log(mysql.format(sql, queryParams));

    // Execute the query
    SMySQL.getConnection((connection) => {
        connection?.execute<any[]>(sql, queryParams ,(err, results) => {
            if (err) {
                SLog.log(LogType.Error, "fail to fetch cv", "can't fetch user cv", err);
                onNext([], new Pagination);
                return;
            }

            const cvs: CV[] = []
            results.forEach((result) => {
              const cv = result.user_data
              cvs.push(cv)
    
            })
  
            connection.execute<any>(totalSql, queryParams, (err, result) => {
              if (err) {
                SLog.log(LogType.Error, "fail to fetch total count", "can't fetch total count", err);
                onNext([], new Pagination);
                return;
              }

              const totalCount = result[0].totalCount;

              const pagination: Pagination = {
                page: page,
                perPage: perPage,
                total_pages: Math.ceil(totalCount / perPage),
                total_items: totalCount,
              };
              
              onNext(cvs, pagination);
            } )

        });
    });
}

  


  
  //end service
}

