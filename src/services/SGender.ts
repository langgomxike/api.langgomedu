import Gender from "../models/Gender";
import SMySQL from "./SMySQL";

export default class SGender {
    public static getAllGenders(onNext: (genders: Gender[]) => void){
        const sql = `SELECT * FROM genders`;
        SMySQL.getConnection((connection) => {
            connection?.execute<any>(sql, (error, results) => {
              if (error) {
                onNext([]);
                console.log("getUserById", "", error);
                return;
              } else {
                onNext(results);
              }
            });
          });
    }
}