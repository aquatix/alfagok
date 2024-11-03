/* Original from alphaguess.com */

function go() {
  window.timerID = window.setInterval(timer, 0);
}

function timer(){
  var nextgame = document.getElementById('nextgame');
  var now = new Date();
  var midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()+1, 0, 0, 0);
  var diff =  Math.floor((midnight - now)/1000);
  var hoursRemain   = Math.floor(diff/(60*60));
  var minutesRemain = Math.floor((diff-hoursRemain*60*60)/60);
  var secondsRemain = Math.floor(diff%60);
  nextgame.innerHTML   = '<span class="nextgame">'+addZero(hoursRemain)+':'+addZero(minutesRemain)+':'+addZero(secondsRemain)+' left</span>';
}

function addZero(num){
  if(num <=9) return '0'+num;
  else return num;
}

go();
