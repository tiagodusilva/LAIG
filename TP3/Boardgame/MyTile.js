class MyTile {
    constructor(scene, animator, gameboard, position, playerAux=null) {
        this.scene = scene;
        this.animator = animator;
        this.gameboard = gameboard;
        this.stack = []; /* stack is the name used in our prolog game */
        this.tile = new Plane(scene, 3, 3);
        this.uniqueId = this.scene.currentUniqueId++;
        this.selectable = true;
        this.position = position;
        this.playerAux = playerAux;
    }

    getPieceAmount() {
        return this.stack.length;
    }

    getStackTypes() {
        return this.stack.map(function(x){return x.type})
    }

    addNewPiece(pieceType, selectable){
        let topPiece = this.getTopPiece();
        if(topPiece){
            topPiece.selectable = false;
        }
        let piece = new MyPiece(this.scene, this.animator, pieceType, this.position, this.stack.length, selectable);
        piece.selectable = true;
        this.stack.push(piece);
    }

    addExistingPiece(piece, animate=false) {
        let topPiece = this.getTopPiece();
        if(topPiece){
            topPiece.selectable = false;
        }
        piece.selectable = true;
        if (animate) {
            piece.updatePositionInBoard(this.position, this.stack.length);
            this.animator.addAnimation(
                new MyMovementAnimation(piece, piece.transform.clone(), MyPiece.generateTransform(this.position, this.stack.length))
            );
        } else {
            piece.updatePositionInBoard(this.position, this.stack.length, true);
        }
        this.stack.push(piece);
    }

    getTopPiece() {
        return this.stack.length == 0 ? null : this.stack[this.stack.length - 1];
    }

    movePiece(toCoords, animate=false) {
        let destinationTile = this.gameboard.getTile(toCoords[0], toCoords[1]);
        let topPiece = this.stack.pop();
        destinationTile.addExistingPiece(topPiece, animate);
    }

    display() {
        // if (this.selectable)
        this.scene.registerForPick(this.uniqueId, this);
        this.scene.pushMatrix();
        this.scene.translate(this.position[1], 0, this.position[0]);
        this.scene.scale(0.95, 1, 0.95);
        this.tile.display();
        this.scene.popMatrix();
        // if (this.selectable)
        this.scene.clearPickRegistration();

        for (let i = 0; i < this.stack.length; i++) {
            this.stack[i].display();
        }

    }
}