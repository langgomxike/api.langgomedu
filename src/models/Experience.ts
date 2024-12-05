import db from "../configs/knex";
import Address, { addressJson } from "./Address";
import { fileJson } from "./File";

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

export const experienceJson =(asName: string): string => {
    return `JSON_OBJECT(
    'id', ${asName}.id,
    'cv', ${asName}.cv_id,
    'name', ${asName}.name,
    'note', ${asName}.note,
    'address', ${asName}.address_id,
    'started_at', ${asName}.started_at,
    'ended_at', ${asName}.ended_at,
    'evidence', ${asName}.evidence_id
)`;
}

export const experiencesSubquery = db('experiences as exp')
  .select(
    db.raw(`
      JSON_ARRAYAGG(
        JSON_OBJECT(
          'id', exp.id,
          'name', exp.name,
          'note', exp.note,
          'address', ${addressJson('exp_ad')},
          'started_at', exp.started_at,
          'ended_at', exp.ended_at,
          'evidence', ${fileJson('exp_evi')}
        )
      )
    `)
  )
  .leftJoin('addresses as exp_ad', 'exp_ad.id', 'exp.address_id' )
  .leftJoin('files as exp_evi', 'exp_evi.id', 'exp.evidence_id')
  .whereRaw('exp.cv_id = cvs.id')
  .as('experiencesSubquery');


