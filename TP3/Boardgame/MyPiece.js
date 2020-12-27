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

    static generateTransform(position, height) {
        return new Transform([position[1], 0.25 * (height + 1), position[0]], [0, 0, 0], [1, 1, 1]);
    }

    updatePositionInBoard(position, height, moveToPosition=false) {
        this.position = position;
        if (moveToPosition)
            this.transform = MyPiece.generateTransform(position, height);
    }

    constructor (scene, type, position, height, selectable){
        this.scene = scene;
        this.type = type;
        this.selectable = selectable;
        this.uniqueId = this.scene.currentUniqueId++;
        this.selected = false;

        this.updatePositionInBoard(position, height, true);
        

        let blackMaterial = new MyCGFmaterial(this.scene);
        blackMaterial.setShininess(0.25);
        blackMaterial.setAmbient(0.05, 0.05, 0.05, 1);
        blackMaterial.setDiffuse(0.05, 0.05, 0.05, 1);
        blackMaterial.setSpecular(0.05, 0.05, 0.05, 1);
        blackMaterial.setEmission(0, 0, 0, 1);

        let whiteMaterial = new MyCGFmaterial(this.scene);
        whiteMaterial.setShininess(1);
        whiteMaterial.setAmbient(1, 1, 1, 1);
        whiteMaterial.setDiffuse(1, 1, 1, 1);
        whiteMaterial.setSpecular(1, 1, 1, 1);
        whiteMaterial.setEmission(0, 0, 0, 1);


        //TODO: Change materials
        switch (this.type) {
            case PieceType.WHITE_BALL:
                this.piece = new MySphere(scene, 20, 20, 0.25);
                this.material = whiteMaterial;
                break;
            case PieceType.BLACK_BALL:
                this.piece = new MySphere(scene, 20, 20, 0.25);
                this.material = blackMaterial;
                // Change later
                break;
            case PieceType.WHITE_RING:
                this.piece = new MyTorus(scene, 0.125, 0.25, 20, 20);
                this.material = whiteMaterial;
                break;
            case PieceType.BLACK_RING:
                this.piece = new MyTorus(scene, 0.125, 0.25, 20, 20);
                this.material = blackMaterial;
                break;
        }
    }

    display() {
        // if (this.selectable)
        this.scene.registerForPick(this.uniqueId, this);

        this.scene.pushMaterial(this.material);

        this.scene.pushMatrix();

        this.scene.multMatrix(this.transform.getMatrix());

        // TODO: Remove this once we do XML parseroo stuffs
        this.scene.rotate(-Math.PI/2, 1, 0, 0);

        if(this.selected){
            this.scene.translate(0, 0, 0.3);
        }
        this.piece.display();
        this.scene.popMatrix();
        this.scene.popMaterial();

        // if (this.selectable)
        this.scene.clearPickRegistration();
    }
}