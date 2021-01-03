class MyTile {
    static tile;
    static aux_tile;

    constructor(scene, animator, gameboard, position, playerAux=null) {
        this.scene = scene;
        this.animator = animator;
        this.gameboard = gameboard;
        this.stack = []; /* stack is the name used in our prolog game */
        this.uniqueId = this.scene.currentUniqueId++;
        this.selectable = true;
        this.position = position;
        this.playerAux = playerAux;
    }

    forEachPiece(func) {
        this.stack.forEach(func);
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

    async addExistingPiece(piece, animate=false) {
        let oldPos = piece.position;
        let topPiece = this.getTopPiece();
        if(topPiece){
            topPiece.selectable = false;
        }
        piece.selectable = true;
        if (animate) {
            piece.updatePositionInBoard(this.position, this.stack.length);
            this.stack.push(piece);
            let pathHeight = this.gameboard.getTallestInPath(oldPos, this.position);
            await this.animator.addAnimation(
                new MyMovementAnimation(piece, piece.transform.clone(), piece.generateOwnTransform(), pathHeight)
            );
        } else {
            piece.updatePositionInBoard(this.position, this.stack.length, true);
            this.stack.push(piece);
        }
    }

    getTopPiece() {
        return this.stack.length == 0 ? null : this.stack[this.stack.length - 1];
    }

    async movePiece(toCoords, animate=false) {
        let destinationTile = this.gameboard.getTile(toCoords[0], toCoords[1]);
        let topPiece = this.stack.pop();
        await destinationTile.addExistingPiece(topPiece, animate);
    }

    display() {
        // if (this.selectable)
        this.scene.registerForPick(this.uniqueId, this);

        this.scene.pushMatrix();
        this.scene.translate(this.position[1] + 0.5, 0, this.position[0] + 0.5);
        MyTile.tile.display();
        this.scene.popMatrix();

        // if (this.selectable)
        this.scene.clearPickRegistration();

        for (let i = 0; i < this.stack.length; i++) {
            this.stack[i].display();
        }
    }
}