import db from "../configs/knex";
import Address, { addressJson } from "./Address";
import { fileJson } from "./File";
import User from "./User";

export default class Education {
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

export const educationJson =(asName: string): string => {
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

export const educationsSubquery = db('educations as edu')
  .select(
    db.raw(`
      JSON_ARRAYAGG(
        JSON_OBJECT(
          'id', edu.id,
          'name', edu.name,
          'note', edu.note,
          'address', ${addressJson('edu_ad')},
          'started_at', edu.started_at,
          'ended_at', edu.ended_at,
          'evidence', ${fileJson('edu_evi')}
        )
      )
    `)
  )
  .leftJoin('addresses as edu_ad', 'edu_ad.id', 'edu.address_id' )
  .leftJoin('files as edu_evi', 'edu_evi.id', 'edu.evidence_id')
  .whereRaw('edu.cv_id = cvs.id')
  .as('educationsSubquery');



  