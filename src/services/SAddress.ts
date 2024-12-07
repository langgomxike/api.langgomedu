import db from "../configs/knex";
import Address from "../models/Address";
import SMySQL from "./SMySQL";

export default class SAddress {
  public static async storeAddresses(
    addresses: Address[],
    onNext: (data: any) => void
  ) {
    const dataInsert = addresses.map((item) => {
      return item.toInsertObject();
    });

    await db("addresses")
      .insert(dataInsert)
      .then((result) => {
        const ids: number[] = [];
        const firstId = result[0];
        ids.push(firstId);
        for (let index = 0; index < dataInsert.length; index++) {
          ids.push(firstId + index);
        }
        onNext(ids);
      })
      .catch((err) => {
        console.log("fail to store addresses", err.messages);
        onNext([]);
      });
  }

  public static getAddressByDetail(
    detail: string,
    onNext: (data: any) => void
  ) {
    db("addresses")
      .where("detail", detail)
      .select("*")
      .then((results) => {
        onNext(results);
      })
      .catch((error) => {
        console.log(error);
        onNext([]);
      });
  }

  public static async getAddressId(address: any) {
    return await db("addresses")
      .where({
        province: address.province,
        district: address.district,
        ward: address.ward,
        detail: address.detail,
      })
      .select("id")
      .then((results) => {
        return results[0].id;
      })
      .catch((error) => {
        console.log("fail to getAddressId", error.message);
        return false;
      });
  }

  public static async storeAddress(address: any) {
    return await db("addresses")
      .insert({
        province: address.province,
        district: address.district,
        ward: address.ward,
        detail: address.detail,
      })
      .then((results) => {
        return results[0];
      })
      .catch((error) => {
        console.log("fail to store new Address", error.message);
        return {};
      });
  }
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

  public static updateAddress(
    updateAddress: Address,
    onNext: (result: boolean) => void
  ) {
    let sql = `UPDATE addresses SET province = ? , district = ? , ward = ? , detail = ? WHERE id = ?`;

    SMySQL.getConnection((connection) => {
      if (!connection) {
        console.error("Không thể kết nối database.");
        onNext(false);
        return;
      }

      connection.execute(
        sql,
        [
          updateAddress.province,
          updateAddress.district,
          updateAddress.ward,
          updateAddress.detail,
          updateAddress.id,
        ],
        (err) => {
          if (err) {
            console.log("Cập nhật không thành công");
            onNext(false);
          } else {
            console.log("Cập nhật thành công");
            onNext(true);
          }
        }
      );
    });
  }
}
