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



    update() {

    }
}