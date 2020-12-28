// STACK CONTENTS
// 1 : White Ring
// 2 : Black Ring
// 3 : White Ball
// 4 : Black Ball

const PieceType = {
    WHITE_RING: 1, 
    BLACK_RING: 2, 
    WHITE_BALL: 3,
    BLACK_BALL: 4
}


class MyPiece {

    static ringHeight = 0.25;

    static pieces = new Map([
        [PieceType.WHITE_RING, null],
        [PieceType.WHITE_BALL, null],
        [PieceType.BLACK_RING, null],
        [PieceType.BLACK_BALL, null]
    ]);

    static generateTransform(position, height) {
        return new Transform([position[1], MyPiece.ringHeight * (height + 1), position[0]], [0, 0, 0], [1, 1, 1]);
    }

    generateOwnTransform() {
        return new Transform([this.position[1], MyPiece.ringHeight * (this.height + 1), this.position[0]], [0, 0, 0], [1, 1, 1]);
    }

    updatePositionInBoard(position, height, moveToPosition=false) {
        this.position = position;
        this.height = height;
        if (moveToPosition)
            this.transform = this.generateOwnTransform();
    }

    updatePieceModel() {
        this.piece = MyPiece.pieces.get(this.type);
    }

    constructor (scene, animator, type, position, height, selectable){
        this.scene = scene;
        this.animator = animator;
        this.type = type;
        this.selectable = selectable;
        this.uniqueId = this.scene.currentUniqueId++;
        this.selected = false;

        this.updatePositionInBoard(position, height, true);
        this.updatePieceModel();
    }

    onSelect() {
        this.animator.addAnimation(new MyHoverAnimation(this, true));
    }

    onDeselect() {
        this.animator.addAnimation(new MyHoverAnimation(this, false));
    }

    display() {
        // if (this.selectable)
        this.scene.registerForPick(this.uniqueId, this);

        this.scene.pushMatrix();
        this.scene.multMatrix(this.transform.getMatrix());
        this.piece.display();
        this.scene.popMatrix();

        // if (this.selectable)
        this.scene.clearPickRegistration();
    }
}