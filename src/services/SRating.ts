import Rating from "../models/Rating";
import SMySQL from "./SMySQL";
import SLog, {LogType} from "./SLog";
import SFirebase, {FirebaseNode} from "./SFirebase";

export default class SRating {
  public static getRatingsInClass(id, onNext: (ratings: Rating[]) => void) {
    const sql = `SELECT ratings.*,
                        JSON_OBJECT(
                                'id', raters.id,
                                'full_name', raters.full_name,
                                'email', raters.email,
                                'phone_number', raters.phone_number,
                                'avatar', JSON_OBJECT(
                                        'id', rater_avatars.id,
                                        'name', rater_avatars.name,
                                        'path', rater_avatars.path,
                                        'capacity', rater_avatars.capacity,
                                        'image_width', rater_avatars.image_with,
                                        'image_height', rater_avatars.image_height
                                          )
                        ) as rater,
                        JSON_OBJECT(
                                'id', ratees.id,
                                'full_name', ratees.full_name,
                                'email', ratees.email,
                                'phone_number', ratees.phone_number,
                                'avatar', JSON_OBJECT(
                                        'id', ratee_avatars.id,
                                        'name', ratee_avatars.name,
                                        'path', ratee_avatars.path,
                                        'capacity', ratee_avatars.capacity,
                                        'image_width', ratee_avatars.image_with,
                                        'image_height', ratee_avatars.image_height
                                          )
                        ) as ratee,
                        JSON_OBJECT(
                                'id', classes.id,
                                'title', classes.title,
                                'description', classes.description,
                                'price', classes.price,
                                'class_creation_fee', classes.class_creation_fee,
                                'max_learners', classes.max_learners,
                                'started_at', classes.started_at,
                                'ended_at', classes.ended_at,
                                'address_1', classes.address_1,
                                'address_2', classes.address_2,
                                'address_3', classes.address_3,
                                'address_4', classes.address_4
                        ) AS class
                 FROM ratings
                          LEFT JOIN users AS raters ON raters.id = ratings.rater_id
                          LEFT JOIN users AS ratees ON ratees.id = ratings.ratee_id
                          LEFT JOIN classes ON classes.id = ratings.class_id
                          LEFT JOIN files as rater_avatars ON rater_avatars.id = raters.avatar_id
                          LEFT JOIN files as ratee_avatars ON ratee_avatars.id = ratees.avatar_id
                 WHERE ratings.class_id = ?
    `;

    SMySQL.getConnection(connection => {
      connection?.execute<any[]>(sql, [id], (error, results) => {
        if (error) {
          SLog.log(LogType.Error, "getRatingsInClass", "get ratings unsuccessfully", error);
          onNext([]);
          return;
        }

        SLog.log(LogType.Info, "getRatingsInClass", "get ratings successfully", results.length);
        const ratings: Rating[] = results;
        onNext(ratings);
      });
    });
  }

  public static storeRating(rating: Rating, onNext: (result: boolean) => void) {
    const sql = `INSERT INTO ratings (rater_id, ratee_id, value, content, class_id, created_at, updated_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`;

    SMySQL.getConnection(connection => {
      connection?.execute<any>(sql, [rating.rater?.id ?? "", rating.ratee?.id ?? "", rating.value, rating.content ?? "", rating.class?.id, new Date().getTime(), -1], (error, result) => {
        if (error) {
          SLog.log(LogType.Error, "storeRating", "store rating unsuccessfully", error);
          onNext(false);
          return;
        }

        const id = result?.insertId;
        SLog.log(LogType.Info, "storeRating", "store rating successfully");
        SFirebase.push(FirebaseNode.Ratings, [{key: FirebaseNode.Id, value: id}], () => {
          onNext(true);
        });
      });
    });
  }
}