const Koa = require('koa')
const fs = require('fs')
const Router = require('koa-router')
const koa_static = require('koa-static')
const koa_bodyparser = require('koa-bodyparser')
let app = new Koa()
let router = new Router({ prefix: "/info" })
app.use(koa_static('./static', { extensions: ['js', 'html'] }))
router.post('/', koa_bodyparser({
    enableTypes: ['json', 'form']
}), async (ctx, next) => {
    // console.log(ctx.request.body);
    if (ctx.request.body.stuCode.length == 9 && ctx.request.body.las6.length == 6) {
        let info_body = ctx.request.body
        Object.assign(info_body,{
            'creTime':`${new Date()}`,
        });
        console.log( info_body);
        let readJSON = JSON.parse(fs.readFileSync('./user.json',{encoding:'utf-8',flag:'r'}))
        let flag = true
        for (const iter of readJSON) {
            if (iter.stuCode == info_body.stuCode) {
                flag = false
            }
        }
        if (flag) {
            readJSON.push(info_body)
            fs.writeFile('./user.json', JSON.stringify(readJSON), 'utf-8', err => {
                if (err) console.log(err);
            })
            ctx.body = '配置已载入'
        } else { 
            ctx.body = '配置已存在' 
        }

    } else {
        ctx.body = "请输入正确的配置信息"
    }
})
router.get('/show',(ctx,next)=>{
    // ctx.respond = false
    ctx.res.setHeader('Content-type',"application/json")
    ctx.body = JSON.parse(fs.readFileSync('./user.json',{encoding:'utf-8',flag:"r+"}))
})
app.use(router.routes())
app.use(router.allowedMethods())
app.listen(9090, '0.0.0.0', () => {
    console.log("Start_prot_9090");
})



/* async (ctx, next) => {
    let url_name = 'http://www.jxusptpay.com/StudentApp/Login/Login/StudentLogin'
    let form_data_Str = `
    ------WebKitFormBoundaryXKP7gHVu9y4rf9ao
Content-Disposition: form-data; name="student"

202005619
------WebKitFormBoundaryXKP7gHVu9y4rf9ao
Content-Disposition: form-data; name="password"

qq3226044217
------WebKitFormBoundaryXKP7gHVu9y4rf9ao
Content-Disposition: form-data; name="appVersion"

23
------WebKitFormBoundaryXKP7gHVu9y4rf9ao
Content-Disposition: form-data; name="appEdition"

2.3.2
------WebKitFormBoundaryXKP7gHVu9y4rf9ao
Content-Disposition: form-data; name="sdk"

29
------WebKitFormBoundaryXKP7gHVu9y4rf9ao
Content-Disposition: form-data; name="manufacturer"

iphone
------WebKitFormBoundaryXKP7gHVu9y4rf9ao
Content-Disposition: form-data; name="mobileModel"

17pro_max_plus_++++
------WebKitFormBoundaryXKP7gHVu9y4rf9ao
Content-Disposition: form-data; name="platform"

2
------WebKitFormBoundaryXKP7gHVu9y4rf9ao--
    `
    let req_name = require('http').request(url_name, {
        method: "POST",
        headers: {
            'Content-Type': 'multipart/form-data; boundary=----WebKitFormBoundaryXKP7gHVu9y4rf9ao'
        },
    },res=>{
        res.setEncoding('utf-8')
        res.addListener('data',data=>{
            console.log( data);
        })
    })

    req_name.write(form_data_Str)
    req_name.end(); */



