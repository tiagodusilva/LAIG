const TEXT_SPRITE_SHEET = "a";
const TEXT_SPRITE_SHEET_M = 16;
const TEXT_SPRITE_SHEET_N = 8;


class MySpriteSheet {
    constructor(texture, sizeM, sizeN){
        this.texture = texture;
        this.sizeM = sizeM;
        this.sizeN = sizeN;
    }

    activateCellMN(m, n) {

    }

    activateCellP(p) {
        this.activateCellMN(p % sizeN, Math.floor(p / sizeN));
    }


}

class MySpriteText {

    static textSheet = new MySpriteSheet(TEXT_SPRITE_SHEET, TEXT_SPRITE_SHEET_M, TEXT_SPRITE_SHEET_N);

    constructor(scene, text){
        this.scene = scene;
        this.text = text;
        this.rectangle = new MyRectangle(scene, 0, 0, 1, 1, 1, 1);
    }

    getCharacterPosition(character) {
        return character.charCodeAt(0);
    }

    display() {
        let startMatrix = this.scene.activeMatrix;
        let translationMatrix;
        for(let character of this.text){
            this.textSheet.activateCellP(this.getCharacterPosition(character));
            this.rectangle.display();
            mat4.fromTranslation(translationMatrix, Vec3(1, 0, 0));
            this.scene.multMatrix(translationMatrix);
        }

        this.scene.setActiveMatrix(startMatrix);
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