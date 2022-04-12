//power_by_laofang
// const dotenv = require('dotenv')
// dotenv.config()
const fs = require('fs')
const https = require('https')
const path = require('path')
let Repurl = 'https://www.jxusptpay.com/SpReportData/reportdata/report'
let Logurl = 'https://www.jxusptpay.com/SpReportData/reportdata/login' 
class Health {
    constructor(studentCode, lst6) {
        this.studentCode = studentCode
        this.IDNo = lst6
        this.main()
    }
    async Log() {
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
                    console.log(JSON.parse(data));
                    resolve(JSON.parse(data))
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
    async Rep(data) {
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
            "reporttime": `${data.opttime?.split(' ')[0] ?? new Date().toJSON().split('T')[0]}`,
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
        console.log(JSON_Info)
        let req_Rep = https.request(Repurl, {
            method: 'POST',
            headers: {
                'Content-type': 'application/json',
                // 'Cookie': 'studentCode=202005619; IDNo=193614; JSESSIONID=87BD1CF55D3F607539C729A3663584C0; STUDENTCODE_COOKIE_DATA=112ebe2aab03e9fd300ce7c6aa03d24e; STUDENTCODE_COOKIE=202005619; studentCode=202005619; STUDENT_LOGIN_TOKEN=3c704247818234376b7dc34c18be5a7512d9d4ae946fe995a1efc3e0931ac3d059642a8f9018f3d81b8c6230d1ff0969b5961b8ee1eb283c14e94f235dc0bf1f530d9555af9b5ab78ead774a6e9fb7ce; STUDENT_LOGIN_TOKEN_OLD=3c704247818234376b7dc34c18be5a7512d9d4ae946fe995a1efc3e0931ac3d059642a8f9018f3d81b8c6230d1ff0969b5961b8ee1eb283c14e94f235dc0bf1f530d9555af9b5ab78ead774a6e9fb7ce'
            },
            protocol: 'https:'
        }, res => {
            res.setEncoding('utf-8')
            res.on('data', (data_) => {
                let config_main = JSON.parse(fs.readFileSync(path.resolve(__dirname,'./user/userMain.json'), { encoding: 'utf-8', flag: "r" }))
                let user = config_main.find(self=>{
                    return self.stuCode == this.studentCode
                })
                // for the same file write but not wait for callback is no safe 
                // use Stream
                fs.createWriteStream(path.resolve(__dirname,'./log/healthSub.log'), {
                    flags: "a+",
                    encoding: 'utf-8',
                }).write(`${ user ? user.name : '某个不透露名字的小伙子'}-${this.studentCode}-${JSON.parse(data_.toString()).msg}-${new Date().toJSON()}\n\r`, err => {
                    if (err) console.log(err)
                })
            })
        })
        req_Rep.write(body_req_Rep)
        req_Rep.end()
        req_Rep.on('error', () => {
            console.log("req_Rep_error");
        })

    }
    async main() {
        try {
            let healthInfo = await this.Log()
            if (healthInfo.status == 200) {
                await this.Rep(healthInfo.data)
            } else {
                throw new Error("Login_faild_check_info_is_right")
            }
        } catch (err) {
            console.log(err);
        }
    }
}
// time 
// ervey day for 8am 
 let time = '1 0 8 * * *'
//let time = '* * * * * *'
const schedule = require('node-schedule')
const job = schedule.scheduleJob(time, () => {
    fs.readFile(path.resolve(__dirname,'./user/user.json'), 'utf-8', (err, data) => {
        for (const iter of JSON.parse(data)) {
            // console.log(iter);
            new Health(iter.stuCode, iter.las6)
        }

    })
    // 使用require将无法实时读写
    /*  for (const iter of require('./user.json')) {
         console.log(iter);
         // new Health(iter.stuCode,iter.las6)
     }  */
})




