const PROLOG_URL = "localhost";
const PROLOG_DEFAULT_PORT = 8081;

//TODO: Add more later
const prologRequestType = {
    VALID_MOVES: 0,
    IS_VALID_MOVE: 1,
}

class MyPrologInterface {
    constructor () { }

    static async canMoveRing(gameBoard, player, displacement) {
        let requestString = "move_ring_phase(" + gameBoard.toGameStateString() + ",";
        requestString += (player === Player.WHITE ? "white" : "black")  + ",";
        requestString += "[[" + displacement[0].toString() + "],[" + displacement[1].toString() + "]])";

        return MyPrologInterface.sendPrologRequest(requestString);
    }

    static async canMoveBall(gameBoard, player, displacement) {
        let requestString = "move_ball_phase(" + gameBoard.toGameStateString() + ",";
        requestString += (player === Player.WHITE ? "white" : "black")  + ",";
        requestString += "[[" + displacement[0].toString() + "],[" + displacement[1].toString() + "]])";

        return MyPrologInterface.sendPrologRequest(requestString);
    }

    static async isGameOver(gameBoard, player) {
        let requestString = "game_over(" + gameBoard.toGameStateString() + ",";
        requestString += (player === Player.WHITE ? "white" : "black")  + ")";

        return MyPrologInterface.sendPrologRequest(requestString);
    }

    static async getComputerMove(gameBoard, player, difficulty) {
        let requestString = "choose_move(" + gameBoard.toGameStateString() + ",";
        requestString += (player === Player.WHITE ? "white" : "black")  + ",";
        requestString += (difficulty === computerDifficulty.RANDOM ? "random" : "smart") + ")";

        return MyPrologInterface.sendPrologRequest(requestString);
    }

    static async sendPrologRequest(requestString) {        
        let url = 'http://' + PROLOG_URL + ':' + PROLOG_DEFAULT_PORT + '/' + requestString;
        const response = await fetch(url, {
            method: 'GET', // *GET, POST, PUT, DELETE, etc.
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
            },
        });

        if (response.ok) {
            // let s = await response.json();
            // console.log(s);
            // return s;
            return await response.json();
        } else {
            return null;
        }
    }

}