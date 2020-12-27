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

    canMoveRing(gameBoard, player, displacement){
        let requestString = "move_ring_phase(" + gameBoard.toGameStateString() + ",";
        requestString += (player === Player.WHITE ? "white" : "black")  + ",";
        requestString += "[[" + displacement[0].toString() + "],[" + displacement[1].toString() + "]])";

        return this.sendPrologRequest(requestString);
    }

    canMoveBall(gameBoard, player, displacement){

        let requestString = "move_ball_phase(" + gameBoard.toGameStateString() + ",";
        requestString += (player === Player.WHITE ? "white" : "black")  + ",";
        requestString += "[[" + displacement[0].toString() + "],[" + displacement[1].toString() + "]])";

        return this.sendPrologRequest(requestString);
        
    }
    
    sendPrologRequest (requestString) {
        let request = new XMLHttpRequest();
        
        let response;
        request.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                response = JSON.parse(request.responseText);
                console.log(response);
            }
        };

        request.open('GET', 'http://' + PROLOG_URL + ':' + PROLOG_DEFAULT_PORT + '/' + requestString, false);
        request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
        request.send();
        
        return response;
    }

}