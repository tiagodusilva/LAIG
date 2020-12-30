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
        await this.gameboard.movePiece(this.ringMove[0][0], this.ringMove[0][1], this.ringMove[1][0], this.ringMove[1][1]);
    }

    async moveBall() {
        await this.gameboard.movePiece(this.ballMove[0][0], this.ballMove[0][1], this.ballMove[1][0], this.ballMove[1][1])
    }

    async displaceBalls() {
        for (let i = 0; i < this.ballsDisplacements.length; i++) {
            let ballDisplacement = this.ballsDisplacements[i];
            await this.gameboard.movePiece(ballDisplacement[0][0], ballDisplacement[0][1], ballDisplacement[1][0], ballDisplacement[1][1]);
        }
    }
    
    async makeMove() {
        await this.moveRing();
        await this.moveBall();
        await this.displaceBalls();
    }

    async undoRing() {
        await this.gameboard.movePiece(this.ringMove[1][0], this.ringMove[1][1], this.ringMove[0][0], this.ringMove[0][1]);
        this.removeRingMove();
    }

    async undoBall() {
        await this.gameboard.movePiece(this.ballMove[1][0], this.ballMove[1][1], this.ballMove[0][0], this.ballMove[0][1]);
        this.removeBallMove();
    }

    async undoDisplacements() {
        while (this.ballsDisplacements.length > 0) {
            let ballDisplacement = this.removeBallDisplacement();
            await this.gameboard.movePiece(ballDisplacement[1][0], ballDisplacement[1][1], ballDisplacement[0][0], ballDisplacement[0][1]);
        }
    }

    async undoMove(){
        await this.undoDisplacements();
        await this.undoBall();
        await this.undoRing();
    }

    animate() {

    }
}