const PROLOG_URL = "localhost";
const PROLOG_DEFAULT_PORT = 8081;

//TODO: Add more later
const prologRequestType = {
    VALID_MOVES: 0,
    IS_VALID_MOVE: 1,
}

class MyPrologInterface {
    constructor () {

    }

    isValidMove(gameBoard, move){

        let requestString = "move(" + gameBoard.toGameStateString() + "," + "[[[-1,-1],[2,2]],[[1,4],[2,4]],[],white])";
        let request = new XMLHttpRequest();

        request.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                let response = request.responseText.trim('\n');
                console.log(response);
            }
        };

        request.open('GET', 'http://' + PROLOG_URL + ':' + PROLOG_DEFAULT_PORT + '/' + requestString, true);
        request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
        request.send();
        
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


    parseStartPrologReply () {
        //TODO: Check if this works
        if(this.status !== 200) {
            console.log("ERROR");
            return;
        }

        let responseArray = parseResponse(this.responseText, true);
    }
}