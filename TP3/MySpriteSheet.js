const TEXT_SPRITE_SHEET = "images/textspritesheet.png";
const TEXT_SPRITE_SHEET_M = 16;
const TEXT_SPRITE_SHEET_N = 8;

class MySpriteSheet {

    static rectangle = null;

    constructor(scene, texture, sizeM, sizeN, shader=null) {
        this.scene = scene;
        if (MySpriteSheet.rectangle === null) {
            MySpriteSheet.rectangle = new MyRectangle(this.scene, -0.5, -0.5, 0.5, 0.5, 1, 1);
        }
        if (shader == null) {
            this.shader = new CGFshader(this.scene.gl, "shaders/spriteSheet.vert", "shaders/spriteSheet.frag");
        }
        else {
            this.shader = shader;
        }
        this.texture = texture;
        this.sizeM = sizeM;
        this.sizeN = sizeN;
    }

    activateCellMN(m, n) {
        this.shader.setUniformsValues({
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
        this.scene.pushShader(this.shader);
    }

    deapply() {
        this.scene.popTexture();
        this.scene.popShader();
    }

    display() {
        MySpriteSheet.rectangle.display();
    }

}

class MySpriteText {

    static textSheet = null;

    constructor(scene, text){
        this.scene = scene;
        this.lines = text.split('\n');
        if (MySpriteText.textSheet === null) {
            MySpriteText.textSheet = new MySpriteSheet(this.scene, new CGFtexture(this.scene, TEXT_SPRITE_SHEET), TEXT_SPRITE_SHEET_M, TEXT_SPRITE_SHEET_N, new CGFshader(this.scene.gl, "shaders/textSpriteSheet.vert", "shaders/textSpriteSheet.frag"));
        }
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
            MySpriteText.textSheet.activateCellP(this.getCharacterPosition(character));
            MySpriteText.textSheet.display();
            this.moveMatrixRight(1);
        }
    }

    display() {
        MySpriteText.textSheet.apply();

        let oldMatrix = this.scene.activeMatrix;

        let height = this.lines.length / 2.0;
        let mat = mat4.create();
        for (let i = 0; i < this.lines.length; i++) {
            mat4.translate(mat, oldMatrix, [-this.lines[i].length / 2 + 0.5, height - i - 0.5, 0]);
            this.scene.setMatrix(mat);
            this._displayLine(this.lines[i]);
        }

        this.scene.activeMatrix = oldMatrix;
        MySpriteText.textSheet.deapply();
    }

}

class MySpriteAnimation {

    constructor(spriteSheet, startCell, endCell, animationTime, ssid){
        this.ssid = ssid;
        this.spriteSheet = spriteSheet;
        this.startCell = startCell;
        this.endCell = endCell;
        this.animationTime = animationTime;
        this.currentCell = 0;
        this.cellAmount = Math.abs(this.endCell - this.startCell) + 1;
        this.inverted = this.endCell < this.startCell ? -1 : 1;
    }

    preProcess(graphScene){
        if(typeof(this.spriteSheet = graphScene.getSpriteSheet(this.ssid)) === "undefined") {
            graphScene.onXMLMinorError("SpriteSheet with id: " + this.ssid + " could not be found");
        }

    }

    update(t) {
        this.currentCell = Math.floor(t / this.animationTime * this.cellAmount);
        this.currentCell = this.currentCell % this.cellAmount;
    }
    
    display(){
        this.spriteSheet.apply();
        this.spriteSheet.activateCellP(this.startCell + this.inverted * this.currentCell);
        this.spriteSheet.display();
        this.spriteSheet.deapply();
    }

}
