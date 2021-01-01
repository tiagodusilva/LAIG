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

        this.newGameGamemode = gamemode.HUMAN_VS_COMPUTER;
        this.newGameDifficulty1 = computerDifficulty.SMART;
        this.newGameDifficulty2 = computerDifficulty.SMART;

        this.curPlayer = Player.WHITE;
        this.curPlayerType = null;
        this.curMoveState = moveState.MOVE_RING;
        this.curGameState = gameState.PLAYING;
        this.updateGameSettings();
        
        this.gameStarted = false;

        this.ballsToDisplace = [];

        this.turnCount = 0;
        this.tSinceLastMove = null;
        this.maxTurnTime = 10;

        this.gameBoard.makeNothingSelectable();
    }

    updateGameSettings() {
        this.gamemode = this.newGameGamemode;
        this.difficulty1 = this.newGameDifficulty1;
        this.difficulty2 = this.newGameDifficulty2;
        this.curDifficulty = 1;
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
        this.tSinceLastMove = null;
        this.updateGameSettings();

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



    async computerMove() {
        this.gameBoard.makeNothingSelectable();
        let response = await MyPrologInterface.getComputerMove(this.gameBoard, this.curPlayer, this["diffculty" + this.curDifficulty]);

        this.curMove.fromPrologMove(response['move']);
        await this.curMove.makeMove();
        this.advanceTurn();
    }

    async advanceTurn(undo = false) {

        if (undo === false) {
            this.storeCurrentMove();

            let response = await MyPrologInterface.isGameOver(this.gameBoard, this.curPlayer);

            if (response['winner'] !== "none") {
                this.gameOver(response['winner']);
                return;
            }
            this.tSinceLastMove = null;
            this.turnCount++;
        } else {
            this.turnCount--;
            //Move before the one reverted
            let beforeMove = this.gameSequence.getLastMove();
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
                if (undo == false) {
                    this.computerMove();
                }
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
            this.gamemode == gamemode.HUMAN_VS_COMPUTER && this.curPlayerType == playerType.COMPUTER ||
            this.gamemode == gamemode.COMPUTER_VS_HUMAN && this.curPlayer == playerType.COMPUTER) {
            this.curPlayerType = playerType.HUMAN;
        } else {
            this.curPlayerType = playerType.COMPUTER;
        }
    }

    gameOver(winner) {
        this.curGameState = gameState.ENDED;
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
                this.curMove.addRingMove([initialPos, finalPos]);
                await this.curMove.moveRing();
                this.setMoveState(moveState.MOVE_BALL);
                break;
            case moveState.MOVE_BALL:
                response = await MyPrologInterface.canMoveBall(this.gameBoard, this.curPlayer, [translatePosToProlog(initialPos), translatePosToProlog(finalPos)]);
                if (response['valid'] === false) {
                    console.log("Invalid Move");
                    return;
                }
                this.curMove.addBallMove([initialPos, finalPos]);
                await this.curMove.moveBall();

                if (response["ballsToDisplace"].length === 0) {
                    this.advanceTurn();
                } else {
                    this.ballsToDisplace = response["ballsToDisplace"];
                    this.setMoveState(moveState.DISPLACE_BALLS);
                }
                break;
            case moveState.DISPLACE_BALLS:
                //TODO: Maybe change?
                //Displace the ball
                let canDisplaceBall = await this.gameBoard.displaceBall(initialPos[0], initialPos[1], finalPos[0], finalPos[1])
                if (!canDisplaceBall) {
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
            await this.curMove.undoRing();
            this.setMoveState(moveState.MOVE_RING);
            //Undo any displacement and the ball move that caused it
        } else if (this.curMoveState == moveState.DISPLACE_BALLS) {
            await this.curMove.undoDisplacements();
            await this.curMove.undoBall();
            this.setMoveState(moveState.MOVE_BALL);
            //Undo entire move(We are in the ring phase)
        } else {
            let moveToUndo = this.gameSequence.undo();
            if (!moveToUndo) {
                console.log("No moves to undo");
                return;
            }
            await moveToUndo.undoMove();

            //If the human player is playing undo AI and human move
            if ((this.gamemode == gamemode.HUMAN_VS_COMPUTER || this.gamemode == gamemode.COMPUTER_VS_HUMAN) && this.curPlayer == playerType.HUMAN) {
                this.advanceTurn(true);
                this.undoMove();
            } else {
                this.advanceTurn(true);
            }
        }

    }

    async playMovie() {

        this.gameBoard.resetBoard();

        //All moves until before the current
        for (let move of this.gameSequence.getAllMoves()) {
            await move.makeMove();
        }

        //Current move
        if (this.curMove.ringMove != null) {
            await this.curMove.moveRing();
        }
        if (this.curMove.ballMove != null) {
            await this.curMove.moveBall();
        }
        if (this.curMove.ballsDisplacements.length > 0) {
            await this.curMove.displaceBalls();
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
        if(this.curGameState != gameState.ENDED){
            if (this.tSinceLastMove === null) {
                this.tSinceLastMove = t;
            } else {
                let timeLeft = this.maxTurnTime - (t - this.tSinceLastMove);
                // console.log(timeLeft);
                if (timeLeft <= 0) {
                    this.gameOver(this.curPlayer == Player.WHITE ? "black" : "white");
                }
            }
        }

        this.animator.update(t);
    }
}