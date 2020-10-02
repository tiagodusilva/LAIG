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
     * @param {int} aft
     * @param {int} afs
     * @param {mat4} transformationMatrix 
     * @param {string or CGFobject} descendants
     * @param {XMLscene} xmlScene
     */
    constructor(nodeId, materialId, textureId, aft, afs, transformationMatrix, descendants, xmlScene) {
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
        else if (typeof(this.material = graphScene.getMaterial(this.materialId)) === "undefined") {
            graphScene.onXMLMinorError("Node with id '" + this.id + "' has an invalid material: Using parent's material");
            this.materialStatus = MaterialStatus.KEEP;
        }
        else {
            this.materialStatus = MaterialStatus.SET;
        }
        
        // Process texture
        if (this.textureId === "null") {
            this.textureStatus = TextureStatus.KEEP;
        }
        else if (this.textureId === "clear") {
            this.textureStatus = TextureStatus.DEFAULT;
            this.texture = null;
        }
        else if (typeof(this.texture = graphScene.getTexture(this.textureId)) === "undefined") {
            graphScene.onXMLMinorError("Node with id '" + this.id + "' has an invalid texture: Using default texture");
            this.textureStatus = TextureStatus.DEFAULT;
            this.texture = null;
        }
        else {
            this.textureStatus = TextureStatus.SET;
        }

        // Process descendants
        var result = [];
        var aNode = null;
        for (let i = 0; i < this.children.length; i++) {
            if (typeof this.children[i] !== "string") {
                // It's a leaf node (primitive)
                result.push(this.children[i]);
            }
            else {
                // It's another regular node
                if (typeof(aNode = graphScene.getNode(this.children[i])) === "undefined") {
                    graphScene.onXMLMinorError("Could not find descendant with id '" + this.children[i] + "' whilst pre-processing node with id '" + this.id + "': Ignoring descendant");
                }
                else {
                    result.push(aNode);
                }
            }
        }

        this.children = result;

        if (result.length == 0) {
            graphScene.onXMLMinorError("TO DO\nEliminate nodes with no descendants due to errors\nTO DO\n");
        }
        
    }

    display() {
        this.scenePush();

        this.children.forEach(child => {
            child.display();
        });

        this.scenePop();
    }

    scenePush() {
        this.scene.pushMatrix();
        this.scene.multMatrix(this.matrix);

        switch (this.materialStatus) {
            case MaterialStatus.SET:
                this.scene.pushMaterial(this.material);
                break;
            case MaterialStatus.DEFAULT:
                this.scene.pushMaterial(this.scene.defaultAppearance);
                break;
            default:
                break;
        }

        if (this.textureStatus != TextureStatus.KEEP){
            this.scene.pushTexture(this.texture);
        }
    }

    scenePop() {
        this.scene.popMatrix();

        if (this.materialStatus != MaterialStatus.KEEP){
            this.scene.popMaterial();
        }
        if (this.textureStatus != TextureStatus.KEEP){
            this.scene.popTexture();
        }
    }

    /**
     * Only updates direct descendant
     * @param {bool} val 
     */
    setNormalViz(val) {
        for (let descendant of this.children)
            if (descendant instanceof CGFobject)
                descendant.setNormalViz(val);
    }

}