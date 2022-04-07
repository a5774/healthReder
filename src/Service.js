const Koa = require('koa')
const fs = require('fs')
const FormData = require('form-data')
const Router = require('koa-router')
const koa_static = require('koa-static')
const koa_bodyparser = require('koa-bodyparser')
const { app_login, app_Log_url } = require('./signRender')
const done = "配置已载入"
const exist = "配置已存在"
const failed = "校园通验证失败"
let app = new Koa()
let router = new Router({ prefix: "/info" })
let health = async (ctx, next) => {
    ctx['info'] = ctx.request.body
    if (ctx.info.flag) {
        if (ctx.info.stuCode.length == 9 && ctx.info.las6.length == 6) {
            Object.assign(ctx.info, {
                'creTime': `${new Date()}`,
            });
            // read
            let readJSON = JSON.parse(fs.readFileSync('./user/user.json', { encoding: 'utf-8', flag: 'r' }))
            let flag = true
            for (const iter of readJSON) {
                if (iter.stuCode == ctx.info.stuCode) {
                    flag = false
                }
            }
            if (flag) {
                // push 
                readJSON.push(ctx.info)
                // fill
                fs.writeFile('./user/user.json', JSON.stringify(readJSON), { encoding: 'utf-8', flag: 'w' }, err => {
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
    let ResBody = await new app_login(ctx.info.stuCode, ctx.info.las6).getResBody()
    if (ResBody.status == 200) {
        Object.assign(ctx.info, {
            'creTime': `${new Date()}`,
        });
        let readJSON = JSON.parse(fs.readFileSync('./user/userMain.json', { encoding: 'utf-8', flag: 'r' }))
        let flag = true
        for (const iter of readJSON) {
            if (iter.stuCode == ctx.info.stuCode) {
                flag = false
            }

        }
        if (flag) {
            readJSON.push(ctx.info)
            fs.writeFile('./user/userMain.json', JSON.stringify(readJSON), { encoding: 'utf-8', flag: "w" }, err => {
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
