import Message from "../models/Message";
import SMySQL from "./SMySQL";
import SLog, {LogType} from "./SLog";
import SFirebase from "./SFirebase";
import Inbox from "../models/Inbox";
import SUser from "./SUser";

export default class SMessage {

    public static getInboxes(userId: string, onNext: (inboxes: Inbox[]) => void) {
        const sql = `SELECT messages.*,
                            JSON_OBJECT(
                                    'id', from_users.id,
                                    'full_name', from_users.full_name,
                                    'email', from_users.email,
                                    'phone_number', from_users.phone_number,
                                    'avatar', JSON_OBJECT(
                                            'id', from_user_avatars.id,
                                            'name', from_user_avatars.name,
                                            'path', from_user_avatars.path,
                                            'image_width', from_user_avatars.image_with,
                                            'image_height', from_user_avatars.image_height
                                              )
                            ) AS from_user,
                            JSON_OBJECT(
                                    'id', to_users.id,
                                    'full_name', to_users.full_name,
                                    'email', from_users.email,
                                    'phone_number', from_users.phone_number,
                                    'avatar', JSON_OBJECT(
                                            'id', to_user_avatars.id,
                                            'name', to_user_avatars.name,
                                            'path', to_user_avatars.path,
                                            'image_width', to_user_avatars.image_with,
                                            'image_height', to_user_avatars.image_height
                                              )
                            ) AS to_user
                     FROM messages
                              LEFT JOIN users from_users ON messages.from_user_id = from_users.id
                              LEFT JOIN users to_users ON messages.to_user_id = to_users.id
                              LEFT JOIN files from_user_avatars ON from_user_avatars.id = from_users.avatar_id
                              LEFT JOIN files to_user_avatars ON to_user_avatars.id = to_users.avatar_id
                     WHERE from_user_status + to_user_status > 0
                     ORDER BY messages.created_at DESC`;
        const inboxes: Inbox[] = [];

        SMySQL.getConnection(connection => {
            connection?.execute<any[]>(sql, (error, result) => {
                if (error) {
                    onNext([]);
                    SLog.log(LogType.Error, "getAllMessages", "", error);
                    return;
                }

                // SLog.log(LogType.Info, "getAllMessages", "sql result", result);

                const messages: Message[] = result;

                messages.forEach(message => {
                    if (message.from_user?.id === userId) {
                        const user = message.to_user;
                        const inbox = new Inbox(user, message);
                        inboxes.push(inbox);
                    } else if (message.to_user?.id === userId) {
                        const user = message.from_user;
                        const inbox = new Inbox(user, message);
                        inboxes.push(inbox);
                    }
                });

                //remove the same user
                for (let i = 1; i < inboxes.length ; i++) {
                    for (let j = 0; j < i; j++) {
                        if (inboxes[j]?.user.id === inboxes[i]?.user.id) {
                            inboxes.splice(j, 1);
                            j--;
                        }
                    }
                }

                onNext(inboxes);
                SLog.log(LogType.Info, "getAllMessages", "get all messages successfully", messages.length);
            });
        });
    }

    public static storeMessage(message: Message, onNext: (result: boolean) => void) {
        const sql = "INSERT INTO messages (`from_user_id`, `to_user_id`, `content`, `created_at`) VALUES (?,?,?,?)";

        SMySQL.getConnection(connection => {
            connection?.execute(sql, [
                message.from_user?.id,
                message.to_user?.id,
                message.content,
                new Date().getTime()
            ], (error, result) => {
                if (error) {
                    onNext(false);
                    SLog.log(LogType.Error, "storeMessage", "storeMessage unsuccessfully", error);
                    return;
                }

                // push message into firebase
                SFirebase.pushMessage(message.from_user?.id, message.to_user?.id,
                    () => {
                        SLog.log(LogType.Info, "storeMessage successfully");
                        onNext(true);
                    });
            });
        })
    }

    public static deleteMessage(id: number, fromUserStatus: boolean, toUserStatus: boolean, onNext: (result: boolean) => void) {
        const sql = "UPDATE messages SET from_user_status =?, to_user_status =? WHERE id =?";

        SMySQL.getConnection(connection => {
            connection?.execute(sql, [
                fromUserStatus? 1 : 0,
                toUserStatus? 1 : 0,
                id
            ], (error, result) => {
                if (error) {
                    onNext(false);
                    SLog.log(LogType.Error, "deleteMessage", "deleteMessage unsuccessfully", error);
                    return;
                }

                onNext(true);
                SLog.log(LogType.Info, "deleteMessage successfully");
            });
        });
    }
}