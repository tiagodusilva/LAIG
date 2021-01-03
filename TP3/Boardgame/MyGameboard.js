const Player = {
    WHITE: 0,
    BLACK: 1
}

const AUX_BOARD = -1;

function translatePosToProlog(pos) {
    return pos[0] === AUX_BOARD ? [AUX_BOARD, AUX_BOARD] : pos;
}

class MyGameboard {
    constructor(scene, animator) {
        this.scene = scene;
        this.animator = animator;
        this.initBoard();
    }

    resetBoard() {
        this.initBoard();
    }

    toGameStateString() {
        let result = "[[";
        for (let i = 0; i < this.board.length; i++) {
            result += "[";
            for (let j = 0; j < this.board[i].length; j++) {
                result += "[" + this.board[i][j].getStackTypes().toString() + "]";
                if (j != this.board[i].length - 1) {
                    result += ",";
                }
            }
            result += "]";
            if (i != this.board.length - 1) {
                result += ",";
            }
        }
        result += "]," +
            this.auxBoard[Player.WHITE].getPieceAmount() + "," +
            this.auxBoard[Player.BLACK].getPieceAmount() + ",3]";
        return result;
    }

    initBoard() {
        // Create main board
        this.board = [];
        for (let i = 0; i < 5; i++) {
            let aux = [];
            for (let j = 0; j < 5; j++) {
                aux.push(new MyTile(this.scene, this.animator, this, [i, j]));
            }
            this.board.push(aux);
        }
        this.placeStartingPieces();


        // Create auxiliary board
        this.auxBoard = [
            new MyTile(this.scene, this.animator, this, [-1, Player.WHITE], Player.WHITE),
            new MyTile(this.scene, this.animator, this, [-1, Player.BLACK], Player.BLACK)
        ];
        for (let i = 0; i < 5; i++) {
            //0 : White
            //1 : Black
            //i == 5 is for the selectable pieces
            this.auxBoard[Player.WHITE].addNewPiece(PieceType.WHITE_RING, i == 4);
            this.auxBoard[Player.BLACK].addNewPiece(PieceType.BLACK_RING, i == 4);
        }
    }

    placeStartingPieces() {
        this.addNewPiece(3, 0, PieceType.WHITE_RING, false);
        this.addNewPiece(3, 0, PieceType.WHITE_BALL, true);

        this.addNewPiece(4, 0, PieceType.WHITE_RING, false);
        this.addNewPiece(4, 0, PieceType.WHITE_BALL, true);

        this.addNewPiece(4, 1, PieceType.WHITE_RING, false);
        this.addNewPiece(4, 1, PieceType.WHITE_BALL, true);

        this.addNewPiece(0, 3, PieceType.BLACK_RING, false);
        this.addNewPiece(0, 3, PieceType.BLACK_BALL, true);

        this.addNewPiece(0, 4, PieceType.BLACK_RING, false);
        this.addNewPiece(0, 4, PieceType.BLACK_BALL, true);

        this.addNewPiece(1, 4, PieceType.BLACK_RING, false);
        this.addNewPiece(1, 4, PieceType.BLACK_BALL, true);
    }

    forEachPiece(func) {
        for (let row of this.board)
            for (let tile of row)
                tile.forEachPiece(func);
        for (let tile of this.auxBoard)
            tile.forEachPiece(func);
    }

    getTile(row, col) {
        return row == AUX_BOARD ? this.auxBoard[col] : this.board[row][col];
    }

    getTilePos(tile) {
        for (let row = 0; row < 5; row++) {
            for (let col = 0; col < 5; col++) {
                if (tile == this.board[row][col])
                    return [row, col];
            }
        }
        //Iterate over the auxiliary board
        for (let i in [Player.WHITE, Player.BLACK]) {
            if (tile == this.auxBoard[i]) {
                return [AUX_BOARD, i];
            }
        }
    }

    addNewPiece(row, col, piece_type, selectable){
        this.getTile(row, col).addNewPiece(piece_type, selectable);
    }

    getTallestInPath(fromCoords, toCoords) {
        let from = [...fromCoords], to = [...toCoords];
        let v = [toCoords[0] - fromCoords[0], toCoords[1] - fromCoords[1]];
        let h = 0;

        if (v[0] == 0 && v[1] == 0)
            return 0;

        if (fromCoords[0] == AUX_BOARD)
            return 0;
        
        let d = Math.sqrt((fromCoords[0]-toCoords[0])**2 + (fromCoords[1]-toCoords[1])**2);
        if (d <= Math.sqrt(2))
            return 0;
        
        if (Math.abs(v[0]) == Math.abs(v[1]) || (v[0] == 0 && v[1] != 0) || (v[0] != 0 && v[1] == 0)) {

            v[0] = v[0] == 0 ? 0 : ((v[0] > 0) ? 1 : -1);
            v[1] = v[1] == 0 ? 0 : ((v[1] > 0) ? 1 : -1);

            from[0] += v[0];
            from[1] += v[1];

            while (from[0] != to[0] || from[1] != to[1]) {
                h = Math.max(h, this.getTile(from[0], from[1]).stack.length);
                from[0] += v[0];
                from[1] += v[1];
            }
        }

        return MyPiece.ringHeight * (h + 1.5);
    }

    //Maybe change for two Vec2
    async movePiece(fromRow, fromCol, toRow, toCol) {
        await this.getTile(fromRow, fromCol).movePiece([toRow, toCol], true);
    }

    //Maybe change for two Vec2
    async displaceBall(fromRow, fromCol, toRow, toCol) {

        if (toRow === AUX_BOARD || toCol === AUX_BOARD) {
            return false;
        }

        let fromPiece = this.getTile(fromRow, fromCol).getTopPiece();
        let fromPieceType;
        if (fromPiece) {
            fromPieceType = fromPiece.type;
        } else {
            return false;
        }

        let toPiece = this.getTile(toRow, toCol).getTopPiece();
        let toPieceType;
        if (toPiece) {
            toPieceType = toPiece.type;
        } else {
            return false;
        }

        if (fromPieceType === PieceType.WHITE_BALL && toPieceType === PieceType.WHITE_RING) {
            await this.movePiece(fromRow, fromCol, toRow, toCol);
            return true;
        } else if (fromPieceType === PieceType.BLACK_BALL && toPieceType === PieceType.BLACK_RING) {
            await this.movePiece(fromRow, fromCol, toRow, toCol);
            return true;
        } else {
            return false;
        }

    }

    display() {
        this.board.forEach(line => {
            line.forEach(tile => {
                tile.display();
            });
        });

        this.auxBoard.forEach(tile => {
            tile.display();
        });
    }

    makeTopBallsSelectable(player) {
        for (let i = 0; i < this.board.length; i++) {
            for (let j = 0; j < this.board[i].length; j++) {
                let piece = this.board[i][j].getTopPiece();

                if (piece !== null) {
                    if (piece.type === PieceType.BLACK_BALL && player == Player.BLACK) {
                        piece.selectable = true;
                    } else if (piece.type === PieceType.WHITE_BALL && player === Player.WHITE) {
                        piece.selectable = true;
                    } else {
                        piece.selectable = false;
                    }
                }
            }
        }

        for (let i in [Player.WHITE, Player.BLACK]) {
            let piece = this.auxBoard[i].getTopPiece();
            if (piece) {
                piece.selectable = false;
            }
        }

    }

    makeTopRingsSelectable(player) {
        for (let i = 0; i < this.board.length; i++) {
            for (let j = 0; j < this.board[i].length; j++) {
                let piece = this.board[i][j].getTopPiece();
                if (piece !== null) {
                    if (piece.type === PieceType.BLACK_RING && player == Player.BLACK) {
                        piece.selectable = true;
                    } else if (piece.type === PieceType.WHITE_RING && player === Player.WHITE) {
                        piece.selectable = true;
                    } else {
                        piece.selectable = false;
                    }
                }
            }
        }

        let piece = this.auxBoard[Player.WHITE].getTopPiece();
        if (piece) {
            piece.selectable = player == Player.WHITE;
        }
        piece = this.auxBoard[Player.BLACK].getTopPiece();
        if (piece) {
            piece.selectable = player == Player.BLACK;
        }
    }

    makeBallsToDisplaceSelectable(ballsToDisplace) {
        for (let i = 0; i < this.board.length; i++) {
            for (let j = 0; j < this.board[i].length; j++) {
                let piece = this.board[i][j].getTopPiece();
                if (piece !== null) {
                    let toDisplace = false;
                    ballsToDisplace.forEach(element => {
                        if (element[0] === i && element[1] === j) {
                            piece.selectable = true;
                            toDisplace = true;
                        }
                    });
                    if (!toDisplace) {
                        piece.selectable = false;
                    }
                }
            }
        }
    }

    makeNothingSelectable() {
        for (let i = 0; i < this.board.length; i++) {
            for (let j = 0; j < this.board[i].length; j++) {
                let piece = this.board[i][j].getTopPiece();
                if (piece !== null) {
                    piece.selectable = false;
                }
            }
        }
    }
}