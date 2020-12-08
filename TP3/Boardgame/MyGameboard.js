const Player = {
    WHITE : 0,
    BLACK : 1
}

class MyGameboard {
    constructor(scene) {
        this.scene = scene;
        this.whiteMaterial = new MyCGFmaterial(this.scene);
        this.whiteMaterial.setShininess(1);
        this.whiteMaterial.setAmbient(1, 1, 1, 1);
        this.whiteMaterial.setDiffuse(1, 1, 1, 1);
        this.whiteMaterial.setSpecular(1, 1, 1, 1);
        this.whiteMaterial.setEmission(0, 0, 0, 1);
        this.initBoard();

    }

    initBoard(){
        // Create main board
        this.board = [];
        for (let i = 0; i < 5; i++) {
            let aux = [];
            for (let j = 0; j < 5; j++) {
                aux.push(new MyTile(this.scene, this));
            }
            this.board.push(aux);
        }
        this.placeStartingPieces();


        // Create auxiliary board
        this.auxBoard = [new MyTile(this.scene, this), new MyTile(this.scene, this)];
        for (let i = 0; i < 5; i++) {
            //0 : White
            //1 : Black
            //i == 5 is for the selectable pieces
            this.auxBoard[Player.WHITE].addPiece(new MyPiece(this.scene, PieceType.WHITE_RING, this.auxBoard[0], i == 4));
            this.auxBoard[Player.BLACK].addPiece(new MyPiece(this.scene, PieceType.BLACK_RING, this.auxBoard[1], i == 4));
        }
    }

    placeStartingPieces(){
        this.addNewPiece(3, 0, PieceType.WHITE_RING, false);
        this.addNewPiece(3, 0, PieceType.WHITE_BALL, true);

        this.addNewPiece(4, 0, PieceType.WHITE_RING, false);
        this.addNewPiece(4, 0, PieceType.WHITE_BALL, true);

        this.addNewPiece(4, 1, PieceType.WHITE_RING, false);
        this.addNewPiece(4, 1, PieceType.WHITE_BALL, true);

        this.addNewPiece(0, 3, PieceType.BLACK_RING, false);
        this.addNewPiece(0, 3, PieceType.BLACK_BALL, true);

        // this.addPiece(0, 4, new MyPiece(this.scene, PieceType.BLACK_RING, this.board[0][4])); //Test purposes
        this.addNewPiece(0, 4, PieceType.BLACK_RING, false);
        this.addNewPiece(0, 4, PieceType.BLACK_BALL, true);

        this.addNewPiece(1, 4, PieceType.BLACK_RING, false);
        this.addNewPiece(1, 4, PieceType.BLACK_BALL, true);
    }

    getTile(row, col) {
        return this.board[row][col];
    }

    getTilePos(tile) {
        for (let row = 0; row < 5; row++) {
            for (let col = 0; col < 5; col++) {
                if(tile == this.board[row][col])
                    return [row, col];
            }
        }
    }

    addNewPiece(row, col, piece_type, selectable){
        this.getTile(row, col).addPiece(new MyPiece(this.scene, piece_type, this.board[row][col], selectable));
    }

    addPiece(row, col, piece) {
        this.getTile(row, col).addPiece(piece);
    }

    removePiece(row, col) {
        return this.getTile(row, col).removePiece();
    }

    placeNewRing(row, col, player){
        this.auxBoard[player].removePiece();
        if(player == Player.WHITE)
            this.addNewPiece(row, col, PieceType.WHITE_RING, true);
        else if(player == Player.BLACK)
            this.addNewPiece(row, col, PieceType.BLACK_RING, true);
    }

    //Maybe change for two Vec2
    movePiece(fromRow, fromCol, toRow, toCol) {
        this.addPiece(toRow, toCol, this.removePiece(fromRow, fromCol));
    }

    display() {

        // console.log("Hello");
        for (let i = 0; i < this.board.length; i++) {
            for (let j = 0; j < this.board[i].length; j++){
                this.scene.pushMatrix();
                this.scene.pushMaterial(this.whiteMaterial);
                this.scene.translate(i * 1.1, 0, j * 1.1);
                //j and i are switched to follow our game standard
                this.getTile(j, i).display();
                this.scene.popMaterial();
                this.scene.popMatrix();
            }
        }

        //Auxiliary board
        this.scene.pushMatrix();
        this.scene.pushMaterial(this.whiteMaterial);
        this.scene.translate(-1.5, 0, 3);
        this.auxBoard[Player.WHITE].display();
        this.scene.popMaterial();
        this.scene.popMatrix();

        this.scene.pushMatrix();
        this.scene.pushMaterial(this.whiteMaterial);
        this.scene.translate(-1.5, 0, 1);
        this.auxBoard[Player.BLACK].display();
        this.scene.popMaterial();
        this.scene.popMatrix();

    }
}