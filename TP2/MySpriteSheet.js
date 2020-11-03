class MySpriteSheet {
    constructor(texture, sizeM, sizeN){
        this.texture = texture;
        this.sizeM = sizeM;
        this.sizeN = sizeN;
    }

    activateCellMN(m, n) {

    }

    activateCellP(p) {
        this.activateCellMN(p % n, Math.floor(p / n));
    }


}

class MySpriteText {

    static spriteSheetName = new MySpriteSheet("a", 5, 5);

    constructor(scene, text){
        this.scene = scene;
        this.text = text;
    }

    getCharacterPosition(character) {
        
    }

    display() {

    }

}

class MySpriteAnimation {

    constructor(spriteSheet, startCell, endCell, animationTime){
        this.spriteSheet = spriteSheet;
        this.startCell = startCell;
        this.endCell = endCell;
        this.animationTime = animationTime;
    }

    update(t) {

    }
}