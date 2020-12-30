const gamemode = {
    HUMAN_VS_HUMAN: 0,
    HUMAN_VS_COMPUTER: 1,
    COMPUTER_VS_HUMAN: 2,
    COMPUTER_VS_COMPUTER: 3
}

const playerType = {
    HUMAN: 0,
    COMPUTER: 1
}

const computerDifficulty = {
    RANDOM: 0,
    SMART: 1
}

const gameState = {
    OPTIONS: 0,
    PLAYING: 1,
    ENDED: 2
}


class MyGameOrchestrator {
    constructor(scene) {
        this.scene = scene;
        this.animator = new MyAnimator(this);
        this.gameBoard = new MyGameboard(this.scene, this.animator);
        this.curMove = new MyGameMove(this.gameBoard);
        this.gameSequence = new MyGameSequence();

        this.selectedPiece = null;
        
        this.curGameState = gameState.OPTIONS;
        
        this.curPlayer = Player.WHITE;
        this.curPlayerType = null;
        this.curMoveState = moveState.MOVE_RING;
        this.gamemode = gamemode.HUMAN_VS_COMPUTER;
        this.difficulty1 = computerDifficulty.SMART;
        this.difficulty2 = computerDifficulty.SMART;
        this.curDifficulty = 1;
        this.gameStarted = false;

        this.ballsToDisplace = [];

        this.gameBoard.makeNothingSelectable();
    }

    updateConfig(graph) {
        MyTile.tile = graph.gameConfig.get("tile");
        MyTile.aux_tile = graph.gameConfig.get("aux_tile");
        
        MyPiece.pieces.set(PieceType.WHITE_RING, graph.gameConfig.get("white_ring"));
        MyPiece.pieces.set(PieceType.WHITE_BALL, graph.gameConfig.get("white_ball"));
        MyPiece.pieces.set(PieceType.BLACK_RING, graph.gameConfig.get("black_ring"));
        MyPiece.pieces.set(PieceType.BLACK_BALL, graph.gameConfig.get("black_ball"));
        this.gameBoard.forEachPiece((piece) => piece.updatePieceModel());

        let newRingHeight = graph.gameConfig.get("ring_height");
        if (newRingHeight != undefined && newRingHeight != MyPiece.ringHeight) {
            MyPiece.ringHeight = newRingHeight;
            this.gameBoard.forEachPiece((piece) => piece.recalculateTransform());
        }
    }

    startGame() {
        this.gameStarted = true;

        console.log("White difficulty: " + this.difficulty1);
        console.log("Black difficulty: " + this.difficulty2);
        console.log("Gamemode: " + this.gamemode);

        this.gameSequence.restartGame();
        this.gameBoard.resetBoard();
        this.curPlayer = Player.WHITE;
        this.curGameState = gameState.PLAYING;
        if (this.gamemode == gamemode.HUMAN_VS_COMPUTER ||
            this.gamemode == gamemode.HUMAN_VS_HUMAN) {
            this.curPlayerType = playerType.HUMAN;
            console.log("Jogador: " + this.curPlayer);
            this.gameBoard.makeTopRingsSelectable(this.curPlayer);
        } else {
            this.curPlayerType = playerType.COMPUTER;
            this.computerMove();
        }
    }

    display() {
        if (this.curGameState == gameState.PLAYING || this.curGameState == gameState.ENDED) {
            this.gameBoard.display();
        }
    }

    managePick(mode, results) {
        if (mode == false /* && some other game conditions */) {
            if (results != null && results.length > 0) {
                // any results?
                for (let i = 0; i < results.length; i++) {
                    let obj = results[i][0];
                    // get object from result
                    if (obj) { // exists?
                        let uniqueId = results[i][1]
                        // get id
                        this.onObjectSelected(obj, uniqueId);
                    }
                } // clear results
                results.splice(0, results.length);
            }
        }
    }

    onObjectSelected(obj, id) {

        if (obj instanceof MyPiece) {

            if (this.selectedPiece == obj) {
                obj.selected = !obj.selected;
                this.selectedPiece = null;
                obj.onDeselect();
                return;
            }
            // do something with id knowing it is a piece
            if (this.selectedPiece) {
                //I want to move it to its tile if possible
                if (!obj.selectable) {
                    this.handleMove(this.selectedPiece, this.gameBoard.getTile(obj.position[0], obj.position[1]));
                    this.selectedPiece.selected = false;
                    this.selectedPiece = null;
                    //I want to switch selected piece
                } else {
                    this.selectedPiece.onDeselect();
                    this.selectedPiece.selected = false;
                }
            }

            // I want to select this piece
            if (obj.selectable) {
                obj.selected = !obj.selected;
                this.selectedPiece = obj;
                obj.onSelect();
            }
        } else if (obj instanceof MyTile) {

            // do something with id knowing it is a tile
            if (this.selectedPiece) {
                this.handleMove(this.selectedPiece, obj);
                this.selectedPiece.selected = false;
                this.selectedPiece = null;
            }
        } else {
            // error ?
            console.log("I'm a teapot");
        }
    }

    async makeMove(move) {
        await this.gameBoard.movePiece(move.ringMove[0][0], move.ringMove[0][1], move.ringMove[1][0], move.ringMove[1][1]);
        await this.gameBoard.movePiece(move.ballMove[0][0], move.ballMove[0][1], move.ballMove[1][0], move.ballMove[1][1]);

        for (let i = 0; i < move.ballsDisplacements.length; i++) {
            let ballDisplacement = move.ballsDisplacements[i];
            await this.gameBoard.movePiece(ballDisplacement[0][0], ballDisplacement[0][1], ballDisplacement[1][0], ballDisplacement[1][1]);
        }
    }

    async computerMove() {
        this.gameBoard.makeNothingSelectable();
        let response = await MyPrologInterface.getComputerMove(this.gameBoard, this.curPlayer, this["diffculty" + this.curDifficulty]);

        let move = new MyGameMove(this.gameBoard);
        move.fromPrologMove(response['move']);
        await this.makeMove(move);
        this.advanceTurn();
    }

    async advanceTurn(undo = false) {

        if (undo === false) {
            this.storeCurrentMove();

            let response = await MyPrologInterface.isGameOver(this.gameBoard, this.curPlayer);

            if (response['winner'] !== "none") {
                this.gameOver(response['winner']);
                this.curGameState = gameState.ENDED;
                return;
            }
        } else {
            //Move before the one reverted
            let beforeMove = this.gameSequence.getLastMove()
            this.curMove = beforeMove == null ? new MyGameMove(this.gameBoard) : beforeMove;
        }

        this.curMoveState = moveState.MOVE_RING;

        this.switchPlayer();
        this.changePlayerType();
        switch (this.curPlayerType) {
            case playerType.HUMAN:
                this.gameBoard.makeTopRingsSelectable(this.curPlayer);
                break;

            case playerType.COMPUTER:
                this.computerMove();
                break;

            default:
                break;
        }
    }

    switchPlayer() {
        this.curPlayer = this.curPlayer === Player.WHITE ? Player.BLACK : Player.WHITE;
    }

    changePlayerType() {
        this.curDifficulty = this.curDifficulty === 1 ? 2 : 1;
        if (this.gamemode == gamemode.HUMAN_VS_HUMAN && this.curPlayerType == playerType.HUMAN ||
            this.gamemode == gamemode.HUMAN_VS_COMPUTER && this.curPlayerType == playerType.COMPUTER) {
            this.curPlayerType = playerType.HUMAN;
        } else {
            this.curPlayerType = playerType.COMPUTER;
        }
    }

    gameOver(winner) {
        console.log("The winner is: " + winner);
    }

    async handleMove(pieceToMove, toTile) {
        let response;
        let initialPos = pieceToMove.position;
        let finalPos = toTile.position;

        switch (this.curMoveState) {
            case moveState.MOVE_RING:
                response = await MyPrologInterface.canMoveRing(this.gameBoard, this.curPlayer, [translatePosToProlog(initialPos), translatePosToProlog(finalPos)]);
                if (response['valid'] === false) {
                    console.log("Invalid Move");
                    return;
                }
                await this.gameBoard.movePiece(initialPos[0], initialPos[1], finalPos[0], finalPos[1]);
                this.curMove.addRingMove([initialPos, finalPos]);
                this.setMoveState(moveState.MOVE_BALL);
                break;
            case moveState.MOVE_BALL:
                response = await MyPrologInterface.canMoveBall(this.gameBoard, this.curPlayer, [translatePosToProlog(initialPos), translatePosToProlog(finalPos)]);
                if (response['valid'] === false) {
                    console.log("Invalid Move");
                    return;
                }
                this.gameBoard.movePiece(initialPos[0], initialPos[1], finalPos[0], finalPos[1]);
                this.curMove.addBallMove([initialPos, finalPos]);
                if (response["ballsToDisplace"].length === 0) {
                    this.advanceTurn();

                } else {
                    this.ballsToDisplace = response["ballsToDisplace"];
                    this.setMoveState(moveState.DISPLACE_BALLS);
                }
                break;
            case moveState.DISPLACE_BALLS:
                //Displace the ball
                if (!this.gameBoard.displaceBall(initialPos[0], initialPos[1], finalPos[0], finalPos[1])) {
                    return;
                }
                this.curMove.addBallDisplacement([initialPos, finalPos]);

                //Used to remove the ball from the balls to displace
                this.ballsToDisplace = this.ballsToDisplace.filter(item => (item[0] !== initialPos[0] && item[1] !== initialPos[1]))

                if (this.ballsToDisplace.length === 0) {
                    this.advanceTurn();
                } else {
                    this.gameBoard.makeBallsToDisplaceSelectable(this.ballsToDisplace);
                }

                break;
            default:
                console.log("I'm also a teapot!");
                break;
        }
    }

    storeCurrentMove() {
        this.gameSequence.addMove(this.curMove);
        this.curMove = new MyGameMove(this.gameBoard);
    }

    async undoMove() {
        //Only undo ring move
        if (this.curMoveState == moveState.MOVE_BALL) {
            await this.gameBoard.movePiece(this.curMove.ringMove[1][0], this.curMove.ringMove[1][1], this.curMove.ringMove[0][0], this.curMove.ringMove[0][1]);
            this.curMove.removeRingMove();
            this.setMoveState(moveState.MOVE_RING);
            //Undo any displacement and the ball move that caused it
        } else if (this.curMoveState == moveState.DISPLACE_BALLS) {
            while (this.curMove.ballsDisplacements.length > 0) {
                let ballDisplacement = this.curMove.removeBallDisplacement();
                await this.gameBoard.movePiece(ballDisplacement[1][0], ballDisplacement[1][1], ballDisplacement[0][0], ballDisplacement[0][1]);
            }
            await this.gameBoard.movePiece(this.curMove.ballMove[1][0], this.curMove.ballMove[1][1], this.curMove.ballMove[0][0], this.curMove.ballMove[0][1]);
            this.curMove.removeBallMove();
            this.setMoveState(moveState.MOVE_BALL);
            //Undo entire move(We are in the ring phase)
        } else {
            let moveToUndo = this.gameSequence.undo();
            if (!moveToUndo) {
                console.log("No moves to undo");
                return;
            }
            for (let i = moveToUndo.ballsDisplacements.length - 1; i >= 0; i--) {
                let ballDisplacement = moveToUndo.ballsDisplacements[i];
                await this.gameBoard.movePiece(ballDisplacement[1][0], ballDisplacement[1][1], ballDisplacement[0][0], ballDisplacement[0][1]);
            }

            await this.gameBoard.movePiece(moveToUndo.ballMove[1][0], moveToUndo.ballMove[1][1], moveToUndo.ballMove[0][0], moveToUndo.ballMove[0][1]);
            await this.gameBoard.movePiece(moveToUndo.ringMove[1][0], moveToUndo.ringMove[1][1], moveToUndo.ringMove[0][0], moveToUndo.ringMove[0][1]);
            this.advanceTurn(true);
        }
    }

    async playMovie() {

        this.gameBoard.resetBoard();
        
        //All moves until before the current
        for (let move of this.gameSequence.getAllMoves()) {
            await this.makeMove(move);
        }

        //Current move
        if (this.curMove.ringMove != null) {
            await this.gameBoard.movePiece(this.curMove.ringMove[0][0], this.curMove.ringMove[0][1], this.curMove.ringMove[1][0], this.curMove.ringMove[1][1]);
        }
        if (this.curMove.ballMove != null) {
            await this.gameBoard.movePiece(this.curMove.ballMove[0][0], this.curMove.ballMove[0][1], this.curMove.ballMove[1][0], this.curMove.ballMove[1][1]);
        }
        if (this.curMove.ballsDisplacements.length > 0) {
            for (let i = 0; i < this.curMove.ballsDisplacements.length; i++) {
                let ballDisplacement = this.curMove.ballsDisplacements[i];
                await this.gameBoard.movePiece(ballDisplacement[0][0], ballDisplacement[0][1], ballDisplacement[1][0], ballDisplacement[1][1]);
            }
        }

        //Makes the correct pieces be selectable
        this.setMoveState(this.curMoveState);
    }

    setMoveState(state) {
        this.curMoveState = state;
        switch (state) {
            case moveState.MOVE_RING:
                this.gameBoard.makeTopRingsSelectable(this.curPlayer);
                break;
            case moveState.MOVE_BALL:
                this.gameBoard.makeTopBallsSelectable(this.curPlayer);
                break;
            case moveState.DISPLACE_BALLS:
                this.gameBoard.makeBallsToDisplaceSelectable(this.ballsToDisplace);
                break;
            default:
                break;
        }
    }

    update(t) {
        this.animator.update(t);
    }
}