class MyGameOrchestrator {
    constructor(scene) {
        this.scene = scene;
        this.gameBoard = new MyGameboard(this.scene);
        this.selectedPiece = null;
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
        } else if (obj instanceof MyTile){
            // do something with id knowing it is a tile
            if(this.selectedPiece){
                let initialPos = this.gameBoard.getTilePos(this.selectedPiece.tile);
                let finalPos = this.gameBoard.getTilePos(obj);
                console.log(initialPos);
                console.log(finalPos);
                this.gameBoard.movePiece(initialPos[0], initialPos[1], finalPos[0], finalPos[1]);
                this.selectedPiece.selected = false;
                this.selectedPiece = null;
                console.log(this.gameBoard);
            }
            console.log(obj);
        } else {
            // error ?
            console.log("I'm a teapot"); 
        }
    }
}