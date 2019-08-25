const YOUR_NAME = "Curtis";

let getLastFiveMsgs = (convo) => {
  let lastFiveMsgs = []
  let idx = Math.max(convo.length - 5, 0);
  for(;idx < convo.length; idx++){
    lastFiveMsgs.push(convo[idx].msg);
  }
  return lastFiveMsgs;
}


let onlyText = (msgs) => {
  let newMsgs = []
  msgs.forEach(function(msg){
    if(msg.type === "text"){
      newMsgs.push(msg);
    }
  });
  return newMsgs;
}

let displaySummary = (summary) => {
  for (index = 0; index < summary.length; index++) {
    console.log(summary[index]);
    // Create a <li> node
    var node = document.createElement("LI");
    let msgid = summary[index].id;
    node.classList.add("sumListElement");
    let height = $("#"+msgid).offset().top;
    node.addEventListener("click", function(e) {
      //console.log($("#"+msgid).first());
      $("#"+msgid)[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
    // Create a text node
    var textnode = document.createTextNode(summary[index].omsg);
    // Append the text to <li>
    node.appendChild(textnode);
    // Append <li> to <ul> with id="myList"
    document.getElementById("sumList").appendChild(node);
  }
}

let loadSidebar = () => {
  // These relevant Msgs are from the last conversation
  let relevantMsgs = getRelevantMsgs();
  let convos = []
  relevantMsgs.forEach(function(msg){
    let convo = parseConvo(msg);
    let textConvo = onlyText(convo);
    if (textConvo.length > 0){
      convos.push(textConvo);
    }
  });
//  console.log(convos[0]);

  // let lastFiveMsgs = getLastFiveMsgs(convo);
  // TODO: uncomment this when the api is finished!
  // getPhrases(lastFiveMsgs);
  //convo = ['this is a sentence', 'this is a second sentence that is really really long'];
  /*
  for (let i = 0; i < convos.length; i++){
    console.log(convos[i])
    displaySummary(convos[i]);
  }*/
  getPhrases(convos,function(res){
      console.log(res);
      $("#sumList").html("");
        displaySummary(res);
  });
}

let setShowBtnListener = () => {
  let bodyIsHidden = true;
  $("#visibilityBtn").click(() => {
    if(bodyIsHidden){
      bodyIsHidden = false;
      $("#convoBody").css("visibility","visible");
    $("#visibilityBtn").html("Hide");
    }else{
      bodyIsHidden = true;
      $("#convoBody").css("visibility","hidden");
      $("#visibilityBtn").html("Show");
    }
  });
}

// run this fucntion everytime you enter a new chats
let main = (initVars) => {
  let messageObserver = initVars.messageObserver;

  loadSidebar();
  const config = { attributes: false, childList: true, subtree: true};
  messageObserver.observe($("#js_1")[0], config);

}


/* scratchpad
if a new dom change OR someone has messaged in the last 15 min
then the conversation has gone on for at least from now
til the last timestamp
- good measure bc a conversation relies on 2 ppl.
- you don't have to account for the case where they start speaking
- and you haven't said anything yet.
- conversations duration doesn't work that way
- this if statement is good because the correct conversation time is still
- displayed even if you navigate away

//TODO: future
- If someone says bye or cya or night etc. then remember to stop the timer
*/
let initMessageObserver = () => {
  let observeNewChats = (mutationsList, observer) => {
    if(mutationsList.length == 1 && $(mutationsList[0].target).attr("class") == "_41ud"){
      console.log("new change!")
    // Theory: when you just start a new conversation
    // the mutationsList.length == 2
    }else if(mutationsList.length == 2){
      console.log(mutationsList);
    }
  }

  return new MutationObserver(observeNewChats);
}
let initPageObserver = (initVars) => {
  let observePageChange = (mutationsList, observer) => {
    console.log("swiched chats");
    let i = setInterval(() => {
      if ($('._41ud').length) {
        clearInterval(i);
        initVars.messageObserver.disconnect();
        main(initVars);
      }
    }, 100);
  }
  // Note: this mutation server never needs to be reassigned!
  const config = { attributes: false, childList: true, subtree: false};
  const pageObserver = new MutationObserver(observePageChange);
  pageObserver.observe($("._4sp8")[0], config)
}

// run this function everytime you enter messenger.com
let init = () => {
  setShowBtnListener();

  $("#reload").on("click", () => {
    console.log("reload");
    loadSidebar();
  })

  const messageObserver = initMessageObserver();

  const initVars = {
    "messageObserver": messageObserver
  }

  initPageObserver(initVars);
  return initVars;
}

$(document).ready( () => {
  $.get(chrome.extension.getURL('convo.html'), (data) => {
    $(data).appendTo('body');

    $(window).on("load", () => {
      let i = setInterval(() => {
          if ($('._41ud').length) {
            clearInterval(i);
            // everything is now loaded
            console.log("Using convo.js!")
            let initVars = init();
            main(initVars);
          }
      }, 100);
    });

  });
});