//HashHelper.ts
//--------------------------------------------------
//Copyright 2020 Pascâl Hartmann
//See LICENSE File
//--------------------------------------------------
//Helper class to deal with all kind of hashing and
//salt nonsense the gateway requires to login a
//user
//--------------------------------------------------

import crypto from "crypto";
import base64 from "base-64"

export default class HashHelper {

    static calculateDigest(password: string, salt: string, sessionSalt: string): string {
        const hashedPassword = this.getHash('sha256', password, salt);
        return this.getHash('sha1', hashedPassword, sessionSalt)
    }

    // https://stackoverflow.com/questions/3195865 modified because of javascript handling chars differently
    static string2Bin(str: string): number[] {
        let result: number[] = [];
        for (let i = 0; i < str.length; i++) {
            let p = str.charCodeAt(i);
            console.log(p)
            if (p > 128) {
                result.push(p - 256);
            } else {
                result.push(p);
            }
        }
        return result;
    }

    static getHash(method: string, password: string, salt: string): string {
        let decode = base64.decode(salt);
        let saltArray = this.string2Bin(decode);
        let passwordArray = this.string2Bin(password);
        let pasConSalt = passwordArray.concat(saltArray)
        let test: Uint8Array = new Uint8Array(pasConSalt);
        let cryptHash = crypto.createHash(method).update(new Uint8Array(pasConSalt));

        return cryptHash.digest('base64');
    }
}


