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
     * @param {string} nodeId
     * @param {string} materialId 
     * @param {string} textureId 
     * @param {int[]} transformationMatrix 
     * @param {XMLscene} xmlScene 
     * @param {string[]} descendants
     */
    constructor(nodeId, materialId, textureId, aft, afs, transformationMatrix, xmlScene, descendants) {
        this.id = nodeId;
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

    /**
     * Preprocesses a given node
     * @param {MySceneGraph} graphScene 
     */
    preProcess(graphScene) {
        // Process material
        if (this.materialId === "null") {
            this.materialStatus = MaterialStatus.KEEP;
        }
        else if (ALLOW_CLEAR_MATERIAL && this.material === "clear") {
            this.materialStatus = MaterialStatus.DEFAULT;
        }
        else if ((this.material = graphScene.getMaterial(this.materialId)) === undefined) {
            graphScene.onXMLMinorError("Node with id '" + this.id + "' has an invalid texture: Using parent's appearance");
            this.materialStatus = MaterialStatus.DEFAULT;
        }
        
        // Process texture
        if (this.textureId === "null") {
            this.textureStatus = TextureStatus.KEEP;
        }
        else if (this.textureId === "clear") {
            this.textureStatus = TextureStatus.DEFAULT;
        }
        else if ((this.texture = graphScene.getTexture(this.textureId)) === undefined) {
            graphScene.onXMLMinorError("Node with id '" + this.id + "' has an invalid texture: Using default texture");
            this.textureStatus = TextureStatus.DEFAULT;
        }

        // Process descendants
        var children = this.children;
        this.children = [];
        var aNode = null;
        for (let i = 0; i < children.length; i++) {
            if (typeof child[i] !== String) {
                // It's a leaf node (primitive)
                this.children.push(child[i]);
            }
            else {
                // It's another regular node
                if ((aNode = graphScene.getNode(child[i])) === undefined) {
                    graphScene.onXMLMinorError("Could not find descendant with id '" + child[i] + "' whilst pre-processing node with id '" + this.id + "': Ignoring descendant");
                }
                else {
                    this.children.push(aNode);
                }
            }
        }

        if (this.children.length == 0) {
            this.scene.onXMLMinorError("TO DO\nEliminate nodes with no descendants due to errors\nTO DO\n");
        }
        
    }

    display() {

        switch (this.materialStatus) {
            case MaterialStatus.SET:
                this.scene.pushMaterial(this.material);
            case MaterialStatus.DEFAULT:
                this.scene.pushMaterial(this.scene.defaultAppearance);
            default:
                break;
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