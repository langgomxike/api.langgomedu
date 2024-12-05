import CV, { cvJson, cvJson2 } from "./../models/CV";
import SLog, { LogType } from "./SLog";
import SMySQL from "./SMySQL";
import db from "../configs/knex";
import mysql from "mysql2";
import Filters from "../models/Filters";
import Pagination from "../models/Pagination";
import { cvJoin, tempCvJoin } from "../models/User";
import SEducation from "./SEducation";
import SExperience from "./SExperience";
import SCertificate from "./SCertificate";


export default class SCV {

  //get User CV ver 
  public static async getUserCV(user_id: string, onNext: (cv: any) => void) {
    await cvJoin('cvs', 'user', 'address', 'gender', 'icl', 'im',
      db('cvs').
        select(db.raw(cvJson2('cvs', 'user', 'address', 'gender', 'icl', 'im')))
        .where('cvs.id', user_id)
        .groupBy('user.id')
    )
      .then((results) => {
        onNext(results[0])
      })
      .catch((err) => {
        SLog.log(LogType.Error, "getUserCV3", "ERR", err);
      })


  }
  public static async getAllUserCVs(user_id: string, onNext: (cv: any) => void) {
    const mainId = user_id;
    const subId = `${user_id}_t`
    const results: any[] = [];
    await cvJoin('cvs', 'user', 'address', 'gender', 'icl', 'im',
      db('cvs').
        select(db.raw(cvJson2('cvs', 'user', 'address', 'gender', 'icl', 'im')))
        .where('cvs.id', mainId)
        .groupBy('user.id')
    )
      .then((response) => {
        results.push(response[0].cv);
      })
      .catch((err) => {
        SLog.log(LogType.Error, "getUserCV3", "ERR", err);
      })
    await tempCvJoin('cvs', 'user', 'address', 'gender', 'icl', 'im',
      db('cvs').
        select(db.raw(cvJson2('cvs', 'user', 'address', 'gender', 'icl', 'im')))
        .where('cvs.id', subId)
        .groupBy('user.id')
      )
      .then((response) => {
        results.push(response[0].cv);
      })
      .catch((err) => {
        SLog.log(LogType.Error, "getAllUserCVs", "ERR", err.message);

      })

    onNext(results)
  }

  public static async getAllCVs(onNext: (cv: CV[]) => void) {
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
  ) {
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
          per_page: perPage,
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
          per_page: perPage,
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
  ) {

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
      connection?.execute<any[]>(sql, queryParams, (err, results) => {
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
                per_page: perPage,
                total_pages: Math.ceil(totalCount / perPage),
                total_items: totalCount,
              };
              
              onNext(cvs, pagination);
            } )

      });
    });
  }

  public static async UpdateCV(cvData: any, onNext: (response: any) => void) {
    // console.log(JSON.stringify(cvData));
    const cvId = cvData.userId;
    const cvIdnew = `${cvData.userId}_t`;
    const title = cvData.title;
    const biography = cvData.biography;
    const oldEducations = cvData.oldEducations;
    const newEducations = cvData.newEducations;
    const oldExperiences = cvData.oldExperiences;
    const newExperiences = cvData.newExperiences;
    const oldCertificates = cvData.oldCertificates;
    const newCertificates = cvData.newCertificates;
    const updatedAt = Date.now();

    const oldEduIds = await SEducation.storeOldEducations(cvIdnew, oldEducations);
    const newEduIds = await SEducation.storeNewEducations(cvIdnew, newEducations);
    const oldExpIds = await SExperience.storeOldExperiences(cvIdnew, oldExperiences);
    const newExpIds = await SExperience.storeNewExperiences(cvIdnew, newExperiences);
    const oldCerIds = await SCertificate.storeOldCertificates(cvIdnew, oldCertificates);
    const newCerIds = await SCertificate.storeNewCertificates(cvIdnew, newCertificates);
    // console.log(oldEduIds);

    return await db('cvs').insert({
      id: cvIdnew,
      biography: biography,
      title: title,
      updated_at: updatedAt,
      approved_at: null,
    })
      .then((results) => {
        console.log(results);
        onNext({
          cvId: cvIdnew,
          title: title,
          bio: biography,
          oldEdu: oldEduIds,
          newEdu: newEduIds,
          oldExp: oldExpIds,
          newExp: newExpIds,
          oldCer: oldCerIds,
          newCer: newCerIds,
        });
      })
      .catch((err) => {
        console.log("fail to update cv", err.message);
        onNext(null)
      })
  }




  //end service
}

