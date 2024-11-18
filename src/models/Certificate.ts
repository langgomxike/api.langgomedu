import File from "./File";


export default class Certificate {
    public id: number;
    public name: string;
    public note: string;
    public score: string;
    public valid_at: number;
    public expired_at: number;
    public evidence: File | undefined;

    constructor(id = -1, name = "", note = "", score = "", valid_at = 0, expired_at = 0, evidence : File | undefined = undefined) {
        this.id = id
        this.name = name
        this.note = note
        this.score = score
        this.valid_at = valid_at
        this.expired_at = expired_at
        this.evidence = evidence
    }
}