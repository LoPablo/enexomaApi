//LoginHelper.js
//--------------------------------------------------
//Copyright 2020 Pascâl Hartmann
//See LICENSE File
//--------------------------------------------------
//Helper class to deal with all kind of hashing and
//salt nonsense the gateway requires to login a
//user
//--------------------------------------------------

const crypt = require('crypto');
const base64 = require('base-64');

class LoginHelper {

    static calculateDigest(password, salt, sessionSalt) {
        const hashedPassword = this.getHash('sha256', password, salt);
        return this.getHash('sha1', hashedPassword, sessionSalt)
    }

    // https://stackoverflow.com/questions/3195865 modified because of javascript handling chars differently
    static string2Bin(str) {
        let result = [];
        for (let i = 0; i < str.length; i++) {
            let p = str.charCodeAt(i);
            if (p > 128) {
                result.push(p - 256);
            } else {
                result.push(p);
            }
        }
        return result;
    }

    static getHash(method, password, salt) {
        let decode = base64.decode(salt);
        let saltArray = this.string2Bin(decode);
        let passwordArray = this.string2Bin(password);
        let pasConSalt = passwordArray.concat(saltArray);
        let cryptHash = crypt.createHash(method).update(new Uint8Array(pasConSalt));
        return cryptHash.digest('base64');
    }
}

module.exports = LoginHelper;

