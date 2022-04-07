const fs = require('fs')
const {randomBytes,createCipheriv, createDecipheriv } = require('crypto')
// genatorter key and vi 
/* let key = randomBytes(32)
let vi = randomBytes(16)
fs.createWriteStream('./key',{encoding:'binary'}).write(key)
fs.createWriteStream('/.vi',{encoding:'binary'}).write(vi) */
// read config 
fs.readFileSync('./key',{encoding:'binary',flag:'r+'})
fs.readFileSync('./vi',{encoding:'binary',flag:'r+'})
// alg:aes mode:cbc
function pswdCipher(src, key,vi) {
    let cipher = createCipheriv('aes-256-cbc', key, vi)
    let sign = cipher.update(src, 'utf-8', 'hex')
    return sign += cipher.final('hex')
}

function pswdDecipher(sign, key,vi) {
    let deCipher = createDecipheriv('aes-256-cbc', key, vi)
    let src = deCipher.update(sign, 'hex', 'utf-8')
    return src += deCipher.final('utf-8')
}
module.exports = { pswdCipher,pswdDecipher}
