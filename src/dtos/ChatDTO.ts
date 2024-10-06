import { DTO } from "./DTO";
import Chat from "../models/Chat";
import User from "../models/User";
import Message from "../models/Message";

export default class ChatDTO implements DTO {
    //properties
    public user: User | undefined;
    public newestMessage: Message | undefined;

    //constructor
    constructor( user: User|undefined = undefined, newestMessage: Message|undefined = undefined){
        this.user = user;
        this.newestMessage = newestMessage;
    }
    //methods
    public fromModel(chat: Chat) {
        if(chat){
            return new ChatDTO(
                chat.user instanceof User ? chat.user : undefined,
                chat.newestMessage instanceof Message ? chat.newestMessage : undefined
            )
        }
    }
}