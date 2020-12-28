const moveState = {
    MOVE_RING: 0,
    MOVE_BALL: 1,
    DISPLACE_BALLS: 2,
    DONE: 3
}

class MyGameMove {
    constructor(gameboard) {
        this.gameboard = gameboard;
        this.ringMove = null;
        this.ballMove = null;
        this.ballsToDisplace = null; //Maybe not needed
        this.ballsDisplacements = null;
        this.player = null;
        this.curMoveState = moveState.MOVE_RING;
    }

    getState() {
        return this.curMoveState;
    }

    fromPrologMove(move) {
        this.ringMove = move[0];
        this.ballMove = move[1];
        this.ballsDisplacements = move[2];
        this.player = move[3] === "white" ? Player.WHITE : Player.BLACK;
        this.curMoveState = moveState.DONE;

        if (this.ringMove[0][1] === -1) {
            this.ringMove[0][1] = this.player;
        }
    }

    animate() {

    }
}