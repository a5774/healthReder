class Tools {
    // random plan 
    templateStirng(scheduleTime) {
        let time = `8:${Math.floor(Math.random() * (6 - 1) + 1)}:${Math.floor(Math.random() * (60 - 1)) + 1}`
        let flag = this.toLocalUnixStampCron(null, time) < scheduleTime
        // console.log(scheduleTime)
        // exist exhausted 
        if (flag) {
            let nextScheduleTime = `${time.split(':').reverse().join('\u0020')} * * *`
            // reduce 
            /*  nextScheduleTime = time.split(':').reduceRight((pre,cur)=>{
                 return pre + '\u0020' + cur
             }) */
            // console.log(nextScheduleTime)
            return { isUsable: flag, nextScheduleTime }
        }
        // recursion 
        // return this.templateStirng()
        return { isUsable: flag, nextScheduleTime: 'null' }
    }
    * TimeParse(scheduleTime) {
        while (true) {
            yield this.templateStirng(scheduleTime)
        }
    }
    // constant plan 
    toLocalUnixStampCron(CronString, TimeString) {
        let time;
        if (CronString) {
            time = CronString.split('*')[0].split('\u0020').reverse().join(':')
        }
        if (TimeString) {
            time = TimeString
        }
        let dateString = new Date().toString().replace(/(\d{2}:\d{2}:\d{2})/g, time)
        console.log(Date.parse(dateString));
        return Date.parse(dateString)
    }
    randomDate(hos, min, sec, mis = 0) {
        let date = new Date()
        return new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1, hos, min, sec,mis)
    }
    randomTime(max,min) {
        // [ 0,1)
        // [max ,min]
        return Math.floor(Math.random() * (max - min ) + min )
    }
}
module.exports = new Tools()