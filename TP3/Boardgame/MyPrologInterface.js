const PROLOG_URL = "localhost";
const PROLOG_DEFAULT_PORT = 8081;

//TODO: Add more later
const prologRequestType = {
    VALID_MOVES: 0
}

class MyPrologInterface {
    constructor () {

    }

    sendPrologRequest (requestString, onSuccess, onError, port) {
        let requestPort = port || PROLOG_DEFAULT_PORT;
        let request = new XMLHttpRequest();

        request.addEventListener("load", onSuccess);
        request.addEventListener("error", onError);

        request.open('GET', 'http://' + PROLOG_URL + ':' + requestPort + '/' + requestString, true);
        request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
        request.send();
    }

    makeRequest () {
        // Get Parameter Values
        let requestString = document.querySelector("#query_field").value;
        // Make Request
        sendPrologRequest(requestString, handleReply);
    }
    
    parseStartPrologReply () {
        //TODO: Check if this works
        if(this.status !== 200) {
            console.log("ERROR");
            return;
        }

        let responseArray = parseResponse(this.responseText, true);
    }
}