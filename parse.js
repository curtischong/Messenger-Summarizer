const DETAILED_DEBUG = false;

let getRelevantMsgs = () => {
  let relevantMsgs = [];
    let curMsgs = [];
  $("#js_1").children().each((_, msg) => {
    // _497p
    // This line looks for the timestamps that show up in between conversations
    if($(msg).attr("class") == "_497p _2lpt"){
      if(curMsgs != []){
        relevantMsgs.push(curMsgs);
      }
      curMsgs = [];
    // If there is a container div with no class then we know that it is a message
    // block that is sent by somebody
    }else if($(msg).attr("class") === undefined){
      // children.first bc there is this unnecessary double nested div
      curMsgs.push($(msg).children().first().children("._41ud"));
    }else{
      console.log("ERROR: couldn't find the header class. instead found:")
      console.log($(msg).attr("class"));
    }
  });
  relevantMsgs.push(curMsgs);
  return relevantMsgs;
}

let findTimeSent = (element) => {
  let time = $(element).find(`div[data-tooltip-content]`).first().attr("data-tooltip-content");
  let segments = time.split(" ");
  let lastSegment = segments[segments.length - 1];
  if(lastSegment == "AM" || lastSegment == "PM"){
    return segments[segments.length - 2] + lastSegment.toLowerCase();
  }
  return lastSegment
}

/*
let containsDayOfWeek = (timeSent) => {
    let daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    daysOfWeek.forEach(function(day){
      if(timeSent.includes(day)){
        return true;
      }
    });
    return false;
}

let containsMonth = (timeSent) => {
    let months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    months.forEach(function(month){
      if(timeSent.includes(month)){
        return true;
      }
    });
    return false;
}*/

let guid = () => {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}

let parseConvo = (relevantMsgs) =>{
  let convo = [];

  relevantMsgs.forEach((msg) => {
    let person = msg.children().first().attr("aria-label");
    // This element is a reply
    if(person === undefined){
      replyStr = msg.find("i").first().parent().text();
      person = replyStr.split("replied to")[0].trim();
      console.log(person)
      if(person === "You"){
        person = YOUR_NAME;
      }
    }
    // TODO: add a json attr that says if you wrote the msg
    // you can find out who wrote the message by looking at the same attr as the
    // one where you find the person's name
    // if it is you, there is a accessible_elem class in that div
    //TODO: fix issues where you call ppl
    let chats = msg.children(".clearfix");
    chats.each((_, texts)=>{
      // TODO: NOT SURE HOW THIS SCRIPT HOLDS UP TO RECORDINGS OR GAMES
      // TODO: MAYBE LOOK INTO REMOVED MESSAGES AS WELL
      let timeSent;
      try{
        timeSent = findTimeSent(texts);
      }
      catch(error){
        console.log("ERROR: Couldn't parse timeSent");
        console.log(error);
        return
      }
      /*
      if(containsMonth(timeSent)){
        console.log(timeSent)
      }else if(containsDayOfWeek(timeSent)){
        console.log(timeSent)
      }else{
        // note this is buggy cause I'm mixing utx and local
        var today = moment();
        console.log(moment(timeSent, LT).format())//.toISOString())
      }*/


      // this "if" needs to be here first bc the read receipt img shouldn't trigger the "find img block"
      // finds texts

      if($(texts).find("span._3oh-").length !== 0){
        // note: there could be a link in there
        // note: if there is a visual of the link destination it should be within the same .clearfix block as the text
        let words = $(texts).find("span._3oh-").text()
        let element = $(texts).find("span._3oh-")[0]
        id = guid();
        // Note: this attr is placed on a span element
        $(element).attr("id", id);
        if(DETAILED_DEBUG){
          console.log(person);
          console.log(words);
        }
        convo.push({
          "person": person,
          "type": "text",
          "msg": words,
          "timeSent": timeSent,
          "id": id,
        })
      // finds uploaded images
      }else if ($(texts).find('img').length !== 0){
        if(DETAILED_DEBUG){
          console.log(`${person}: img`);
        }
        convo.push({
          "person": person,
          "type": "img",
          "timeSent": timeSent
        });
        // finds attachments
      }else if($(texts).find("a._4pcn").length !== 0){
        if(DETAILED_DEBUG){
          console.log(`${person} attachment`)
        }
        convo.push({
          "person": person,
          "type": "attachment",
          "timeSent": timeSent
        })
      }else{
        console.log("ERROR: COULDN'T FIND WHAT THIS ELEMENT IS")
        console.log($(texts).html());
      }
    })
  });
  return convo;
};