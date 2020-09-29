class MyNode {
    // material, textura -> clear, null, id
    
    /**
     * Constructor
     * @param {string} materialId 
     * @param {string} textureId 
     * @param {int[]} transformationMatrix 
     * @param {XMLscene} xmlScene 
     * @param {string[]} descendants
     */
    constructor(materialId, textureId, transformationMatrix, xmlScene, descendants) {
        this.material = materialId;
        this.texture = textureId;
        this.matrix = transformationMatrix;
        this.scene = xmlScene;
        this.children = descendants;
    }

    getReferences() {

    }

    display() {

    }
}
