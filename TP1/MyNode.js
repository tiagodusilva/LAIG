const MaterialStatus = {
    DEFAULT: 0, KEEP: 1, SET: 2
}
const TextureStatus = {
    DEFAULT: 0, KEEP: 1, SET: 2
}

class MyNode {
    // material, textura -> clear, null, id
    
    /**
     * Constructor
     * @param {string} materialId 
     * @param {string} textureId 
     * @param {int[]} transformationMatrix 
     * @param {XMLscene} xmlScene 
     * @param {string or CGFobject} descendants
     */
    constructor(materialId, textureId, aft, afs, transformationMatrix, xmlScene, descendants) {
        this.materialId = materialId;
        this.material = null;
        this.materialStatus = null;
        this.textureId = textureId;
        this.texture = null;
        this.textureStatus = null;
        this.aft = aft;
        this.afs = afs;
        this.matrix = transformationMatrix;
        this.scene = xmlScene;
        this.children = descendants;
    }

    preProcess() {

    }

    display() {

    }
}