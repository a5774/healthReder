//power_by_laofang
const fs = require('fs')
const https = require('https')
const path = require('path')
const { randomDate,randomTime } = require('./libs/tools')
const schedule = require('node-schedule')
const { join } = require('path')
// const {app_login,login_url} = require('./signRport')
let Repurl = 'https://www.jxusptpay.com/SpReportData/reportdata/report'
let Logurl = 'https://www.jxusptpay.com/SpReportData/reportdata/login'
let Verify = 'https://www.jxusptpay.com/SpReportData/reportdata/getVerifyCode'
let Search = 'https://www.jxusptpay.com/SpReportData/reportdata/search'
// let isGetImg = `https://www.jxusptpay.com/SpReportData/img/verifyImg/${Math.floor(Math.random() * 10)}.jpg`
// let isGetImg = `https://www.jxusptpay.com/SpReportData/img/verifyImg/${}.jpg`
class Health {
    constructor(studentCode, lst6) {
        this.studentCode = studentCode
        this.IDNo = lst6
        this.main()
    }
    async reportLog() {
        // Log
        return new Promise((resolve, rej) => {
            let body_req_Log = `studentCode=${this.studentCode}&IDNo=${this.IDNo}`
            // option > url
            let req_Log = https.request(Logurl, {
                method: "POST",
                headers: {
                    "Content-type": 'application/x-www-form-urlencoded;charset=UTF-8'
                },
                protocol: 'https:',
            }, (res) => {
                res.setEncoding('utf-8')
                res.on('data', data => {
                    // console.log(res.headers['set-cookie']);
                    // Session cookie
                    let jsession = res.headers['set-cookie'].pop().split(';').shift()
                    resolve(Object.assign(JSON.parse(data), {
                        "JSESSION": jsession
                    }))
                })
                // 压根没有cookie_token验证
                // console.log(res.headers['set-cookie']);
            })
            req_Log.write(body_req_Log)
            // if use 'GET then auto_end_close_request 
            req_Log.end()
            req_Log.on('error', () => {
                console.log("req_Log_error");
            })
        })
    }
    async getVerify(Session) {
        return new Promise((resolve, rej) => {
            let verify_req = https.get(Verify, {
                headers: {
                    "Cookie": `studentCode=${this.studentCode};IDNo=${this.IDNo};${Session}`
                }
            }, res => {
                res.addListener('data', data => {
                    // verifyCode
                    resolve(JSON.parse(data))
                })
            })
            // same Session Cookie get verifyCode
            // verify_req.setHeader('Cookie',[`studentCode=${this.studentCode}`,`IDNo=${this.IDNo}`,Session])
            // console.log(verify_req.getHeader('Cookie'));
            // auto close 
            // verify_req.end()

        })
    }
    async search() {
        let info = 'date=2022-04-13&studentCode=202005619'
        let req = https.request(Search, {
            method: "POST",
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
            }
        }, res => {
            res.addListener('data', data => {
                // console.log( data );
                // console.log(JSON.parse(data));
            })
        })
        req.write(info)
        req.end()
    }
    async Report(data, Session, verifyCode) {
        // Rep
        let JSON_Info = {
            "studentCode": `${data.studentCode}`,
            "classNo": `${data.classNo}`,
            "departmentCode": `${data.departmentCode}`,
            "depName": `${data.depName}`,
            "acaID": `${data.acaID}`,
            "bodystatus": `${data?.bodystatus ?? '正常'}`,
            "animalHeat": data.animalHeat,
            "address": `${data.address ?? ''}`,
            "isContactHubeiBack": data.isContactPatient,
            "isContactPatient": data.isContactHubeiBack,
            "othercase": `${data.othercase}`,
            "verifyCode": `${verifyCode}`,
            "reporttime": `${data.opttime?.split(' ')[0] ?? new Date().toString().split('T')[0]}`,
            "morTem": data.morTem,
            "illsymptom": data.illsymptom,
            "quarantine": data.quarantine,
            "quarantinePlace": data.quarantinePlace,
            "outStartTime": data.outStartTime,
            "outEndTime": data.outEndTime,
            "vehicle": data.vehicle,
            "trainNumAndseatNum": data.trainNumAndseatNum
        }
        let body_req_Rep = JSON.stringify(JSON_Info)
        // console.log(JSON_Info)
        // if url is string then use nwe URL parse 
        // url,option meanwhile revicer then option frist
        let req_Rep = https.request(Repurl, {
            method: 'POST',
            headers: {
                'Content-type': 'application/json',
                // 'Cookie': `studentCode=${this.studentCode};IDNo=${this.IDNo};${Session}`
            },
            protocol: 'https:'
        }, res => {
            res.setEncoding('utf-8')
            res.on('data', (data_) => {
                // console.log(data_);
                let config_main = JSON.parse(fs.readFileSync(path.resolve(__dirname, './user/userMain.json'), { encoding: 'utf-8', flag: "r" }))
                let user = config_main.find(self => {
                    return self.stuCode == this.studentCode
                })
                // for the same file write but not wait for callback is no safe 
                // use Stream
                fs.createWriteStream(path.resolve(__dirname, './log/healthSub.log'), {
                    flags: "a+",
                    encoding: 'utf-8',
                }).write(`${user ? user.name : '某个不透露名字的小伙子'}-${this.studentCode}-${JSON.parse(data_.toString()).msg}-${new Date().toString()}\n\r`, err => {
                    if (err) console.log(err)
                })
            })
        })
        // req_Rep.getHeader('Cookie')
        // same Session Cookie Report with verifyCode
        req_Rep.setHeader('Cookie', [`studentCode=${this.studentCode}`, `IDNo=${this.IDNo}`, `${Session}`])
        // console.log( req_Rep.getHeader('Cookie') );
        req_Rep.write(body_req_Rep)
        req_Rep.end()
        req_Rep.on('error', () => {
            console.log("req_Rep_error");
        })

    }
    async main() {
        try {
            // this.search()
            let healthInfo = await this.reportLog()
            if (healthInfo?.status == 200) {
                let verifyCode = await this.getVerify(healthInfo.JSESSION)
                // console.log( verifyCode.data,healthInfo.JSESSION);
                this.Report(healthInfo.data, healthInfo.JSESSION, verifyCode.data)
            } else {
                throw new Error("Login_faild_check_info_is_right")
            }
        } catch (err) {
            console.log(err);
        }
    }

}
// time 
// let time = '* * * * * *'
// let time = '1 5 8 * * *'
let time = randomDate(8,randomTime(5,0),randomTime(60,0))
// console.log( time );
const job = schedule.scheduleJob(time, (currentTime) => {
    fs.readFile(path.resolve(__dirname, './user/user.json'), 'utf-8', (err, data) => {
        for (const iter of JSON.parse(data)) {
            if (iter.isEnable) {
                // console.log(iter.stuCode);
                new Health(iter.stuCode, iter.las6)
            }
        }
    })
    // Number:valueof 
    return currentTime[Symbol.toPrimitive]('number')
})
// next schedule
// console.log(job.nextInvocation() );
job.addListener('success', data => {
    // data is schedule callback  return value 
    // if success then cancel crrent schedule
    job.cancel()
    let nextSchduleTime = randomDate(8,randomTime(5,0),randomTime(60,0))
    job.reschedule(nextSchduleTime)
    // plan random
   /*  for (const Time of tools.TimeParse(data)) {
            // console.log(Time);
            if(Time.isUsable){
                // restart schedule with new time
                console.log(job.reschedule(Time.nextScheduleTime));//true
                break;
            }
    }
 */
    // constant plan 
    /* let Times = require('./constant/constantTime.json')
    let time = Reflect.get(Times,Math.floor(Math.random() * (Times.length)))
    Health.prototype.toLocalUnixStampCron(time,null)  */

    
})

// 使用require将无法实时读写
/*  for (const iter of require('./user.json')) {
     console.log(iter);
     // new Health(iter.stuCode,iter.las6)
 }  */


/*  function jumpCheck(){
        for(let i = 0;i<10;i++){
            https.get(`https://www.jxusptpay.com/SpReportData/img/verifyImg/${i}.jpg`,res=>{
                res.addListener('data',data=>{
                    fs.writeFileSync(`./file/${i}.jpg`,data,err=>{
                        if(err)
                        console.log( err);
                    })
                })
            })
        }
    }
    
    // jumpCheck()

 */

/* require('http').IncomingMessage
require('http').Server
require('http').OutgoingMessage
require('http').ClientRequest
require('http').ServerResponse  
*/

