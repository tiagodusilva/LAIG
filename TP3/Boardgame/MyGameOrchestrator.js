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

        this.selectedPiece = null;

        this.curGameState = gameState.OPTIONS;

        this.curPlayer = Player.WHITE;
        this.curPlayerType = null;
        this.curMoveState = moveState.MOVE_RING;
        this.gamemode = gamemode.HUMAN_VS_COMPUTER;
        this.difficulty1 = computerDifficulty.SMART;
        this.difficulty2 = computerDifficulty.SMART;
        this.curDifficulty = 1;

        this.ballsToDisplace = [];

        this.gameBoard.makeNothingSelectable();
    }

    startGame() {
        console.log("White difficulty: " + this.difficulty1);
        console.log("Black difficulty: " + this.difficulty2);
        console.log("Gamemode: " + this.gamemode);



        this.gameBoard.resetBoard();
        this.curGameState = gameState.PLAYING;
        if (this.gamemode == gamemode.HUMAN_VS_COMPUTER ||
            this.gamemode == gamemode.HUMAN_VS_HUMAN) {
            this.curPlayerType = playerType.HUMAN;
            this.gameBoard.makeTopRingsSelectable(this.curPlayer);
        } else {
            this.curPlayerType = playerType.COMPUTER;
            this.computerMove();
        }
    }

    display() {
        if (this.curGameState === gameState.PLAYING || this.curGameState === gameState.ENDED) {
            this.gameBoard.display();
        }
    }

    managePick(mode, results) {
        if (mode == false /* && some other game conditions */ ) {
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

    async advanceTurn() {
        let response = await MyPrologInterface.isGameOver(this.gameBoard, this.curPlayer);

        if (response['winner'] !== "none") {
            this.gameOver(response['winner']);
            this.curGameState = gameState.ENDED;
            return;
        }

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
        if (this.gamemode === gamemode.HUMAN_VS_HUMAN && this.curPlayerType === playerType.HUMAN ||
            this.gamemode === gamemode.HUMAN_VS_COMPUTER && this.curPlayerType === playerType.COMPUTER) {
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
                this.curMoveState = moveState.MOVE_BALL;
                this.gameBoard.makeTopBallsSelectable(this.curPlayer);
                break;
            case moveState.MOVE_BALL:
                response = await MyPrologInterface.canMoveBall(this.gameBoard, this.curPlayer, [translatePosToProlog(initialPos), translatePosToProlog(finalPos)]);
                if (response['valid'] === false) {
                    console.log("Invalid Move");
                    return;
                }
                //TODO: CHECK IF THERE ARE ANY DISPLACED BALLS
                this.gameBoard.movePiece(initialPos[0], initialPos[1], finalPos[0], finalPos[1]);
                if (response["ballsToDisplace"].length === 0) {

                    this.curMoveState = moveState.MOVE_RING;
                    this.advanceTurn();

                } else {
                    this.ballsToDisplace = response["ballsToDisplace"];
                    this.curMoveState = moveState.DISPLACE_BALLS;
                    this.gameBoard.makeBallsToDisplaceSelectable(this.ballsToDisplace);
                }
                break;
            case moveState.DISPLACE_BALLS:
                //Displace the ball
                if (!this.gameBoard.displaceBall(initialPos[0], initialPos[1], finalPos[0], finalPos[1])) {
                    return;
                }

                //Used to remove the ball from the balls to displace
                this.ballsToDisplace = this.ballsToDisplace.filter(item => (item[0] !== initialPos[0] && item[1] !== initialPos[1]))

                if (this.ballsToDisplace.length === 0) {
                    this.curMoveState = moveState.MOVE_RING;
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

    update(t) {
        this.animator.update(t);
    }
}