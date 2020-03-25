# Schellenberg Api / Smart Friends Api / Enexoma Api

With a lot of work over the last three years I reverse engineered and implemented the Api of the gateway which my parents
use to control their smart home blinds from the german company Schellenberg.

The Api seems to be part of a generic smart home application which uses base types for categorizing controllable smart devices and
wrapping them into a _Compatibility-Config_ which is then send to the displaying App to know which device it should display, which commands are available and much more.

Because of this, with some changes to the _sessionConfig_ being present in the _test.js_ file, the Api should be usable with the Smart Friends Gateway or any Smart Home
Gateway which has software provided by a company named Enexoma (take a look at an unpacked apk or ipa file of the respective App for the cSymbol, the cSymbol Addon and the Api Version).

## Disclaimer
This project was created in my free time whenever I had time to not study for university. It is not finished but should be enough for most task.
Feel free to contribute or use in your project. Please link or name me when you use any of the code. 
Also feel free to ask if anything is unclear or you need help with getting something to work.

## Example
```javascript
const FileSystem = require('fs');
const smart = require('./SchellenbergApi');

let myConfig = {
    debugConfig:{
        debugLog: true
    },
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
        port: '4300', //my port was 430 maybe different, may use portscan
        certificate: FileSystem.readFileSync('./Comunication/CA.pem') //extracted cert from app
    }
};
var example = new smart(myConfig, console.log);

example.on('newDV', (deviceID) => {
    console.log('new DeviceValue for' + JSON.stringify(deviceID));
});

example.on('newDI', (deviceID) => {
    console.log('new DeviceInfo for ' + JSON.stringify(deviceID));
});

```
