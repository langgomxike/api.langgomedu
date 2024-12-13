import Class from '../../models/Class';
import Lesson from '../../models/Lesson';
import Pagination from '../../models/Pagination';
import User from '../../models/User';
import SMySQL from '../SMySQL';
import SMessage from "../SMessage";
import SLog, {LogType} from "../SLog";
import SFirebase, { FirebaseNode } from '../SFirebase';

const classJsonSql = `
JSON_OBJECT(
        'id', classes.id,
        'title', classes.title,
        'description', classes.description,
        'price', classes.price,
        'class_creation_fee', classes.class_creation_fee,
        'max_learners', classes.max_learners,
        'started_at', classes.started_at,
        'ended_at', classes.ended_at,
        'paid', classes.paid,
        'paid_path', classes.paid_path,
        'admin_accepted', classes.admin_accepted,
       	'author_accepted', classes.author_accepted,
        'created_at', classes.created_at,
        'updated_at', classes.updated_at,
        'address', JSON_OBJECT (
                        "id", addresses.id,
                        "province", addresses.province,
                        "district", addresses.district,
                        "ward", addresses.ward,
                        "detail", addresses.detail
                    ),
        'major', JSON_OBJECT(
                    'id', majors.id,
                    'vn_name', majors.vn_name,
                    'en_name', majors.en_name,
                    'ja_name', majors.ja_name,
                    'icon', majors.icon
                    ),
        'author', JSON_OBJECT(
                'id', author.id,
                'full_name', author.full_name,
                'email', author.email,
                'phone_number', author.phone_number,
                'avatar', author.avatar
            ),
        'tutor', JSON_OBJECT(
                'id', tutor.id,
                'full_name', tutor.full_name,
                'email', tutor.email,
                'phone_number', tutor.phone_number,
                'avatar', tutor.avatar
            ),
         'class_level', JSON_OBJECT(
                'id', class_levels.id,
                'vn_name', class_levels.vn_name,
                'en_name', class_levels.en_name,
                'ja_name', class_levels.ja_name
            	),
        'is_reported', CASE 
                WHEN reports.class_id IS NOT NULL THEN true 
                ELSE false 
            END
        ) AS class
`
export default class SClassAdmin {
  // Lấy tất cả lớp học và tìm kiếm theo từ khóa
  public static getAllClasses(search, action, page, perPage, onNext: (classes: Class[], pagination: Pagination) => void) {
    const TAB = {
      ALL: "all",
      PENDING_APPROVAL: "pendingApproval",
      PENDING_PAY: "pendingPay",
      REPORTED: "reported",
    };

    let additionalCondition = "";
    // Điều kiện tìm kiếm tùy thuộc vào `userType`
    switch (action) {
      case TAB.REPORTED : {
        additionalCondition = "AND reports.class_id IS NOT NULL";
        break;
      }
      case TAB.PENDING_APPROVAL : {
        additionalCondition = "AND classes.admin_accepted = 0 OR classes.admin_accepted IS NULL ";
        break;
      }
      case TAB.PENDING_PAY : {
        additionalCondition = "AND classes.admin_accepted = 1  AND classes.paid IS NULL";
        break;
      }
      default: {
        break;
      }
    }

    const searchCondition = search !== undefined
      ? `CONCAT(
            classes.title, ' ',
            majors.vn_name, ' ', majors.en_name, ' ', majors.ja_name, ' ',
            class_levels.vn_name, ' ', class_levels.en_name, ' ', class_levels.ja_name, ' ',
            addresses.province, ' ', addresses.district, ' ', addresses.ward, ' ', addresses.detail
        ) LIKE CONCAT('%', ?, '%')`
      : "1=1";

    const sql = `
        SELECT ${classJsonSql}
        FROM classes
                 LEFT JOIN users AS author ON author.id = classes.author_id
                 LEFT JOIN users AS tutor ON tutor.id = classes.tutor_id
                 LEFT JOIN majors ON majors.id = classes.major_id
                 LEFT JOIN class_levels ON class_levels.id = classes.class_level_id
                 LEFT JOIN addresses ON addresses.id = classes.address_id
                 LEFT JOIN reports ON reports.class_id = classes.id
        WHERE ${searchCondition} ${additionalCondition}
        ORDER BY classes.updated_at DESC
    `;

    const countSQL = `
        SELECT COUNT(classes.id) AS total
        FROM classes
                 LEFT JOIN users AS author ON author.id = classes.author_id
                 LEFT JOIN users AS tutor ON tutor.id = classes.tutor_id
                 LEFT JOIN majors ON majors.id = classes.major_id
                 LEFT JOIN class_levels ON class_levels.id = classes.class_level_id
                 LEFT JOIN addresses ON addresses.id = classes.address_id
                 LEFT JOIN reports ON reports.class_id = classes.id
        WHERE ${searchCondition} ${additionalCondition}
    `;

    const params = search !== undefined ? [search] : [];

    // console.log(mysql.format(sql, params));


    SMySQL.getConnection((connection) => {
      connection?.execute<any[]>(sql, params, (err, results) => {
        if (err) {
          console.log("getAllClasses", err);

          onNext([], new Pagination);
          return;
        }
        const classes: Class[] = [];

        results.forEach((result) => {
          const _class = result.class;
          _class.is_reported = result.class.is_reported === 1 ? true : false;
          classes.push(_class);
        });

        connection.execute(countSQL, params, (err, countResults) => {
          if (err) {
            console.log("get total", err);
            onNext([], new Pagination);
            return;
          }
          const total = countResults[0].total;
          const pagination: Pagination = {
            page: page,
            per_page: perPage,
            total_pages: Math.ceil(total / perPage),
            total_items: total,
          };

          onNext(classes, pagination);
        });
      });
    });
  }

  // Lấy chi tiết lớp học theo id
  public static getClassById(class_id: number, onNext: (lessons: Lesson[], users: User[]) => void) {
    const sql = `
        SELECT (SELECT JSON_ARRAYAGG(
                               JSON_OBJECT(
                                       'id', l.id,
                                       'day', l.day,
                                       'started_at', l.started_at,
                                       'duration', l.duration,
                                       'is_online', l.is_online,
                                       'note', l.note
                               )
                       )
                FROM (SELECT *
                      FROM lessons
                      WHERE lessons.class_id = classes.id
                      GROUP BY day
                      ORDER BY day ASC) l)      AS lessons,

               (SELECT JSON_ARRAYAGG(
                               JSON_OBJECT(
                                       'id', users.id,
                                       'full_name', users.full_name,
                                       'avatar', users.avatar
                               )
                       )
                FROM class_members cm
                         LEFT JOIN users ON users.id = cm.user_id
                WHERE cm.class_id = classes.id) AS users

        FROM classes
        WHERE classes.id = ?;
    `;

    SMySQL.getConnection((connection) => {
      connection?.execute<any>(sql, [class_id], (err, results) => {
        if (err) {
          onNext([], []);
          return;
        }

        const lessons = results[0].lessons
        const users = results[0].users

        onNext(lessons, users);
      });
    });
  }

  // Duyệt lớp học
  public static approveClass(class_id: number, onNext: (result: boolean, message: string) => void) {
    const sqlUpdate = "UPDATE classes SET admin_accepted = ?, updated_at = ? WHERE id = ?;"

    const updatedAt = new Date().getTime();
    SMySQL.getConnection((connection) => {
      connection?.execute(sqlUpdate, [1, updatedAt, class_id], (err) => {
        if (err) {
          console.log("adminApproveClass", "Update class failed", err);

          onNext(false, "admin Approve Class failed");
          return;
        }

        const sql = `SELECT *,
                            JSON_OBJECT(
                                    'id', classes.author_id
                            ) as author
                     FROM classes
                     WHERE id = ?`;
        connection?.execute<any[]>(sql, [class_id], async (error, result) => {
          const _class: Class | undefined | false = result.length > 0 && (result[0] as Class ?? undefined);
          if (_class) {
            const enNoti = `Your class [${_class.title}] has been approved by the admin.`;
            const vnNoti = `Lớp học của bạn [${_class.title}] đã được duyệt bởi quản trị viên.`;
            const jaNoti = `あなたのクラス「${_class.title}」が管理者によって承認されました。`;

            await SMessage.createNotification(vnNoti, enNoti, jaNoti, _class?.author?.id ?? "-1", () => {
            })

            SFirebase.push(FirebaseNode.Classes, [{key: FirebaseNode.Id, value: class_id}], () => {
              onNext(true, "Admin approve class success!");
            })
          } else {
            onNext(true, "Admin approve class success!");
          }
        });
      });
    });
  }


  // Xác nhận đã thanh toán
  public static approvePaymentByAdmin(class_id: number, onNext: (result: boolean, message: string) => void) {
    const sqlUpdate = "UPDATE classes SET paid = ?, updated_at = ? WHERE id = ?;"

    const updatedAt = new Date().getTime();
    SMySQL.getConnection((connection) => {
      connection?.execute(sqlUpdate, [1, updatedAt, class_id], (err) => {
        if (err) {
          console.log("Approve payment by admin", "Update class failed", err);

          onNext(false, "Approve payment by admin failed");
          return;
        }
        const sql = `SELECT *,
                            JSON_OBJECT(
                                    'id', classes.author_id
                            ) as author
                     FROM classes
                     WHERE id = ?`;
        connection?.execute<any[]>(sql, [class_id], async (error, result) => {
          const _class: Class | undefined | false = result.length > 0 && (result[0] as Class ?? undefined);
          if (_class) {
            const enNoti = `The admin has confirmed the payment for the creation fee of your class [${_class.title}].`;
            const vnNoti = `Quản trị viên đã xác nhận thanh toán phí tạo lớp của bạn [${_class.title}].`;
            const jaNoti = `管理者があなたのクラス「${_class.title}」の作成料金の支払いを確認しました。`;

            await SMessage.createNotification(vnNoti, enNoti, jaNoti, _class?.author?.id ?? "-1", () => {
            })

            SFirebase.push(FirebaseNode.Classes, [{key: FirebaseNode.Id, value: class_id}], () => {
              onNext(true, "Admin approve class success!");
            })
          } else {
            onNext(false, "Admin approve class fail!");
          }
        });

      });
    });
  }

  // Từ chối xác nhận thanh toán
  public static async denyPaymentByAdmin(classData: Class, onNext: (result: boolean, message: string) => void) {
    //noti for author
    const enAuthorNoti = `We regret to inform you that we cannot confirm the payment for the class [${classData.title}] as the amount received does not match the required amount.`;
    const vnAuthorNoti = `Chúng tôi rất tiếc không thể xác nhận thanh toán phí của lớp học [${classData.title}] vì số tiền nhận được không khớp với số tiền yêu cầu.`;
    const jaAuthorNoti = `クラス「${classData.title}」の支払い金額が必要な金額と一致しないため、確認することができません。`;    


    const recipientId =  classData.tutor?.id === classData.author?.id 
        ? classData.author?.id // Gửi cho author nếu tutor là author
        : classData.tutor?.id; // Gửi cho tutor nếu tutor khác author

        if (recipientId) {
          await SMessage.createNotification(vnAuthorNoti, enAuthorNoti, jaAuthorNoti, recipientId, () => {
              onNext(true, "Send success message");
              console.log("Đã gửi thông báo nhắc nhở thành công.");
          });
      } else {
          onNext(false, "Recipient not found");
          console.log("Không tìm thấy người nhận thông báo.");
    }
  }

  public static async remindPaymentByAdmin(classData: Class, onNext: (result: boolean, message: string) => void) {
    // Notification for author
    const enAuthorNoti = `You have not paid the class creation fee for [${classData.title}]. Please proceed with the payment.`;
    const vnAuthorNoti = `Bạn chưa thanh toán phí tạo lớp cho lớp học [${classData.title}]. Vui lòng thanh toán phí tạo lớp.`;
    const jaAuthorNoti = `クラス「${classData.title}」の作成料金がまだ支払われていません。お支払いをお願いいたします。`;

    const recipientId =  classData.tutor?.id === classData.author?.id 
    ? classData.author?.id // Gửi cho author nếu tutor là author
    : classData.tutor?.id; // Gửi cho tutor nếu tutor khác author

    if (recipientId) {
      await SMessage.createNotification(vnAuthorNoti, enAuthorNoti, jaAuthorNoti, recipientId, () => {
          onNext(true, "Send success message");
          console.log("Đã gửi thông báo nhắc nhở thành công.");
      });
  } else {
      onNext(false, "Recipient not found");
      console.log("Không tìm thấy người nhận thông báo.");
}
}

  public static deleteClass(id: number, onNext: (result: boolean) => void) {
    const sqlDeteleClass = "DELETE FROM classes WHERE id =?;";
    const sqlDeteleLessons = "DELETE FROM lessons WHERE class_id =?;";
    const sqlDeteleMesaages = "DELETE FROM messages WHERE class_id =?;";
    const sqlDeteleClassMember = "DELETE FROM class_members WHERE class_id =?;";
    const sqlDeteleReport = "DELETE FROM reports WHERE class_id =?;";

    const sqlFindClass = `SELECT *,
                                 JSON_OBJECT(
                                         'id', classes.author_id
                                 )                                           as author,
                                 JSON_OBJECT(
                                         'id', classes.tutor_id
                                 )                                           as tutor,
                                 (SELECT JSON_ARRAYAGG(user_id)
                                  FROM class_members
                                  WHERE class_members.class_id = classes.id) AS members_ids
                          FROM classes
                          WHERE id = ?`;

    SMySQL.getConnection((connection) => {
      connection?.execute<any[]>(sqlFindClass, [id], (error, result) => {
        const _class: Class | undefined | false = result.length > 0 && (result[0] as Class ?? undefined);
        if (_class) {

          //delete all tables taht have relations to class
          connection.execute(sqlDeteleLessons, [id]);
          connection.execute(sqlDeteleMesaages, [id]);
          connection.execute(sqlDeteleClassMember, [id]);
          connection.execute(sqlDeteleReport, [id]);

          connection?.execute(sqlDeteleClass, [id], async (error) => {
            if (error) {
              SLog.log(LogType.Error, "deleteClass", "Delete class failed", error);
              onNext(false);
              return;
            }

            //noti for author
            const enAuthorNoti = `The class that you created [${_class.title}] has been deleted by the admin.`;
            const vnAuthorNoti = `Lớp học mà bạn đã tạo [${_class.title}] đã bị xóa bởi quản trị viên.`;
            const jaAuthorNoti = `あなたが作成したクラス「${_class.title}」は管理者によって削除されました。`;
            await SMessage.createNotification(vnAuthorNoti, enAuthorNoti, jaAuthorNoti, _class?.author?.id ?? "-1", () => {
            });

            //noti for tutor
            const enTutorNoti = `The class that you're teaching [${_class.title}] has been deleted by the admin.`;
            const vnTutorNoti = `Lớp học mà bạn đang giảng dạy [${_class.title}] đã bị xóa bởi quản trị viên.`;
            const jaTutorNoti = `あなたが教えているクラス「${_class.title}」は管理者によって削除されました。`;
            await SMessage.createNotification(vnTutorNoti, enTutorNoti, jaTutorNoti, _class?.tutor?.id ?? "-1", () => {
            });

            const members: string[] = ((_class as any ?? []).members_ids as string[]) ?? [];
            members.forEach(async (id) => {
              //noti for tutor
              const enMemberNoti = `The class that you're learning [${_class.title}] has been deleted by the admin.`;
              const vnMemberNoti = `Lớp học mà bạn đang tham gia [${_class.title}] đã bị xóa bởi quản trị viên.`;
              const jaMemberNoti = `あなたが参加しているクラス「${_class.title}」は管理者によって削除されました。`;
              await SMessage.createNotification(vnMemberNoti, enMemberNoti, jaMemberNoti, id, () => {
              });
            });

            onNext(true);
            return;
          });
        } else {
          onNext(false);
        }
      });
    });
  }

}