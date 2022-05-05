const http = require('http')
let count = 30000
let time = 15.0;

function main(){
    count--
    let req = http.request('http://jxstnutd.com:9013/solution/submit/1003',{
    method:'POST',
    headers:{
        'Content-Type':'application/x-www-form-urlencoded'
    }
},res=>{
    res.addListener('data',data=>{
        console.log(data.toString());
        console.log('done'+count);
    })
})
req.setHeader('Cookie',' _oj_bs=2032010427|0|0;__RequestVerificationToken=yIWlvKaAdNFFW6E4mwCSBkL1dbO0I8uHSfmIk_Dy6J_F963BQH07MudGC5uhuspC5s2BgYyNQB3_zYSj4FIAKS073OZgaOfmNONeqIUmO2g1; _oj_=B79271985073E7CA8F8C6452F5D8FF186E8E3D770519E2A45748EAD351C723BC165843F3146C5885CABDFD211EE0737C27945FDE73DB5677F1F9FA1272F53B27B55ED8799F589B4F4CD21A01523FC63CC6C8E6B0063BFF3AB2C2B75157ACF6A7CFEA3EC7DC34C98BC2219944B47E1603')
req.write(`__RequestVerificationToken=ix5oWgSVYpbPkNeiKTju7jiwrzQBeawEodX3LJuLdmT6rYAoUESBYc0XvZYhYXjWFnB6tMde_ArF81EgMScthuU0kWtvDVOBO2HrgrPk5J81&lang=0&sourcecode=%23include%3Cstdio.h%3E%0D%0Avoid+main%28%29%0D%0A%7B%0D%0A++++printf%28%22hello+world%22%29%3B%0D%0A%7D&code=%23include%3Cstdio.h%3E+%0D%0Avoid+main%28%29%0D%0A%7B%0D%0A++++printf%28%22hello+world%22%29%3B%0D%0A%7D&time=${time}`)
req.end()
if(count == 0){
    clearInterval(id_)
}
}
// main()
let id_ = setInterval(main,12000)

