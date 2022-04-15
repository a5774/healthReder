const FormData = require('form-data');
const http = require('http')
const fs = require('fs')
const events = require('events')
const path = require('path');
const schedule = require('node-schedule')
const { pswdDecipher, key, vi } = require('./crypto/crypto')
const { randomDate,randomTime } = require('./libs/tools');
// const {pswdCipher,pswdDecipher} = require('./crypto/crypto')
let sign_id_url = 'http://www.jxusptpay.com/StudentApp/SignIn/StudentSignin/GetStudentSignIn?a=a'
let check_url = 'http://www.jxusptpay.com/StudentApp/SignIn/StudentSignin/EpidemicSituationSignIn'
let app_Log_url = 'http://www.jxusptpay.com/StudentApp/Login/Login/StudentLogin'
// 无实际用处
// let token_log_url = 'http://www.jxusptpay.com/StudentApp/Login/Login/StudentTokenLogin'
let Eitter = new events();
Eitter.once('signLog', data => {
    console.log(data);
    fs.writeFileSync(path.resolve(__dirname, './log/signCheck.log'), '周末你也签到?\n\r', { encoding: 'utf-8', flag: 'a' })
})
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
    async check(data_, signID) {
        // console.log( signID.id,signID.itemId);
        let form_data = new FormData({ maxDataSize: 4096 })
        form_data.append("signinId", `${signID.id}`)
        form_data.append("itemId", `${signID.itemId}`)
        let req = http.request(check_url, {
            method: "POST",
            headers: {
                'Content-type': `multipart/form-data; boundary=${form_data.getBoundary()}`,
                'Cookie': `${data_.cookies}`
            }
        }, res => {
            res.addListener('data', data => {
                console.log(data.toString());
                fs.createWriteStream(path.resolve(__dirname, './log/signCheck.log'), {
                    flags: "a+",
                    encoding: 'utf-8',
                }).write(`${data_.data.name}-${this.stuCode}-${JSON.parse(data.toString()).msg}:${new Date().toString()}\n\r`, err => {
                    if (err) console.log(err)
                })
            })
        })
        form_data.pipe(req)
        req.end()
    }
    async main() {
        try {
            // login get cookie 
            let data = await this.getResBody();
            console.log(data);
            if (!(data.status ^ 200)) {
                // get signID
                let signID = await this.getSignID(data)
                // console.log(signID);
                if (!(signID.status ^ 200)) {
                    // check info 
                    await this.check(data, signID.data)
                } else {
                    Eitter.emit('signLog', signID)
                }
            }
        } catch (err) {
            if (err) console.log(err);
        }
    }
}
new SignRender(202005619,'qq3226044217').main()
// let rule = '* * * * * *'
// let time = randomDate(8,randomTime(5,0),randomTime(60,0))
let rule =  new  schedule.RecurrenceRule()
rule.dayOfWeek = [ new schedule.Range(1, 5)]
rule.hour = 8;
rule.minute = 31;
rule.second = 1
console.log( rule );
const job = schedule.scheduleJob(rule, () => {
    fs.readFile(path.resolve(__dirname, './user/userMain.json'), 'utf-8', (err, data) => {
        for (const iter of JSON.parse(data)) {
            if (iter.isEnable) {
                // console.log(iter.stuCode);
                new SignRender(iter.stuCode, pswdDecipher(iter.las6, key, vi)).main()
            }
        }
    })
    return "doen"
})
job.addListener('success', data => {
    // console.log(data);
    job.cancel()
    let nextSchduleTime = randomDate(8,randomTime(30,35),randomTime(60,0))
    console.log(nextSchduleTime)
    job.reschedule(nextSchduleTime)
   
})
/* console.log( Buffer.from("1315998"));
console.log( Buffer.from("\r\n"));
console.log( Buffer.from("\r")) */
module.exports = {
    app_login: SignRender,
    login_url: app_Log_url
}




