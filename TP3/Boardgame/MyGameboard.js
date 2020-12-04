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
            this.auxBoard[Player.WHITE].addPiece(new MyPiece(this.scene, PieceType.WHITE_RING, this.auxBoard[0]));
            this.auxBoard[Player.BLACK].addPiece(new MyPiece(this.scene, PieceType.BLACK_RING, this.auxBoard[1]));
        }
    }

    placeStartingPieces(){
        this.addPiece(3, 0, PieceType.WHITE_RING);
        this.addPiece(3, 0, PieceType.WHITE_BALL);

        this.addPiece(4, 0, PieceType.WHITE_RING);
        this.addPiece(4, 0, PieceType.WHITE_BALL);

        this.addPiece(4, 1, PieceType.WHITE_RING);
        this.addPiece(4, 1, PieceType.WHITE_BALL);

        this.addPiece(0, 3, PieceType.BLACK_RING);
        this.addPiece(0, 3, PieceType.BLACK_BALL);

        // this.addPiece(0, 4, new MyPiece(this.scene, PieceType.BLACK_RING, this.board[0][4])); //Test purposes
        this.addPiece(0, 4, PieceType.BLACK_RING);
        this.addPiece(0, 4, PieceType.BLACK_BALL);

        this.addPiece(1, 4, PieceType.BLACK_RING);
        this.addPiece(1, 4, PieceType.BLACK_BALL);
    }

    getTile(row, col) {
        return this.board[row][col];
    }

    addPiece(row, col, piece_type){
        this.getTile(row, col).addPiece(new MyPiece(this.scene, piece_type, this.board[row][col]));
    }

    removePiece(row, col) {
        this.getTile(row, col).removePiece();
    }

    placeNewRing(row, col, player){
        this.auxBoard[player].removePiece();
        if(player == Player.WHITE)
            this.addPiece(row, col, PieceType.WHITE_RING);
        else if(player == Player.BLACK)
            this.addPiece(row, col, PieceType.BLACK_RING);
    }

    //Maybe change for two Vec2
    movePiece(fromRow, fromCol, toRow, toCol) {
        let pieceToMove = this.getTile(fromRow, fromCol).getTopPiece().type;
        this.removePiece(fromRow, fromCol);
        this.addPiece(toRow, toCol, pieceToMove);
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