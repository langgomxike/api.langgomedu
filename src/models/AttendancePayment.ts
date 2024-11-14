
export default class AttendancePayment {
    public id: number;
    public paid: boolean;
    public confirmed_by_tutor: boolean;
    public payment_path: string;
    public paid_at: number;


    constructor(id = -1, 
        paid = false,
        confirmed_by_tutor = false,
        payment_path = "",
        paid_at = new Date().getTime(),
    ) {
        this.id = id;
        this.paid = paid;
        this.confirmed_by_tutor = confirmed_by_tutor;
        this.payment_path = payment_path;
        this.paid_at = paid_at;
    }
}