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
}