const PROLOG_URL = "localhost";
const PROLOG_DEFAULT_PORT = 8081;

class MyPrologInterface {
    constructor () {

    }

    sendPrologRequest(requestString, onSuccess, onError, port){
        let requestPort = port || PROLOG_DEFAULT_PORT;
        let request = new XMLHttpRequest();
        
        request.onload = onSuccess || function(data){console.log("Request successful. Reply: " + data.target.response);};
        request.onerror = onError || function(){console.log("Error waiting for response");};

        request.open('GET', 'http://' + PROLOG_URL + ':' + requestPort + '/' + requestString, true);
        request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
        request.send();
    }

    makeRequest(){
        // Get Parameter Values
        let requestString = document.querySelector("#query_field").value;
        // Make Request
        getPrologRequest(requestString, handleReply);
    }
    
    //Handle the Reply
    handleReply(data){
        document.querySelector("#query_result").innerHTML=data.target.response;
    }
}