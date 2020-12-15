class MyTile {
    constructor(scene, gameboard) {
        this.scene = scene;
        this.gameboard = gameboard; 
        this.stack = []; /* stack is the name used in our prolog game */
        this.tile = new Plane(scene, 2, 2);
        this.uniqueId = this.scene.currentUniqueId++;
        this.selectable = true;
    }

    addPiece(piece){
        let topPiece = this.getTopPiece();
        if(topPiece){
            topPiece.selectable = false;
        }
        piece.selectable = true;
        piece.tile = this;
        this.stack.push(piece);
    }

    removePiece() {
        let pieceToRemove = this.stack.pop();
        pieceToRemove.selectable = false;

        let topPiece = this.getTopPiece();
        if(topPiece){
            topPiece.selectable = true;
        }
        return pieceToRemove;
    }

    getTopPiece() {
        return this.stack.length == 0 ? null : this.stack[this.stack.length - 1];
    }

    display() {
        if (this.selectable)
            this.scene.registerForPick(this.uniqueId, this);
        this.tile.display();
        if (this.selectable)
            this.scene.clearPickRegistration();

        for (let i = 0; i < this.stack.length; i++) {
            this.scene.pushMatrix();
            this.scene.rotate(-Math.PI/2, 1, 0, 0);
            this.scene.translate(0, 0, 0.25 * (i + 1));
            this.stack[i].display();
            this.scene.popMatrix();
        }

    }
}