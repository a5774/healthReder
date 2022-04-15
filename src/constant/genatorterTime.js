const fs = require('fs')
class GenatorterTime {
    templateStirng(scheduleTime) {
        let time = `8:${Math.floor(Math.random() * 10)}:${Math.floor(Math.random() * 60)}`
        let nextScheduleTime = new Date().toString().replace(/(\d{2}:\d{2}:\d{2})/g, time)
            return nextScheduleTime = `${time.split(':').reverse().join('\u0020')} * * *`


    }
    * TimeParse(scheduleTime) {
        while (true) {
            yield this.templateStirng()
        }
    }
}
let flag = 0
let Ary = []
for (const Time of GenatorterTime.prototype.TimeParse()) {
        if(flag > 10000){
            break;
        }
        Ary.push(Time)
        flag++
}
let Times =  Array.from(new Set(Ary))
fs.createWriteStream('./constantTime.json').write(JSON.stringify(Times))