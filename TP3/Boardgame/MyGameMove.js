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
        this.ballsDisplacements = null;
        this.curMoveState = moveState.MOVE_RING;
    }

    getState() {
        return this.curMoveState;
    }

    animate() {

    }
}