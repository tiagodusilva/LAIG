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
                this.selectedPiece.selected = false;
            }
            obj.selected = !obj.selected;
            this.selectedPiece = obj;
            console.log(obj);
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

    handleMove(pieceToMove, toTile) {
        let response;
        let initialPos = this.gameBoard.getTilePos(pieceToMove.tile);
        let finalPos = this.gameBoard.getTilePos(toTile);

        switch(this.curMoveState) {
            case moveState.MOVE_RING:
                response = this.prologInterface.canMoveRing(this.gameBoard, this.curPlayer, [translatePosToProlog(initialPos), translatePosToProlog(finalPos)]);
                
                if(response['valid'] === false){
                    console.log("Invalid Move");
                    return;
                }
                this.gameBoard.movePiece(initialPos[0], initialPos[1], finalPos[0], finalPos[1]);
                this.curMoveState = moveState.MOVE_BALL;
                break;
            case moveState.MOVE_BALL:
                response = this.prologInterface.canMoveBall(this.gameBoard, this.curPlayer, [translatePosToProlog(initialPos), translatePosToProlog(finalPos)]);
                if(response['valid'] === false){
                    console.log("Invalid Move");
                    return;
                }
                //TODO: CHECK IF THERE ARE ANY DISPLACED BALLS
                this.gameBoard.movePiece(initialPos[0], initialPos[1], finalPos[0], finalPos[1]);
                this.curMoveState = moveState.MOVE_RING;
                this.curPlayer = this.curPlayer === Player.WHITE ? Player.BLACK : Player.WHITE;
                break;
            case moveState.DISPLACE_BALLS:
                break;
            default:
                console.log("I'm also a teapot!");
                break;
        }
    }
}