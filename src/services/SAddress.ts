import SMySQL from "./SMySQL";

export default class SAddress {
  public static createAddress(
    province: string,
    district: string,
    ward: string,
    detail: string,
    onNext: (result: boolean, addressId?: number) => void
  ) {
    const sql = `
          INSERT INTO addresses (province, district, ward, detail) 
          VALUES (?, ?, ?, ?)
        `;

    SMySQL.getConnection((connection) => {
      if (!connection) {
        console.error("Không thể kết nối database.");
        onNext(false);
        return;
      }

      connection.execute(
        sql,
        [province, district, ward, detail],
        (err, result) => {
          if (err) {
            console.error("Lỗi khi thêm địa chỉ:", err);
            onNext(false);
          } else {
            const addressId = (result as any).insertId;
            onNext(true, addressId);
          }
        }
      );
    });
  }
}
