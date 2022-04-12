// const fs = require('fs')
const { pbkdf2Sync, randomBytes,createCipheriv, createDecipheriv } = require('crypto')

// genatorter key and vi 
/* let key_ = pbkdf2Sync('root_by_fang','3226044217_paswd',1000,16,'sha256')
let vi_ = pbkdf2Sync('root_by_fang','2022_1019_3614',1000,16,'sha256')
fs.createWriteStream('./key',{encoding:'binary',flags:'w'}).write(key_,err=>{
    if(err) console.log( err);
})
fs.createWriteStream('./vi',{encoding:'binary',flags:'w'}).write(vi_,err=>{
    if(err) console.log(err);
}) */
// read config buffer 
// let key = Buffer.from(fs.readFileSync('./key',{encoding:'binary',flag:'r'}))
// let  vi = fs.readFileSync('./vi',{encoding:'binary',flag:'r'})
// console.log(Buffer.isBuffer(key));
// console.log( key.length,vi.length);

// key vi 写入文件无法完成加解密 err未知


const key = Buffer.from('root_fang_aes128','utf-8')
const vi = Buffer.from('2022_1019_193614','utf-8')
// console.log(key.length,vi.length);
//  alg:aes mode:cbc
function pswdCipher(src, key,vi) {
    let cipher = createCipheriv('aes-128-cbc', key, vi)
    let sign = cipher.update(src, 'utf-8', 'hex')
    return sign += cipher.final('hex')
}

function pswdDecipher(sign, key,vi) {
    let deCipher = createDecipheriv('aes-128-cbc', key, vi)
    let src = deCipher.update(sign, 'hex', 'utf-8')
    return src += deCipher.final('utf-8')
}
/* let a = pswdCipher('admin',key,vi)
console.log(pswdDecipher(a,key,vi)) */
module.exports = { pswdCipher,pswdDecipher,key,vi}
