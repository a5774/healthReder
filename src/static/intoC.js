var timer = function () {
    var preInput = "";
    var id = setInterval(frame, 10);

    
    var userInput = document.getElementById("user-input");
    ////var start = document.getElementById("start");
    var source = document.getElementById("game").innerHTML;
    var temp = document.createElement("div");
    temp.innerHTML = source;
    var str = temp.innerText || temp.textContent;
    temp = null;
    var re = new RegExp(" |\t", "g");
    str = str.replace(re, "");//����ȥ���ո�
   //  str = str.replace(/\s+/g, "");
   // str = str.replace(/[\r\n]/g, "");//ȥ����ȥ�س���
    var arr = str.split("");

      var time = 0;

    function frame() {
      
        //var minput = document.getElementsByClassName("CodeMirror-code");
        //var mmInput = minput[0].innerText;//���ڻ�ȡcodemirror�İ취
       var re1 = new RegExp(" |\t", "g");//ȥ�ո���Ʊ���������
        //mmInput = mmInput.replace(re1, "");//ȥ�ո�
       // mmInput = mmInput.replace(/[\r\n]/g, "");//ȥ����ȥ�س���       
       // mmInput = mmInput.replace(/\s+/g, "");
                      
        var mmInput = highlightor.getValue().replace(re1, "");

        if (preInput.length < mmInput.length - 4 ) {
          
        }
        preInput = mmInput;
        userInput.value = mmInput;
        userText = mmInput.split("", -1);
        
       

        // Check if user input matches passage
        var prosT = document.getElementById("progress-bar");
       
        prosT.value = arr[userText.length - 1];
        for (var i = 0;i < userText.length;i++) {

            //if (userText[i] == "") { i++; continue; }
            if (userText[i] !== arr[i]) {
                incorrectInput(userInput);
               
                return;
            }
            else {
                correctInput(userInput, i, arr.length);
            }
        }
        if (str.trim() === mmInput.trim()) {
            displayStats(time, 1.0 * arr.length );
           
            clearInterval(id);
        }
        else {
            time += 0.01;
        }
    }
}
document.onkeydown = null

highlightor.state.keyMaps = {
    'Ctrl-v': function () { 
        
    },
    'Ctrl-V': function () {
        
    },
  

}