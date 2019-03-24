const FileSystem = require('fs');
const smart = require('./SchellenbergApi');
const Events = require('./Helpers/Events');
let myConfig = {
    sessionConfig: {
        username: 'UserGoesHERE',
        password: 'PASSWORDgoesHERE',
        cSymbol: 'D19015', //found in decompiled app
        cSymbolAddon: 'i', //same as above
        shcVersion: '2.14.5', //same
        shApiVersion: '2.13' //^
    },
    smartSocketConfig: {
        host: '10.10.80.150', //ip goes here
        port: '4300', //my port was 430 maybe different, may use portcan
        certificate: FileSystem.readFileSync('./Comunication/CA.pem') //extracted cert from app
    }
};
var test = new smart(myConfig, console.log);


