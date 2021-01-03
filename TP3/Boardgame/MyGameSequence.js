class MyGameSequence {
    constructor() {
        this.moveList = [];
    }

    addMove(move) {
        this.moveList.push(move);
    }

    getLastMove() {
        return this.moveList[this.moveList.length];
    }

    undo() {
        return this.moveList.pop();
    }

    restartGame() {
        this.moveList = [];
    }

    getAllMoves() {
        return this.moveList;
    }

    get empty() {
        return this.moveList.length == 0;
    }
}