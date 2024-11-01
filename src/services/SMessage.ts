import Message from "../models/Message";
import SMySQL from "./SMySQL";
import SLog, {LogType} from "./SLog";
import SFirebase from "./SFirebase";
import SResponse, {ResponseStatus} from "./SResponse";

export default class SMessage {
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
}