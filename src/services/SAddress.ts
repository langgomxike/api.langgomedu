import db from "../configs/knex";
import Address from "../models/Address";

export default class SAddress {

    public static async storeAddresses(addresses: Address[] , onNext: (data: any)=> void){
        const dataInsert = addresses.map((item) =>{
            return item.toInsertObject();
        })
        
        await db('addresses').insert(dataInsert)
        .then((result)=> {
            const ids : number[] = [];
            const firstId = result[0];
            ids.push(firstId);
            for (let index = 0; index < dataInsert.length; index++) {
                ids.push(firstId + index);  
            }
            onNext(ids);
        })
        .catch((err)=> {
            console.log("fail to store addresses", err.messages);
            onNext([]);
        })
    }

    public static getAddressByDetail(detail: string, onNext: (data: any)=> void){
        db('addresses').where('detail', detail).select('*')
        .then((results)=> {
            onNext(results);
        })
        .catch((error)=> {
            console.log(error);
            onNext([])
            
        })
    }
    
    public static async getAddressId(address: any){
        return await db('addresses').where({
            province: address.province,
            district: address.district,
            ward: address.ward,
            detail: address.detail,
        }).select('id')
        .then((results)=> {
            return results[0].id;
        })
        .catch((error)=> {
            console.log("fail to getAddressId", error.message);
            return false;
            
        })
    }

    public static async storeAddress(address: any){
        return await db('addresses').insert({
            province: address.province,
            district: address.district,
            ward: address.ward,
            detail: address.detail,
        })
        .then((results)=> {
            return results[0]
        })
        .catch((error)=> {
            console.log("fail to store new Address", error.message);
            return {};
        })
    }

}