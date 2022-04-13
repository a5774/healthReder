const Koa = require('koa')
const fs = require('fs')
const FormData = require('form-data')
const Router = require('koa-router')
const koa_static = require('koa-static')
const koa_bodyparser = require('koa-bodyparser')
const { app_login, app_Log_url } = require('./signRport')
const path = require('path')
const jsonFormat = require('json-format')
const { pswdCipher, pswdDecipher, key, vi } = require('./crypto/crypto')
const done = "配置已载入"
const exist = "配置已存在"
const failed = "校园通验证失败"
let app = new Koa()
let router = new Router({ prefix: "/info" })
let verify = async (ctx, next) => {
    // embed
    ctx['info'] = ctx.request.body
    // rightfull verify 
    let ResBody = await new app_login(ctx.info.stuCode, ctx.info.las6).getResBody()
    if (ResBody.status == 200) {
        Object.assign(ctx.info, {
            "name": `${ResBody.data.name}`,
            'creTime': `${new Date().toJSON()}`
        });
    } else {
        ctx.body = failed
    }
    await next()
}
let aes_128_cbc_crypto = async (ctx, next) => {
    ctx.info.las6 = pswdCipher(ctx['info'].las6, key, vi)
    console.log(ctx.info);
    await next()
}
let health = async (ctx, next) => {
    // console.log(ctx.request.rawBody);
    if (ctx.info.flag) {
        // Inherent format
        if (ctx.info.stuCode.length == 9 && ctx.info.las6.length == 6) {
            Object.assign(ctx.info, {
                'creTime': `${new Date().toJSON()}`,
            });
            // readFileSync config_file is must value 
            let config_file = JSON.parse(fs.readFileSync(path, { encoding: 'utf-8', flag: 'r' }))
            // config is exist 
            if (!config_file.some(itme => itme.stuCode == ctx.info.stuCode)) {
                // push 
                config_file.push(ctx.info)
                // fill
                fs.writeFile(path.resolve(__dirname, './user/user.json'), jsonFormat(config_file), { encoding: 'utf-8', flag: 'w' }, err => {
                    if (err) console.log(err);
                })
                ctx.body = done
            } else {
                ctx.body = exist
            }

        } else {
            ctx.body = failed
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
        ctx.body = done
    } else {
        ctx.body = exist
    }
}


app.use(koa_static('./static', { extensions: ['js', 'html'] }))
router.post('/', koa_bodyparser({
    enableTypes: ['json', 'form']
}), verify, aes_128_cbc_crypto, health, signCheck)

app.use(router.routes())
app.use(router.allowedMethods())
app.listen(9090, '0.0.0.0', () => {
    console.log("Start_prot_9090");
})

