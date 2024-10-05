
export default class MessageType {
    public id: number;
    public type: string;

    constructor(id = -1, type = "") {
        this.id = id;
        this.type = type;
    }
}