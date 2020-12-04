class MyTile {
    constructor(scene, gameboard) {
        this.scene = scene;
        this.gameboard = gameboard; 
        this.stack = []; /* stack is the name used in our prolog game */
        this.tile = new Plane(scene, 2, 2);
    }

    addPiece(piece){
        this.stack.push(piece);
    }

    removePiece() {
        return this.stack.pop();
    }

    getTopPiece() {
        return this.stack.length == 0 ? null : this.stack[this.stack.length - 1];
    }

    display() {
        this.tile.display();
        for (let i = 0; i < this.stack.length; i++) {
            this.scene.pushMatrix();
            this.scene.rotate(-Math.PI/2, 1, 0, 0);
            this.scene.translate(0, 0, 0.25 * (i + 1));
            this.stack[i].display();
            this.scene.popMatrix();
        }
    }
}