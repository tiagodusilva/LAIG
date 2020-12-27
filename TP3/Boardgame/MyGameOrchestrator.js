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
        this.gameBoard = new MyGameboard(this.scene);
        this.prologInterface = new MyPrologInterface();
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

        this.gameBoard.makeTopRingsSelectable(this.curPlayer);
    }

    startGame() {
        console.log("White difficulty: " + this.difficulty1);
        console.log("Black difficulty: " + this.difficulty2);



        this.gameBoard.resetBoard();
        this.curGameState = gameState.PLAYING;
        if (this.gamemode === gamemode.HUMAN_VS_COMPUTER ||
            this.gamemode === gamemode.HUMAN_VS_HUMAN) {
            this.curPlayerType = playerType.HUMAN;
        }
        else {
            this.curPlayerType = playerType.COMPUTER;
        }

        if (this.curPlayerType === playerType.COMPUTER) {
            this.computerMove();
        }
    }

    display() {
        if (this.curGameState === gameState.PLAYING || this.curGameState === gameState.ENDED) {
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
            // do something with id knowing it is a piece
            if (this.selectedPiece) {
                //I want to move it to its tile if possible
                if (!obj.selectable) {
                    this.handleMove(this.selectedPiece, obj.tile);
                    this.selectedPiece.selected = false;
                    this.selectedPiece = null;
                    //I want to switch selected piece
                } else {
                    this.selectedPiece.selected = false;
                }
            }

            if (obj.selectable) {
                obj.selected = !obj.selected;
                this.selectedPiece = obj;
            }
        } else if (obj instanceof MyTile) {
            // do something with id knowing it is a tile
            if (this.selectedPiece) {
                this.handleMove(this.selectedPiece, obj);
                this.selectedPiece.selected = false;
                this.selectedPiece = null;
            }
            console.log(obj);
        } else {
            // error ?
            console.log("I'm a teapot");
        }
    }

    makeMove(move) {
        console.log(move.ringMove);
        this.gameBoard.movePiece(move.ringMove[0][0], move.ringMove[0][1], move.ringMove[1][0], move.ringMove[1][1]);
        this.gameBoard.movePiece(move.ballMove[0][0], move.ballMove[0][1], move.ballMove[1][0], move.ballMove[1][1]);

        move.ballsDisplacements.forEach(ballDisplacement => {
            console.log(ballDisplacement);
            this.gameBoard.movePiece(ballDisplacement[0][0], ballDisplacement[0][1], ballDisplacement[1][0], ballDisplacement[1][1]);
        });
    }

    computerMove() {
        this.gameBoard.makeNothingSelectable();
        this.prologInterface.getComputerMove(this.gameBoard, this.curPlayer, this["diffculty" + this.curDifficulty],
            function (response) {
                console.log(response);
                let move = new MyGameMove(this.gameBoard);
                move.fromPrologMove(response['move']);
                this.makeMove(move);
                this.advanceTurn();
            }.bind(this)
        )
    }

    advanceTurn() {

        this.prologInterface.isGameOver(this.gameBoard, this.curPlayer,
            function (response) {
                if (response['winner'] !== "none") {
                    this.gameOver(response['winner']);
                    this.curGameState = gameState.ENDED;
                }
            }.bind(this)
        )
        //TODO: ASYNCHRONOUS MAY CAUSE PROBLEMS
        if (this.curGameState === gameState.ENDED) {
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

    handleMove(pieceToMove, toTile) {
        let response;
        let initialPos = this.gameBoard.getTilePos(pieceToMove.tile);
        let finalPos = this.gameBoard.getTilePos(toTile);
        // console.log(this.ballsToDisplace);

        switch (this.curMoveState) {
            case moveState.MOVE_RING:
                this.prologInterface.canMoveRing(this.gameBoard, this.curPlayer, [translatePosToProlog(initialPos), translatePosToProlog(finalPos)],
                    function (response) {
                        if (response['valid'] === false) {
                            console.log("Invalid Move");
                            return;
                        }
                        this.gameBoard.movePiece(initialPos[0], initialPos[1], finalPos[0], finalPos[1]);
                        this.curMoveState = moveState.MOVE_BALL;
                        this.gameBoard.makeTopBallsSelectable(this.curPlayer);
                    }.bind(this)
                );
                break;
            case moveState.MOVE_BALL:
                this.prologInterface.canMoveBall(this.gameBoard, this.curPlayer, [translatePosToProlog(initialPos), translatePosToProlog(finalPos)],
                    function (response) {
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
                    }.bind(this)
                );
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
}