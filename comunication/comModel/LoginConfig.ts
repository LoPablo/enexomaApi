export default class LoginConfig {

    ipAddress : string;
    port : number;
    caPath: string;
    username : string;
    password : string;
    cSymbol : string;
    shcVersion : string;
    shApiVersion : string;

    public constructor(ipAddress : string, username : string, password : string, cSymbol : string, port? : number, caPath? : string, shcVersion? : string, shApiVersion? : string) {
       this.ipAddress = ipAddress;
       this.username = username;
       this.password = password;
       this.cSymbol = cSymbol;
       if (port){
           this.port = port;
       } else {
           this.port = 4300;
       }
       if (caPath){
           this.caPath = caPath;
       } else {
           this.caPath = './comunication/CA.pem';
       }
       if (shcVersion){
           this.shcVersion = shcVersion;
       } else {
           this.shcVersion = '2.13'
       }
       if (shApiVersion){
           this.shApiVersion = shApiVersion;
       } else {
           this.shApiVersion = '2.13';
       }
    }

    static fromJSONString(json: string): LoginConfig {
        let jsonObject = JSON.parse(json);
        return this.fromObject(jsonObject);
    }

    static fromObject(object: any): LoginConfig {
        return new LoginConfig(
            object.ipAddress,
            object.username,
            object.password,
            object.cSymbol,
            object.port,
            object.caPath,
            object.shcVersion,
            object.shApiVersion
        )
    }

    public toString() : string {
        return JSON.stringify(this);
    }
}