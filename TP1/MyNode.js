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
     * @param {string[]} descendants
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


        if (this.materialStatus == MaterialStatus.SET){
            this.scene.pushMaterial(this.material);
        } else if (this.materialStatus == MaterialStatus.DEFAULT){
            this.scene.pushMaterial(this.scene.defaultAppearance);
        } else if (this.materialStatus == MaterialStatus.KEEP){
            //Do nothing
        }

        if (this.textureStatus == TextureStatus.SET){
            this.scene.pushTexture(this.texture);
        } else if (this.textureStatus == TextureStatus.DEFAULT){
            this.scene.pushMaterial();
        } else if (this.textureStatus == TextureStatus.KEEP){
            //Do nothing
        }

        this.scene.pushMatrix();
        this.scene.multMatrix(this.transformationMatrix);

        this.children.forEach(child => {
            child.display;
        });
        this.scene.popMatrix();

        if (this.materialStatus != MaterialStatus.KEEP){
            this.scene.popMaterial();
        }
        if (this.textureStatus != TextureStatus.KEEP){
            this.scene.popTexture();
        }

    }
}