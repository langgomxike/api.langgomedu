import Message from "../models/Message";
import SMySQL from "./SMySQL";
import SLog, {LogType} from "./SLog";
import SFirebase, {FirebaseNode} from "./SFirebase";
import Inbox from "../models/Inbox";
import * as dotenv from "dotenv";
import ClassInbox from "../models/ClassInbox";

export default class SMessage {
  private static MAX_MESSAGES_IN_ONE_BATCH = 100;

  public static getAllNotifications(userId: string, onNext: (messges: Message[]) => void) {
    const sql = `SELECT *
                 FROM messages
                 WHERE receiver_id = ?
                   AND sender_id = ?
                 ORDER BY created_at DESC`;

    dotenv.config();
    const superAdminId = process.env.ADMIN_ID ?? "-1";

    SMySQL.getConnection(connection => {
      connection?.execute<any[]>(sql, [userId, superAdminId], (error, results) => {
        if (error) {
          onNext([]);
          SLog.log(LogType.Error, "getAllNotifications", "", error);
          return;
        }

        const messages: Message[] = results as Message[] ?? [];
        SLog.log(LogType.Info, "getAllNotifications", "sql result", messages.length);
        onNext(messages);
      });
    });
  }

  public static deleteNotifications(id: number, userId: string, onNext: (result: boolean) => void) {
    const sql = `DELETE
                 FROM messages
                 WHERE id = ?`;

    SMySQL.getConnection(connection => {
      connection?.execute<any>(sql, [id], (error, result) => {
        if (error) {
          onNext(false);
          SLog.log(LogType.Error, "deleteNotification", "", error);
          return;
        }

        SLog.log(LogType.Info, "deleteNotification", "id: " + id, result);
        SFirebase.delete(FirebaseNode.Notifications, [{key: FirebaseNode.UserId, value: userId}], () => {
          onNext(true);
        });
      });
    });
  }

  public static createNotification(content: string, userId: string, onNext: (result: boolean) => void) {
    const sql = `INSERT INTO messages (sender_id, receiver_id, content, created_at, as_read)
                 VALUES (?, ?, ?, ?, 0)`;

    dotenv.config();
    const superAdminId = process.env.ADMIN_ID ?? "-1";

    SMySQL.getConnection(connection => {
      connection?.execute<any>(sql, [superAdminId, userId, content, new Date().getTime()], (error, result) => {
        if (error) {
          onNext(false);
          SLog.log(LogType.Error, "createNotification", "", error);
          return;
        }

        SLog.log(LogType.Info, "createNotification", "content: " + content, result);

        SFirebase.push(FirebaseNode.Notifications, [{key: FirebaseNode.UserId, value: userId}], () => {
          onNext(true);
        });
      });
    });
  }

  public static getInboxes(userId: string, onNext: (inboxes: Inbox[]) => void) {
    const sql = `SELECT CASE
                            WHEN m1.sender_id = ? THEN m1.receiver_id
                            ELSE m1.sender_id
                            END AS other_user_id,
                        JSON_OBJECT(
                                'id', u.id,
                                'full_name', u.full_name,
                                'avatar', u.avatar
                        )       AS other_user_info,
                        JSON_OBJECT(
                                'id', m1.id,
                                'content', m1.content,
                                'created_at', m1.created_at,
                                'as_read', m1.as_read,
                                'sender', JSON_OBJECT(
                                        'id', m1.sender_id
                                          )
                        )       AS newest_message
                 FROM messages m1
                          INNER JOIN
                      users u ON u.id = CASE
                                            WHEN m1.sender_id = ? THEN m1.receiver_id
                                            ELSE m1.sender_id
                          END
                 WHERE class_id IS NULL
                   AND m1.sender_id <> ?
                   AND ? IN (m1.sender_id, m1.receiver_id)
                   AND m1.created_at = (SELECT MAX(m2.created_at)
                                        FROM messages m2
                                        WHERE (m1.sender_id = m2.sender_id AND m1.receiver_id = m2.receiver_id)
                                           OR (m1.sender_id = m2.receiver_id AND m1.receiver_id = m2.sender_id))
                 ORDER BY m1.created_at DESC`;

    dotenv.config();
    const superAdminId = process.env.ADMIN_ID ?? "-1";

    SMySQL.getConnection(connection => {
      connection?.execute<any[]>(sql, [userId, userId, superAdminId, userId], (error, results) => {
        if (error) {
          onNext([]);
          SLog.log(LogType.Error, "getAllMessages", "", error);
          return;
        }

        const inboxes: Inbox[] = results as Inbox[] ?? [];
        SLog.log(LogType.Info, "getAllMessages", "get all inboxes successfully", inboxes.length);

        onNext(inboxes);
      });
    });
  }

  public static getGroupInboxes(userId: string, onNext: (inboxes: ClassInbox[]) => void) {
    const sql = `SELECT JSON_OBJECT(
                                'id', c.id,
                                'title', c.title,
                                'tutor_id', c.tutor_id,
                                'major', JSON_OBJECT(
                                        'icon', majors.icon
                                         )
                        ) AS in_class,
                        JSON_OBJECT(
                                'id', m.id,
                                'content', m.content,
                                'created_at', m.created_at,
                                'as_read', m.as_read,
                                'sender', JSON_OBJECT(
                                          'id', users.id
                                          )
                        ) AS newest_message
                 FROM classes c
                          LEFT JOIN majors ON c.major_id = majors.id
                          INNER JOIN class_members ON class_members.user_id = ? AND class_members.class_id = c.id
                          LEFT JOIN
                      messages m ON m.id = (SELECT id
                                            FROM messages
                                            WHERE class_id = c.id
                                            ORDER BY created_at DESC
                     LIMIT 1
                     )
                     LEFT JOIN users ON m.sender_id = users.id
                 ORDER BY m.created_at DESC`;

    SMySQL.getConnection(connection => {
      connection?.execute<any[]>(sql, [userId], (error, results) => {
        if (error) {
          onNext([]);
          SLog.log(LogType.Error, "getAllMessages", "", error);
          return;
        }

        const inboxes: ClassInbox[] = results as ClassInbox[] ?? [];
        SLog.log(LogType.Info, "getAllMessages", "get all inboxes successfully", inboxes.length);

        onNext(inboxes);
      });
    });
  }

  public static getMessages(isMine: boolean, fromUserId: string, toUserId: string, batch: number = 1, onNext: (messages: Message[]) => void) {
    const sql = `SELECT messages.*,
                        JSON_OBJECT(
                                'id', from_users.id,
                                'full_name', from_users.full_name,
                                'email', from_users.email,
                                'phone_number', from_users.phone_number
                        ) AS sender,
                        JSON_OBJECT(
                                'id', to_users.id,
                                'full_name', to_users.full_name,
                                'email', to_users.email,
                                'phone_number', to_users.phone_number
                        ) AS receiver
                 FROM messages
                          LEFT JOIN users AS from_users ON messages.sender_id = from_users.id
                          LEFT JOIN users AS to_users ON messages.receiver_id = to_users.id
                 WHERE (sender_id = ?
                     AND receiver_id = ?)
                    OR (receiver_id = ?
                     AND sender_id = ?)
                 ORDER BY created_at`;

    // SLog.log(LogType.Warning, "getMessages", "check parameters", {fromUserId, toUserId, batch});

    SMySQL.getConnection(connection => {
      connection?.execute<any[]>(sql, [fromUserId, toUserId, fromUserId, toUserId], (error, result) => {
        if (error) {
          onNext([]);
          SLog.log(LogType.Error, "getMessages", "getMessages unsuccessfully", error);
          return;
        }

        const messages: Message[] = result;
        onNext(messages);
      });
    });
  }

  public static getClassMessages(classId: number, onNext: (messages: Message[]) => void) {
    const sql = `SELECT messages.*,
                        JSON_OBJECT(
                                'id', from_users.id,
                                'full_name', from_users.full_name,
                                'email', from_users.email,
                                'phone_number', from_users.phone_number
                        ) AS sender
                 FROM messages
                          LEFT JOIN users AS from_users ON messages.sender_id = from_users.id
                 WHERE class_id = ?
                 ORDER BY created_at`;

    SMySQL.getConnection(connection => {
      connection?.execute<any[]>(sql, [classId], (error, result) => {
        if (error) {
          onNext([]);
          SLog.log(LogType.Error, "getMessages", "getMessages unsuccessfully", error);
          return;
        }

        const messages: Message[] = result;
        onNext(messages);
      });
    });
  }

  public static storeMessage(message: Message, onNext: (result: boolean) => void) {
    const sql = "INSERT INTO messages (`sender_id`, `receiver_id`, `content`, `created_at`, `ratio`) VALUES (?,?,?,?, ?)";

    if (!message || !message.sender || !message.receiver || !message.content) {
      onNext(false);
      SLog.log(LogType.Error, "storeMessage", "storeMessage unsuccessfully", "invalid message");
      return;
    }

    SMySQL.getConnection(connection => {
      connection?.execute(sql, [
        message.sender?.id ?? "-1",
        message.receiver?.id ?? "-1",
        message.content,
        new Date().getTime(),
        message.ratio ?? 1,
      ], (error, result) => {
        if (error) {
          onNext(false);
          SLog.log(LogType.Error, "storeMessage", "storeMessage unsuccessfully", error);
          return;
        }

        SLog.log(LogType.Info, "storeMessage successfully");

        // push message into firebase
        SFirebase.push(FirebaseNode.Messages,
          [
            {key: FirebaseNode.FromUserId, value: message.sender?.id ?? "-1"},
            {key: FirebaseNode.ToUserId, value: message.receiver?.id ?? "-1"},
          ],
          () => {
            SFirebase.push(FirebaseNode.Messages,
              [
                {key: FirebaseNode.FromUserId, value: message.receiver?.id ?? "-1"},
                {key: FirebaseNode.ToUserId, value: message.sender?.id ?? "-1"},
              ],
              () => {
                onNext(true);
              }
            );
          }
        );
      });
    })
  }

  public static storeClassMessage(message: Message, onNext: (result: boolean) => void) {
    const sql = "INSERT INTO messages (`sender_id`, `class_id`, `content`, `created_at`, `ratio`, `receiver_id`) VALUES (?,?,?,?, ?, -1)";

    if (!message || !message.sender || !message.class || !message.content) {
      onNext(false);
      SLog.log(LogType.Error, "storeMessage", "storeMessage unsuccessfully", "invalid message");
      return;
    }

    SMySQL.getConnection(connection => {
      connection?.execute(sql, [
        message.sender?.id ?? "-1",
        message.class?.id ?? -1,
        message.content,
        new Date().getTime(),
        message.ratio ?? 1,
      ], (error, result) => {
        if (error) {
          onNext(false);
          SLog.log(LogType.Error, "storeMessage", "storeMessage unsuccessfully", error);
          return;
        }

        SLog.log(LogType.Info, "storeMessage successfully");

        // push message into firebase
        SFirebase.push(FirebaseNode.Messages,
          [
            {key: FirebaseNode.ClassId, value: message.class?.id ?? "-1"},
          ],
          () => {
            onNext(true);
          }
        );
      });
    })
  }

  public static markAsRead(fromUserId: string, toUserId: string, onNext: () => void) {
    const sql = `UPDATE messages
                 SET as_read = 1
                 WHERE (sender_id = ? AND receiver_id = ?)`;

    SMySQL.getConnection(connection => {
      connection?.execute(sql, [fromUserId, toUserId], (error) => {
        if (error) {
          SLog.log(LogType.Error, "markAsRead", "markAsRead unsuccessfully", error);
          onNext();
          return;
        }

        SFirebase.push(
          FirebaseNode.Messages,
          [
            {key: FirebaseNode.FromUserId, value: fromUserId},
            {key: FirebaseNode.ToUserId, value: toUserId}
          ]
          , () => {
            SFirebase.push(
              FirebaseNode.Messages,
              [
                {key: FirebaseNode.FromUserId, value: toUserId},
                {key: FirebaseNode.ToUserId, value: fromUserId}
              ]
              , onNext);
          });
      });
    });
  }

  public static markAsReadClassMessages(userId: string, classId: number, onNext: () => void) {
    const sql = `UPDATE messages
                 SET as_read = 1
                 WHERE sender_id <> ?
                   AND class_id = ?`;

    SMySQL.getConnection(connection => {
      connection?.execute(sql, [userId, classId], (error) => {
        if (error) {
          SLog.log(LogType.Error, "markAsRead", "markAsRead unsuccessfully", error);
          onNext();
          return;
        }

        SFirebase.push(
          FirebaseNode.Messages,
          [
            {key: FirebaseNode.ClassId, value: classId},
          ],
          onNext
        );
      });
    });
  }

  public static markAsReadNotifications(
    userId: string,
    onNext: () => void
  ) {
    const sql = `UPDATE messages
                 SET as_read = 1
                 WHERE sender_id = ?
                   AND receiver_id = ?`;

    dotenv.config();
    const superAdminId = process.env.ADMIN_ID ?? "-1";

    SMySQL.getConnection(connection => {
      connection?.execute(sql, [superAdminId, userId ?? "-1"], (error) => {
        if (error) {
          SLog.log(LogType.Error, "markAsRead", "markAsRead unsuccessfully", error);
          onNext();
          return;
        }

        SFirebase.push(FirebaseNode.Notifications, [{key: FirebaseNode.UserId, value: userId ?? "-1"}], onNext);
      });
    });
  }

  public static deleteMessage(
    id: number,
    fromUserId: string,
    toUserId: string,
    onNext: (result: boolean) => void
  ) {
    const sql = `UPDATE messages
                 SET is_active = 0
                 WHERE id = ?`;

    SMySQL.getConnection(connection => {
      connection?.execute<any>(sql, [id], (error, result) => {
        if (error) {
          onNext(false);
          SLog.log(LogType.Error, "deleteMessage", "", error);
          return;
        }

        SLog.log(LogType.Info, "deleteMessage", "id: " + id, result);
        SFirebase.push(FirebaseNode.Messages,
          [
            {key: FirebaseNode.FromUserId, value: fromUserId},
            {key: FirebaseNode.ToUserId, value: toUserId},
          ],
          () => {
            SFirebase.push(FirebaseNode.Messages,
              [
                {key: FirebaseNode.FromUserId, value: toUserId},
                {key: FirebaseNode.ToUserId, value: fromUserId},
              ],
              () => {
                onNext(true);
              });
          });
      });
    });
  }

  public static deleteClassMessage(
    id: number,
    classId: number,
    onNext: (result: boolean) => void
  ) {
    const sql = `UPDATE messages
                 SET is_active = 0
                 WHERE id = ?`;

    SMySQL.getConnection(connection => {
      connection?.execute<any>(sql, [id], (error, result) => {
        if (error) {
          onNext(false);
          SLog.log(LogType.Error, "deleteMessage", "", error);
          return;
        }

        SLog.log(LogType.Info, "deleteMessage", "id: " + id, result);
        SFirebase.push(FirebaseNode.Messages,
          [
            {key: FirebaseNode.ClassId, value: classId},
          ],
          () => {
            onNext(true);
          });
      });
    });
  }

}