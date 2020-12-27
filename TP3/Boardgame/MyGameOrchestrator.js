const moveState = {
    MOVE_RING: 0,
    MOVE_BALL: 1,
    DISPLACE_BALLS: 2
}

class MyGameOrchestrator {
    constructor(scene) {
        this.scene = scene;
        this.gameBoard = new MyGameboard(this.scene);
        this.prologInterface = new MyPrologInterface();
        this.selectedPiece = null;
        this.curPlayer = Player.WHITE;
        this.gameBoard.makeTopRingsSelectable(this.curPlayer);
        this.curMoveState = moveState.MOVE_RING;
        this.ballsToDisplace = [];
    }

    display() {
        this.gameBoard.display();
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
            if(this.selectedPiece){
                //I want to move it to its tile if possible
                if(!obj.selectable){
                    this.handleMove(this.selectedPiece, obj.tile);
                    this.selectedPiece.selected = false;
                    this.selectedPiece = null;
                //I want to switch selected piece
                } else {
                    this.selectedPiece.selected = false;
                }
            }

            if(obj.selectable){
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

    switchPlayer() {
        this.curPlayer = this.curPlayer === Player.WHITE ? Player.BLACK : Player.WHITE;
    }

    handleMove(pieceToMove, toTile) {
        let response;
        let initialPos = this.gameBoard.getTilePos(pieceToMove.tile);
        let finalPos = this.gameBoard.getTilePos(toTile);
        console.log(this.ballsToDisplace);

        switch(this.curMoveState) {
            case moveState.MOVE_RING:
                response = this.prologInterface.canMoveRing(this.gameBoard, this.curPlayer, [translatePosToProlog(initialPos), translatePosToProlog(finalPos)]);
                
                if(response['valid'] === false){
                    console.log("Invalid Move");
                    return;
                }
                this.gameBoard.movePiece(initialPos[0], initialPos[1], finalPos[0], finalPos[1]);
                this.curMoveState = moveState.MOVE_BALL;
                this.gameBoard.makeTopBallsSelectable(this.curPlayer);
                break;
            case moveState.MOVE_BALL:
                response = this.prologInterface.canMoveBall(this.gameBoard, this.curPlayer, [translatePosToProlog(initialPos), translatePosToProlog(finalPos)]);
                if(response['valid'] === false){
                    console.log("Invalid Move");
                    return;
                }
                //TODO: CHECK IF THERE ARE ANY DISPLACED BALLS
                this.gameBoard.movePiece(initialPos[0], initialPos[1], finalPos[0], finalPos[1]);
                if(response["ballsToDisplace"].length === 0){
                    this.curMoveState = moveState.MOVE_RING;
                    this.switchPlayer();
                    this.gameBoard.makeTopRingsSelectable(this.curPlayer);
                } else {
                    this.ballsToDisplace = response["ballsToDisplace"];
                    this.curMoveState = moveState.DISPLACE_BALLS;
                    this.gameBoard.makeBallsToDisplaceSelectable(this.ballsToDisplace);
                }
                break;
            case moveState.DISPLACE_BALLS:
                //Displace the ball
                if(!this.gameBoard.displaceBall(initialPos[0], initialPos[1], finalPos[0], finalPos[1])){
                    return;
                }

                //Used to remove the ball from the balls to displace
                this.ballsToDisplace = this.ballsToDisplace.filter(item => (item[0] !== initialPos[0] && item[1] !== initialPos[1]))

                if(this.ballsToDisplace.length === 0){
                    this.curMoveState = moveState.MOVE_RING;
                    this.switchPlayer();
                    this.gameBoard.makeTopRingsSelectable(this.curPlayer);
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