let getPhrases = (messages) => {
  $.ajax({
    url: "http://localhost:5000/get_phrases",
    type: "get", //send it through get method
    data: {
      "messages": JSON.stringify(messages)
    },
    success: function(response) {
      console.log("response")
      console.log(response);
    },
    error: function(xhr) {
      console.log(xhr);
    }
  });
}