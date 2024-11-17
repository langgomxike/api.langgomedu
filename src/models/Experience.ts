import Address from "./Address";

export default class Experience {
    public id: number;
    public name: string;
    public note: string;
    public address: Address | undefined;
    public started_at: number;
    public ended_at: number;
    public evidence: File | undefined;

    constructor(id = -1, name = "", note = "", address: Address | undefined = undefined, started_at = 0, ended_at = 0, evidence : File | undefined = undefined) {
        this.id = id
        this.name = name
        this.note = note
        this.address = address
        this.started_at = started_at
        this.ended_at = ended_at
        this.evidence = evidence
    }
}