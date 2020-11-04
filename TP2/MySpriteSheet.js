const TEXT_SPRITE_SHEET = "images/textspritesheet.png";
const TEXT_SPRITE_SHEET_M = 16;
const TEXT_SPRITE_SHEET_N = 8;


class MySpriteSheet {
    
    static shader = null;
    static rectangle = null;

    constructor(scene, texture, sizeM, sizeN){
        this.scene = scene;
        this.texture = texture;
        this.sizeM = sizeM;
        this.sizeN = sizeN;
        if (MySpriteText.rectangle == null) {
            MySpriteText.rectangle = new MyRectangle(scene, 0, 0, 1, 1, 1, 1);
        }
    }

    static initShader(gl) {
        MySpriteSheet.shader = new CGFshader(gl, "shaders/spritesheet.vert", "shaders/spritesheet.frag");
    }

    activateCellMN(m, n) {
        MySpriteSheet.shader.setUniformsValues({
            M: this.sizeM,
            N: this.sizeN,
            m: m,
            n: n
        });
    }

    activateCellP(p) {
        this.activateCellMN(p % this.sizeM, Math.floor(p / this.sizeM));
    }

    apply() {
        this.scene.pushTexture(this.texture);
        this.scene.pushShader(MySpriteSheet.shader);
    }

    deapply() {
        this.scene.popTexture();
        this.scene.popShader();
    }

}

class MySpriteText {

    static textSheet = null;

    constructor(scene, text){
        if (MySpriteText.textSheet === null) {
            MySpriteText.textSheet = new MySpriteSheet(new CGFtexture(scene, TEXT_SPRITE_SHEET), TEXT_SPRITE_SHEET_M, TEXT_SPRITE_SHEET_N);
        }
        this.scene = scene;
        this.lines = text.split('\n');
    }

    getCharacterPosition(character) {
        return character.charCodeAt(0) - 32;
    }

    moveMatrixRight(pos) {
        let translationMatrix;
        translationMatrix = mat4.create();
        mat4.translate(translationMatrix, translationMatrix, [pos, 0, 0]);
        this.scene.multMatrix(translationMatrix);
    }

    _displayLine(line) {
        for(let character of line){
            MySpriteSheet.textSheet.activateCellP(this.getCharacterPosition(character));
            MySpriteSheet.rectangle.display();
            this.moveMatrixRight(1);
        }
    }

    display() {
        MySpriteText.textSheet.apply(this.scene);

        let oldMatrix = this.scene.activeMatrix;

        let height = this.lines.length / 2;
        let mat = mat4.create();
        for (let i = 0; i < this.lines.length; i++) {
            mat4.translate(mat, oldMatrix, [-this.lines[i].length / 2, height - i, 0]);
            this.scene.setMatrix(mat);
            this._displayLine(this.lines[i]);
        }

        this.scene.activeMatrix = oldMatrix;
        MySpriteText.textSheet.deapply(this.scene);
    }

}

class MySpriteAnimation {

    constructor(spriteSheet, startCell, endCell, animationTime, ssid){
        this.ssid = ssid;
        this.spriteSheet = spriteSheet;
        this.startCell = startCell;
        this.endCell = endCell;
        this.animationTime = animationTime;
        this.currentCell = this.startCell;
        this.cellAmount = Math.abs(this.endCell - this.startCell);
        this.inverted = this.endCell < this.startCell;
    }

    preProcess(graphScene){
        if(typeof(this.spriteSheet = graphScene.getSpriteSheet(this.ssid)) === "undefined") {
            graphScene.onXMLMinorError("SpriteSheet with id: " + this.ssid + " could not be found");
        }

    }

    update(t) {
        this.currentCell = Math.floor(t / this.animationTime * this.cellAmount);
    }
    
    display(){
        this.spriteSheet.apply();
        MySpriteSheet.rectangle.display();
        this.spriteSheet.activateCellP(this.inverted ? this.endCell - this.currentCell : this.startCell + this.currentCell);
        this.spriteSheet.deapply();
    }

}