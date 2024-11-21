import db from "../configs/knex";
import File, { fileJson } from "./File";


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

export const certificateJson = (asName: string): string => {
    return `JSON_OBJECT(
    'id', ${asName}.id,
    'cv', ${asName}.cv_id,
    'name', ${asName}.name,
    'note', ${asName}.note,
    'score', ${asName}.score,
    'valid_at', ${asName}.valid_at,
    'expired_at', ${asName}.expired_at,
    'evidence', ${asName}.evidence_id
)`;
}

export const certificatesSubquery = db('certificates as cer')
  .select(
    db.raw(`
      JSON_ARRAYAGG(
        JSON_OBJECT(
          'id', cer.id,
          'name', cer.name,
          'note', cer.note,
          'score', cer.score,
          'valid_at', cer.valid_at,
          'expired_at', cer.expired_at,
          'evidence', JSON_OBJECT(
            'id', cer_evi.id,
            'name', cer_evi.name,
            'path', cer_evi.path,
            'ratio', cer_evi.ratio,
            'created_at', cer_evi.created_at,
            'updated_at', cer_evi.updated_at
          )
        )
      )
    `)
  )
  .leftJoin('files as cer_evi', 'cer_evi.id', 'cer.evidence_id')
  .whereRaw('cer.cv_id = cvs.id')
  .as('certificatesSubquery');