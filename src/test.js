async function a(){
    setTimeout(()=>{
        console.log('A');
    },1000)
}
async function b(){
    setTimeout(()=>{
        console.log('B');
        
    },2000)
    
}
async function c(){
    return new Promise((res,rej)=>{
        setTimeout(()=>{
        res("ssss")
        
        },5000)
    })
   

}
async function st (){
    // await只有在处理异步promise时才会阻塞后续操作,后续操作才处于异步
    console.log(  await c());//frist
    // await b()
    // await a()
    
    console.log("sss");//last
}
st()