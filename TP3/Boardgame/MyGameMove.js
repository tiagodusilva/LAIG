const moveState = {
    MOVE_RING: 0,
    MOVE_BALL: 1,
    DISPLACE_BALLS: 2
}

class MyGameMove {
    constructor(gameboard) {
        this.gameboard = gameboard;
        this.ringMove = null;
        this.ballMove = null;
        this.ballsToDisplace = null; //Maybe not needed
        this.ballsDisplacements = [];
        this.player = null;
    }

    fromPrologMove(move) {
        this.ringMove = move[0];
        this.ballMove = move[1];
        this.ballsDisplacements = move[2];
        this.player = move[3] === "white" ? Player.WHITE : Player.BLACK;

        if (this.ringMove[0][1] === -1) {
            this.ringMove[0][1] = this.player;
        }
    }

    addRingMove(ringMove) {
        this.ringMove = ringMove;
    }

    removeRingMove() {
        let result = this.ringMove;
        this.ringMove = null;
        return result;
    }

    addBallMove(ballMove) {
        this.ballMove = ballMove;
    }

    removeBallMove() {
        let result = this.ballMove;
        this.ballMove = null;
        return result;
    }

    addBallDisplacement(displacement) {
        this.ballsDisplacements.push(displacement);
    }

    removeBallDisplacement() {
        return this.ballsDisplacements.pop();
    }

    async moveRing() {
        await this.gameBoard.movePiece(this.curMove.ringMove[0][0], this.curMove.ringMove[0][1], this.curMove.ringMove[1][0], this.curMove.ringMove[1][1]);
    }

    animate() {

    }
}