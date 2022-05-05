const Koa = require('koa')
const fs = require('fs')
const FormData = require('form-data')
const Router = require('koa-router')
const koa_static = require('koa-static')
const koa_bodyparser = require('koa-bodyparser')
const { app_login, app_Log_url } = require('./signRport')
const path = require('path')
const jsonFormat = require('json-format')
const { pswdCipher, key, vi } = require('./crypto/crypto')
const { DONE, EXIST, FAILED } = require('./constant/verifyConstant')

let app = new Koa()
let router = new Router({ prefix: "/info" })
let verify = async (ctx, next) => {
    // rightfull verify 
    let ResBody = await new app_login(ctx.info.stuCode, ctx.info.las6).getResBody()
    if (ResBody.status == 200) {
        Object.assign(ctx.info, {
            "name": `${ResBody.data.name}`,
            'creTime': `${new Date().toString()}`
        });
    } else {
        ctx.body = FAILED
    }
    await next()
}
let aes_128_cbc_crypto = async (ctx, next) => {
    ctx.info.las6 = pswdCipher(ctx['info'].las6, key, vi)
    // console.log(ctx.info);
    await next()
}
let health = async (ctx, next) => {
    // console.log(ctx.request.rawBody);
    // embed
    ctx['info'] = ctx.request.body
    if (ctx.info.flag) {
        // Inherent format
        if (ctx.info.stuCode.length == 9 && ctx.info.las6.length == 6) {
            Object.assign(ctx.info, {
                'creTime': `${new Date().toString()}`,
            });
            // readFileSync config_file is must value 
            let config_file = JSON.parse(fs.readFileSync(path.resolve(__dirname, './user/user.json'), { encoding: 'utf-8', flag: 'r' }))
            // config is exist 
            if (!config_file.some(itme => itme.stuCode == ctx.info.stuCode)) {
                // push 
                config_file.push(ctx.info)
                // fill
                fs.writeFile(path.resolve(__dirname, './user/user.json'), jsonFormat(config_file), { encoding: 'utf-8', flag: 'w' }, err => {
                    if (err) console.log(err);
                })
                ctx.body = DONE
            } else {
                ctx.body = EXIST
            }

        } else {
            ctx.body = FAILED
        }
    } else {
        await next()
    }
}
let signCheck = async (ctx, next) => {
    let config_file = JSON.parse(fs.readFileSync(path.resolve(__dirname, './user/userMain.json'), { encoding: 'utf-8', flag: 'r' }))
    if (!config_file.some(itme => itme.stuCode == ctx.info.stuCode)) {
        config_file.push(ctx.info)
        fs.writeFile(path.resolve(__dirname, './user/userMain.json'), jsonFormat(config_file), { encoding: 'utf-8', flag: "w" }, err => {
            if (err) console.log(err);
        })
        ctx.body = DONE
    } else {
        ctx.body = EXIST
    }
    // 匹配next全局路由
    await next()
}
// koa.use Only one middleware can be loaded
app.use(koa_static('./static', { extensions: ['js', 'html'] }))
router.post('/', koa_bodyparser({
    enableTypes: ['json', 'form']
}), health, verify, aes_128_cbc_crypto, signCheck)

app.use(router.routes())
app.use(router.allowedMethods())


let Notfound = new Router()
// 以路由实例位置匹配
Notfound.all(/[\s\S]*/, async (ctx, next) => {
    ctx.req.on('end',()=>{
        console.log('end')
    })
    console.log("notfound");
    ctx.attachment('notfoundfile', {
        type: 'inline',
        fallback: true
    })
    ctx.type = 'text/html'
    // 处理完成所有middleware后执行handlerResponse()req.write()触发req.end()
    // return fnMiddleware(ctx).then(handleResponse).catch(onerror);
    // 多个ctx.body将被覆盖
    ctx.body =  fs.createReadStream('./static/NotFound.html')
})
app.use(Notfound.routes())
app.listen(9090, '0.0.0.0', () => {
    console.log("Start_prot_9090");
})


