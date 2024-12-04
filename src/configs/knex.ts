// config/knex.ts
import knex from 'knex';
import * as process from "node:process";
import { addressJson } from '../models/Address';
import { fileJson } from '../models/File';

const db = knex({
    client: 'mysql2',
    connection: {
        host: process.env.MYSQL_HOST || 'localhost',
        user: process.env.MYSQL_USER || 'root',
        password: process.env.MYSQL_PASSWORD || '',
        database: process.env.MYSQL_DATABASE || 'langgomedu',  // Tên cơ sở dữ liệu
    },
});

export default db;

//json model
export const createJsonObject = (fields: any[]):string => {
    return `JSON_OBJECT(
        ${fields
            .map(([key, value]) => `'${key}', ${value}`)
            .join(', ')}
      )
    `;
}

export const createSubquery = (table: string, alias:string , addressAlias: string, evidenceAlias: string) => {
    return db(`${table} as ${alias}`)
    .select(db.raw(`JSON_ARRAYAGG(
    JSON_OBJECT(
      'id', ${alias}.id,
      'name', ${alias}.name,
      'note', ${alias}.note,
      'address', ${addressJson(addressAlias)},
      'evidence', ${fileJson(evidenceAlias)},
      'started_at', ${alias}.started_at,
      'ended_at', ${alias}.ended_at
    )
  )`))
  .leftJoin(`addresses as ${addressAlias}`, `${addressAlias}.id`, `${alias}.address_id`)
  .leftJoin(`files as ${evidenceAlias}`, `${evidenceAlias}.id`, `${alias}.evidence_id`)
  .where(`${alias}.cv_id = cvs.id`);
}

// Lắng nghe sự kiện query 
// cần log ra câu truy vấn để xem thì mở cái đây lên

// db.on('query', (queryData) => {
//   console.log('Executing Query:', queryData.sql); // Log câu truy vấn
//   console.log('Bindings:', queryData.bindings); // Log giá trị binding
// });
