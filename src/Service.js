const Koa = require('koa')
const fs = require('fs')
const FormData = require('form-data')
const Router = require('koa-router')
const koa_static = require('koa-static')
const koa_bodyparser = require('koa-bodyparser')
const { app_login, app_Log_url } = require('./signRport')
const jsonFormat = require('json-format')
const done = "配置已载入"
const exist = "配置已存在"
const failed = "校园通验证失败"
let app = new Koa()
let router = new Router({ prefix: "/info" })
let health = async (ctx, next) => {
    // console.log(ctx.request.rawBody);
    ctx['info'] = ctx.request.body
    if (ctx.info.flag) {
        // Inherent format
        if (ctx.info.stuCode.length == 9 && ctx.info.las6.length == 6) {
            Object.assign(ctx.info, {
                'creTime': `${new Date()}`,
            });
            // readFileSync config_file is must value 
            let config_file = JSON.parse(fs.readFileSync('./user/user.json', { encoding: 'utf-8', flag: 'r' }))
            // config is exist 
            if (!config_file.some(itme => itme.stuCode == ctx.info.stuCode)) {
                // push 
                config_file.push(ctx.info)
                // fill
                fs.writeFile('./user/user.json', jsonFormat(config_file), { encoding: 'utf-8', flag: 'w' }, err => {
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
    // rightfull verify 
    let ResBody = await new app_login(ctx.info.stuCode, ctx.info.las6).getResBody()
    if (ResBody.status == 200) {
        Object.assign(ctx.info, {
            "name":`${ResBody.data.name}`,
            'creTime': `${new Date()}`
        });
        let config_file = JSON.parse(fs.readFileSync('./user/userMain.json', { encoding: 'utf-8', flag: 'r' }))
        if (!config_file.some(itme => itme.stuCode == ctx.info.stuCode)) {
            config_file.push(ctx.info)
            fs.writeFile('./user/userMain.json', jsonFormat(config_file), { encoding: 'utf-8', flag: "w" }, err => {
                if (err) console.log(err);
            })
            ctx.body = done
        } else {
            ctx.body = exist
        }

    } else {
        ctx.body = failed
    }
}

app.use(koa_static('./static', { extensions: ['js', 'html'] }))
router.post('/', koa_bodyparser({
    enableTypes: ['json', 'form']
}), health, signCheck)

app.use(router.routes())
app.use(router.allowedMethods())
app.listen(9090, '0.0.0.0', () => {
    console.log("Start_prot_9090");
})
