const FormData = require('form-data');
const http = require('http')
const fs = require('fs')
// const {pswdCipher,pswdDecipher} = require('./crypto/crypto')
let sign_id_url = 'http://www.jxusptpay.com/StudentApp/SignIn/StudentSignin/GetStudentSignIn?a=a'
let check_url = 'http://www.jxusptpay.com/StudentApp/SignIn/StudentSignin/EpidemicSituationSignIn'
let app_Log_url = 'http://www.jxusptpay.com/StudentApp/Login/Login/StudentLogin'
// 无实际用处
// let token_log_url = 'http://www.jxusptpay.com/StudentApp/Login/Login/StudentTokenLogin'
class SignRender {
    constructor(stuCode, passwd) {
        this.stuCode = stuCode
        this.passwd = passwd
        // this.main()
    }
    async getResBody() {
        return new Promise((resolve, rej) => {
            let form_data = new FormData({ maxDataSize: 4096 })
            form_data.append('student', `${this.stuCode}`)
            form_data.append('password', `${this.passwd}`)
            let req = http.request(app_Log_url, {
                method: "POST",
                headers: {
                    "Content-Type": `multipart/form-data; boundary=${form_data.getBoundary()}`
                },
                protocol: "http:"
            }, res => {
                let cookies = []
                res.headers['set-cookie'].forEach(item => {
                    cookies.push(item.split(';')[0])
                })
                res.addListener('data', data => {
                    // def utf-8
                    let json = Object.assign(JSON.parse(data.toString()), {
                        cookies: `${cookies.join(';')}`
                    })
                    resolve(json)
                })
            })
            // form-data promat 
            form_data.pipe(req)
            req.end()
        })
    }
    async getSignID(data) {
        return new Promise((resolve, rej) => {
            let boundary = new FormData()
            let req = http.request(sign_id_url, {
                method: "POST",
                headers: {
                    "Content-Type": `multipart/form-data; boundary=${boundary.getBoundary()}`,
                    "Cookie": `${data.cookies}`
                }
            }, res => {
                res.addListener('data', data => {
                    resolve(JSON.parse(data.toString()))
                })
            })
            boundary.pipe(req)
            req.end()
        })
    }
    async check(data_,signID){
        // console.log( signID.id,signID.itemId);
            let form_data = new FormData({maxDataSize:4096})
            form_data.append("signinId",`${signID.id}`)
            form_data.append("itemId",`${signID.itemId}`)
            let req = http.request(check_url,{
                method:"POST",
                headers:{
                    'Content-type':`multipart/form-data; boundary=${form_data.getBoundary()}`,
                    'Cookie':`${data_.cookies}`
                }
            },res=>{
                res.addListener('data',data=>{
                    fs.createWriteStream('./log/signCheck.log',{
                        flags:"a+",
                        encoding:'utf-8',
                    }).write(`${data_.data.name}-${this.stuCode}-${JSON.parse(data.toString()).msg}:${new Date()}\r\n`,err=>{
                        if (err) console.log(err) 
                    })
                })
            })
            form_data.pipe(req)
            req.end()
    }
    async main(){
        try{
            // if()
            // login get cookie 
            let data = await this.getResBody();
            // console.log(data);
            if (!(data.status ^ 200)){
                // get signID
             let signID = await this.getSignID(data)
            //  console.log(signID);
                if(!(signID.status ^ 200)){
                    // check info 
                   await this.check(data,signID.data)
                }
             }
        }catch(err){
            if(err) console.log(err);
        }
    }
}
let time = '1 0 8 * * *'
// let time = '* * * * * *'
const schedule = require('node-schedule')
const job = schedule.scheduleJob(time,()=>{
    fs.readFile('./user/userMain.json','utf-8',(err,data)=>{
        for (const iter of JSON.parse(data)) {
            // console.log(iter);
            // new SignRender(iter.stuCode,iter.las6)
            new SignRender(iter.stuCode,iter.las6).main()
        } 
       
    })
})
/* console.log( Buffer.from("1315998"));
console.log( Buffer.from("\r\n"));
console.log( Buffer.from("\r")) */
module.exports = { 
    app_login: SignRender,
    login_url: app_Log_url 
}





