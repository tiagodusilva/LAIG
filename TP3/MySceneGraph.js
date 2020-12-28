const DEGREE_TO_RAD = Math.PI / 180;
const INDEX_NOT_FOUND = -1;
const ALLOW_CLEAR_MATERIAL = false;

function instantCompare(f1, f2) {
    return f1.instant - f2.instant;
}

/**
 * MySceneGraph class, representing the scene graph.
 */
class MySceneGraph {

    /**
     * Constructor for MySceneGraph class.
     * Initializes necessary variables and starts the XML file reading process.
     * @param {string} filename - File that defines the 3D scene
     * @param {XMLScene} scene
     */
    constructor(filename, scene) {
        this.loadedOk = null;

        // Establish bidirectional references between scene and graph.
        this.scene = scene;
        scene.graph = this;

        this.idRoot = null; // The id of the root element.

        this.axisCoords = [];
        this.axisCoords['x'] = [1, 0, 0];
        this.axisCoords['y'] = [0, 1, 0];
        this.axisCoords['z'] = [0, 0, 1];

        this.spriteAnims = [];

        // File reading 
        this.reader = new CGFXMLreader();

        /*
         * Read the contents of the xml file, and refer to this class for loading and error handlers.
         * After the file is read, the reader calls onXMLReady on this object.
         * If any error occurs, the reader calls onXMLError on this object, with an error message
         */
        this.reader.open('scenes/' + filename, this);
    }

    /**
     * Enables/disables all normals of the graph
     * @param {bool} val 
     */
    setNormalViz(val) {
        for (let node of this.nodes.values()) {
            node.setNormalViz(val);
        }
    }

    /*
     * Callback to be executed after successful reading
     */
    onXMLReady() {
        this.log("XML Loading finished.");
        var rootElement = this.reader.xmlDoc.documentElement;

        // Here should go the calls for different functions to parse the various blocks
        var error = this.parseXMLFile(rootElement);

        if (error != null) {
            this.onXMLError(error);
            return;
        }

        // Pre-process nodes and other information
        console.log("Read XML: Pre-processing nodes");
        if ((error = this.preProcessing()) != null) {
            this.onXMLError(error);
            return;
        }
        console.log("Finished pre-processing nodes");

        this.loadedOk = true;

        // Set verification for textures
        window.setTimeout(this.validateTextures.bind(this), 2*1000);

        // As the graph loaded ok, signal the scene so that any additional initialization depending on the graph can take place
        this.scene.onGraphLoaded();
    }

    preProcessing() {
        this.rootNode = this.getNode(this.idRoot);
        if (this.rootNode === undefined) {
            return "Root node does not exist (id = '" + this.idRoot + "')";
        }
        for (let node of this.nodes.values()) {
            node.preProcess(this);
        }
        for (let spriteAnim of this.spriteAnims.values()){
            spriteAnim.preProcess(this);
        }

        // Check for root node inconsistencies
        if (this.rootNode.textureStatus == TextureStatus.KEEP) {
            this.onXMLMinorError("Root node should not have texture set to 'null', using default texture");
        }
        if (this.rootNode.materialStatus == MaterialStatus.KEEP) {
            this.onXMLMinorError("Root node should not have material set to 'null', using default CGFappearance material");
        }
    }

    validateTextures() {
        for (let [texId, tex] of this.textures.entries()) {
            if (tex.texID == -1) {
                this.onXMLMinorError("Texture with id '" + texId + "hasn't loaded yet, it may be incorrect");
            }
        }
    }

    /*
     * Callback to be executed on any read error, showing an error on the console.
     * @param {string} message
     */
    onXMLError(message) {
        console.error("XML Loading Error: " + message);
        this.loadedOk = false;
    }

    /**
     * Callback to be executed on any minor error, showing a warning on the console.
     * @param {string} message
     */
    onXMLMinorError(message) {
        console.warn("Warning: " + message);
    }

    /**
     * Callback to be executed on any message.
     * @param {string} message
     */
    log(message) {
        console.log("   " + message);
    }
    
    /**
     * Gets the animation with given id
     * Returns undefined if it doesn't exist
     * @param {string} animationId 
     */
    getAnimation(animationId) {
        return this.animations.get(animationId);
    }

    /**
     * Gets the spritesheet with given id
     * Returns undefined if it doesn't exist
     * @param {string} spritesheetId 
     */
    getSpriteSheet(spritesheetId) {
        return this.spritesheets.get(spritesheetId);
    }

    /**
     * Gets the material with given id
     * Returns undefined if it doesn't exist
     * @param {string} materialId 
     */
    getMaterial(materialId) {
        return this.materials.get(materialId);
    }

    /**
     * Gets the texture with given id
     * Returns undefined if it doesn't exist
     * @param {string} textureId 
     */
    getTexture(textureId) {
        return this.textures.get(textureId);
    }

    /**
     * Gets the node with given id
     * Returns undefined if it doesn't exist
     * @param {string} nodeId 
     */
    getNode(nodeId) {
        return this.nodes.get(nodeId);
    }

    /**
     * Parses the XML file, processing each block.
     * @param {XML root element} rootElement
     */
    parseXMLFile(rootElement) {
        if (rootElement.nodeName != "lsf")
            return "root tag <lsf> missing";

        var nodes = rootElement.children;

        // Reads the names of the nodes to an auxiliary buffer.
        var nodeNames = [];

        for (var i = 0; i < nodes.length; i++) {
            nodeNames.push(nodes[i].nodeName);
        }

        var error;

        // Processes each node, verifying errors.
        let indexOrder = new Map();

        // <initials>
        var index;
        if ((index = nodeNames.indexOf("initials")) == INDEX_NOT_FOUND)
            return "tag <initials> missing";
        else {
            //Parse initials block
            if ((error = this.parseInitials(nodes[index])) != null)
                return error;
        }
        indexOrder.set("initials", index);

        // <views>
        if ((index = nodeNames.indexOf("views")) == INDEX_NOT_FOUND)
            return "tag <views> missing";
        else {
            //Parse views block
            if ((error = this.parseViews(nodes[index])) != null)
                return error;
        }
        indexOrder.set("views", index);


        // <illumination>
        if ((index = nodeNames.indexOf("illumination")) == INDEX_NOT_FOUND)
            return "tag <illumination> missing";
        else {
            //Parse illumination block
            if ((error = this.parseIllumination(nodes[index])) != null)
                return error;
        }
        indexOrder.set("illumination", index);

        // <lights>
        if ((index = nodeNames.indexOf("lights")) == INDEX_NOT_FOUND)
            return "tag <lights> missing";
        else {
            //Parse lights block
            if ((error = this.parseLights(nodes[index])) != null)
                return error;
        }
        indexOrder.set("lights", index);
        
        // <textures>
        if ((index = nodeNames.indexOf("textures")) == INDEX_NOT_FOUND)
            return "tag <textures> missing";
        else {
            //Parse textures block
            if ((error = this.parseTextures(nodes[index])) != null)
                return error;
        }
        indexOrder.set("textures", index);

        // <materials>
        if ((index = nodeNames.indexOf("materials")) == INDEX_NOT_FOUND)
            return "tag <materials> missing";
        else {
            //Parse materials block
            if ((error = this.parseMaterials(nodes[index])) != null)
                return error;
        }
        indexOrder.set("materials", index);

        // <nodes>
        if ((index = nodeNames.indexOf("nodes")) == INDEX_NOT_FOUND)
            return "tag <nodes> missing";
        else {
            //Parse nodes block
            if ((error = this.parseNodes(nodes[index])) != null)
                return error;
        }
        indexOrder.set("nodes", index);
        

        // <animations>
        if ((index = nodeNames.indexOf("animations")) == INDEX_NOT_FOUND) {
            this.animations = new Map();  // Do this to not break the rest of the code
        }
        else {
            indexOrder.set("animations", index);
            if ((error = this.parseAnimations(nodes[index])) != null) {
                return error;
            }
        }

        // <spritesheets>
        if ((index = nodeNames.indexOf("spritesheets")) == INDEX_NOT_FOUND) {
            this.spritesheets = new Map();  // Do this to not break the rest of the code
        }
        else  {
            indexOrder.set("spritesheets", index);
            if ((error = this.parseSpritesheets(nodes[index])) != null) {
                return error;
            }
        }

        // <game>
        if ((index = nodeNames.indexOf("game")) == INDEX_NOT_FOUND)
            return "tag <game> missing";
        else {
            //Parse game block
            if ((error = this.parseGame(nodes[index])) != null)
                return error;
        }
        indexOrder.set("game", index);
        

        // Order of the groups in the XML document.
        // initials -> views -> illumination -> lights -> textures -> spritesheet -> materials -> animations -> nodes
        let order = ["initials", "views", "illumination", "lights", "textures", "spritesheet", "materials", "animations", "nodes", "game"];
        // Verify order
        let curIndex = indexOrder.get("initials");
        for (let i = 1; i < order.length; i++) {
            let nextIndex;
            if ((nextIndex = indexOrder.get(order[i])) != undefined) {
                if (curIndex >= nextIndex) {
                    this.onXMLMinorError("Node <" + order[i] + "> is out of order");
                }
                curIndex = nextIndex;
            }
        }

        this.log("all parsed");
    }

    /**
     * Parses the <initials> block. 
     * @param {initials block element} initialsNode
     */
    parseInitials(initialsNode) {
        var children = initialsNode.children;
        var nodeNames = [];

        for (var i = 0; i < children.length; i++)
            nodeNames.push(children[i].nodeName);

        var rootIndex = nodeNames.indexOf("root");
        var referenceIndex = nodeNames.indexOf("reference");

        // Get root of the scene.
        if(rootIndex == -1)
            return "No root id defined for scene.";

        var rootNode = children[rootIndex];
        var id = this.reader.getString(rootNode, 'id');
        if (id == null)
            return "No root id defined for scene.";

        this.idRoot = id;

        // Get axis length        
        if(referenceIndex == -1)
            this.onXMLMinorError("no axis_length defined for scene; assuming 'length = 1'");

        var refNode = children[referenceIndex];
        var axis_length = this.reader.getFloat(refNode, 'length');
        if (axis_length == null)
            this.onXMLMinorError("no axis_length defined for scene; assuming 'length = 1'");

        this.referenceLength = axis_length || 1;

        this.log("Parsed initials");

        return null;
    }

    /**
     * Parses the <views> block.
     * @param {view block element} viewsNode
     */
    parseViews(viewsNode) {
        this.defaultCamera = this.reader.getString(viewsNode, "default", true);
        if (this.defaultCamera == null) {
            return "No default camera specified in 'view' tag";
        }

        var children = viewsNode.children;

        this.cameras = new Map();
        var curNode = null;
        for (let i = 0; i < children.length; i++) {
            curNode = children[i];

            // Getting id
            var id = this.reader.getString(curNode, "id", true);
            if (id == null) {
                this.onXMLMinorError("Camera with missing ID: Skipping camera");
                continue;
            }
            if (this.cameras.has(id)) {
                this.onXMLMinorError("Duplicate camera with id'" + id + "' already exists: Skipping camera");
                continue;
            }

            // Parse each type of camera
            var nodeName = curNode.nodeName;
            // Perspective Camera
            if (nodeName == "perspective") {
                var near = null, far = null, fov = null;
                if ((near = this.parseFloat(curNode, "near", "Skipping perspective camera with id '" + id + "'")) == null)
                    continue;
                if ((far = this.parseFloat(curNode, "far", "Skipping perspective camera with id '" + id + "'")) == null)
                    continue;
                if ((fov = this.parseFloat(curNode, "angle", "Skipping perspective camera with id '" + id + "'")) == null)
                    continue;

                // Parsing inner nodes
                var grandChildren = curNode.children;
                var position = null, target = null;
                for (let j = 0; j < grandChildren.length; j++) {
                    if (grandChildren[j].nodeName == "from") {
                        position = this.parseCoordinates3D(grandChildren[j], "Failed to parse perspective camera with id '" + id + "' 'from' coords");
                    }
                    else if (grandChildren[j].nodeName == "to") {
                        target = this.parseCoordinates3D(grandChildren[j], "Failed to parse perspective camera with id '" + id + "' 'to' coords");
                    }
                    else {
                        this.onXMLMinorError("Unexpected tag found in perspective camera with id '" + id + "'");
                    }
                }

                if (!Array.isArray(position)) {
                    this.onXMLMinorError("No <from> tag found in child: Skipping perspective camera with id '" + id + "'");
                    continue;
                }
                if (!Array.isArray(target)) {
                    this.onXMLMinorError("No <to> tag found in child: Skipping perspective camera with id '" + id + "'");
                    continue;
                }

                // Create Camera
                this.cameras.set(id, new MyCGFcamera(fov, near, far, position, target));
            }
            // Ortho Camera
            else if (nodeName == "ortho") {
                var near = null, far = null, right = null, left = null, top = null, bot = null;
                if ((near = this.parseFloat(curNode, "near", "Skipping ortho camera with id '" + id + "'")) == null)
                    continue;
                if ((far = this.parseFloat(curNode, "far", "Skipping ortho camera with id '" + id + "'")) == null)
                    continue;
                if ((right = this.parseFloat(curNode, "right", "Skipping ortho camera with id '" + id + "'")) == null)
                    continue;
                if ((left = this.parseFloat(curNode, "left", "Skipping ortho camera with id '" + id + "'")) == null)
                    continue;
                if ((top = this.parseFloat(curNode, "top", "Skipping ortho camera with id '" + id + "'")) == null)
                    continue;
                if ((bot = this.parseFloat(curNode, "bottom", "Skipping ortho camera with id '" + id + "'")) == null)
                    continue;

                // Parsing inner nodes
                var grandChildren = curNode.children;
                var position = null, target = null, up = [0.0, 1.0, 0.0];
                for (let j = 0; j < grandChildren.length; j++) {
                    if (grandChildren[j].nodeName == "from") {
                        position = this.parseCoordinates3D(grandChildren[j], "Failed to parse ortho camera with id '" + id + "' 'from' coords");
                    }
                    else if (grandChildren[j].nodeName == "to") {
                        target = this.parseCoordinates3D(grandChildren[j], "Failed to parse ortho camera with id '" + id + "' 'to' coords");
                    }
                    else if (grandChildren[j].nodeName == "up") {
                        up = this.parseCoordinates3D(grandChildren[j], "Failed to parse ortho camera with id '" + id + "' 'up' coords");
                    }
                    else {
                        this.onXMLMinorError("Unexpected tag found in ortho camera with id '" + id + "'");
                    }
                }

                if (!Array.isArray(position)) {
                    this.onXMLMinorError("No <from> tag found in child: Skipping ortho camera with id '" + id + "'");
                    continue;
                }
                if (!Array.isArray(target)) {
                    this.onXMLMinorError("No <to> tag found in child: Skipping ortho camera with id '" + id + "'");
                    continue;
                }
                if (!Array.isArray(up)) {
                    this.onXMLMinorError("Read an incorrect <up> tag in child of ortho camera with id '" + id + "': Using default 'up' value");
                    up = [0.0, 1.0, 0.0];
                }

                // Create Camera
                this.cameras.set(id, new MyCGFcameraOrtho(left, right, bot, top, near, far, position, target, up));
            }
            else {
                this.onXMLMinorError("Invalid view tag (must be <perspective> or <ortho>): Skipping camera with id '" + id + "'");
                continue;
            }
        }

        if (this.cameras.size == 0)
            return "Views tag must contain at least one valid camera";

        this.log("Parsed Views.");
        return null;
    }


    /**
     * Parses the <illumination> node.
     * @param {illumination block element} illuminationsNode
     */
    parseIllumination(illuminationsNode) {

        var children = illuminationsNode.children;

        this.ambient = [];
        this.background = [];

        var nodeNames = [];

        for (var i = 0; i < children.length; i++)
            nodeNames.push(children[i].nodeName);

        var ambientIndex = nodeNames.indexOf("ambient");
        var backgroundIndex = nodeNames.indexOf("background");

        var color = this.parseColor(children[ambientIndex], "ambient");
        if (!Array.isArray(color))
            return color;
        else
            this.ambient = color;

        color = this.parseColor(children[backgroundIndex], "background");
        if (!Array.isArray(color))
            return color;
        else
            this.background = color;

        this.log("Parsed Illumination.");

        return null;
    }

    /**
     * Parses the <light> node.
     * @param {lights block element} lightsNode
     */
    parseLights(lightsNode) {
        var children = lightsNode.children;

        this.lights = new Map();
        var numLights = 0;

        var grandChildren = [];
        var nodeNames = [];

        // Any number of lights.
        for (var i = 0; i < children.length; i++) {

            // Storing light information
            var global = [];
            var attributeNames = [];
            var attributeTypes = [];

            //Check type of light
            if (children[i].nodeName != "light") {
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }
            else {
                attributeNames.push(...["enable", "position", "ambient", "diffuse", "specular"]);
                attributeTypes.push(...["boolean","position", "color", "color", "color"]);
            }

            // Get id of the current light.
            var lightId = this.reader.getString(children[i], 'id');
            if (lightId == null)
                return "no ID defined for light";

            // Checks for repeated IDs.
            if (this.lights.has(lightId)) {
                this.onXMLMinorError("ID must be unique for each light (conflict: ID = " + lightId + "): Skipping light");
                continue;
            }

            grandChildren = children[i].children;
            // Specifications for the current light.

            nodeNames = [];
            for (var j = 0; j < grandChildren.length; j++) {
                nodeNames.push(grandChildren[j].nodeName);
            }

            for (var j = 0; j < attributeNames.length; j++) {
                var attributeIndex = nodeNames.indexOf(attributeNames[j]);

                if (attributeIndex != -1) {
                    if (attributeTypes[j] == "boolean")
                        var aux = this.parseBoolean(grandChildren[attributeIndex], "value", "enabled attribute for light of ID" + lightId);
                    else if (attributeTypes[j] == "position")
                        var aux = this.parseCoordinates4D(grandChildren[attributeIndex], "light position for ID" + lightId);
                    else
                        var aux = this.parseColor(grandChildren[attributeIndex], attributeNames[j] + " illumination for ID" + lightId);

                    if (typeof aux === 'string')
                        return aux;

                    global.push(aux);
                }
                else
                    return "light " + attributeNames[i] + " undefined for ID = " + lightId;
            }

            this.lights.set(lightId, global);
        }

        if (this.lights.size == 0)
            return "at least one light must be defined";
        else if (this.lights.size > 8)
            this.onXMLMinorError("too many lights defined; WebGL imposes a limit of 8 lights");

        this.log("Parsed lights");
        return null;
    }

    /**
     * Parses the <textures> block. 
     * @param {textures block element} texturesNode
     */
    parseTextures(texturesNode) {
        var children = texturesNode.children;

        this.textures = new Map();

        // Any number of textures.
        for (var i = 0; i < children.length; i++) {

            if (children[i].nodeName != "texture") {
                this.onXMLMinorError("Unknown tag <" + children[i].nodeName + "> in textures block");
                continue;
            }

            // Get id of the current texture.
            var textureId = this.reader.getString(children[i], 'id');
            if (textureId == null) {
                this.onXMLMinorError("No id in <texture> tag: Skipping texture");
                continue;
            }

            // Checks for repeated IDs.
            if (this.textures.has(textureId)) {
                this.onXMLMinorError("ID must be unique for each texture (conflict: ID = " + textureId + "): Skipping texture");
                continue;
            }

            // Get filename
            var fileName = this.reader.getString(children[i], "path", true);
            if (fileName == null) {
                this.onXMLMinorError("Texture with id '" + textureId + "' has invalid <path> tag: Skipping texture");
                continue;
            }

            this.textures.set(textureId, new CGFtexture(this.scene, fileName));
        }

        this.log("Parsed textures");
        return null;
    }

    /**
     * Parses the <materials> node.
     * @param {materials block element} materialsNode
     */
    parseMaterials(materialsNode) {
        var children = materialsNode.children;

        this.materials = new Map();

        var attributeNames = ["ambient", "diffuse", "specular", "emissive"];

        // Any number of materials.
        var curNode = null;
        for (var i = 0; i < children.length; i++) {

            curNode = children[i];

            if (curNode.nodeName != "material") {
                this.onXMLMinorError("Unknown tag <" + curNode.nodeName + "> in materials block");
                continue;
            }

            // Get id of the current material.
            var materialId = this.reader.getString(curNode, 'id');
            if (materialId == null) {
                this.onXMLMinorError("No id in <material> tag: Skipping material");
                continue;
            }

            // Checks for repeated IDs.
            if (this.materials.has(materialId)) {
                this.onXMLMinorError("ID must be unique for each material (conflict: ID = " + materialId + "): Skipping material");
                continue;
            }

            // Read colors
            var colors = [null, null, null, null];
            var nodeNames = [];
            var grandChildren = curNode.children;
            for (let j = 0; j < grandChildren.length; j++) {
                nodeNames.push(grandChildren[j].nodeName);
            }
            for (let j = 0; j < attributeNames.length; j++) {
                var attributeIndex = nodeNames.indexOf(attributeNames[j]);

                if (attributeIndex != INDEX_NOT_FOUND) {
                    var aux = this.parseColor(grandChildren[attributeIndex], attributeNames[j] + " material with ID '" + materialId + "'");

                    if (typeof aux === 'string') {
                        this.onXMLMinorError(aux + ": Skipped color component " + attributeNames[j]);
                    }
                    colors[j] = aux;
                }
                else
                    this.onXMLMinorError("tag <" + attributeNames[i] + "> undefined for material with id '" + materialId +  "': Ignoring tag");
            }

            // Read shininess
            var shininessIndex = nodeNames.indexOf("shininess");
            var shininess = null;
            if (shininessIndex != INDEX_NOT_FOUND)
                shininess = this.parseFloat(grandChildren[shininessIndex], "value", "on material with id '" + materialId + "'", false);

            // Apply values to the new appearance
            var newAppearance = new MyCGFmaterial(this.scene);
            if (shininess != null)
                newAppearance.setShininess(shininess);
            else
                this.onXMLMinorError("Material with id '" + materialId + "' is missing shininess: Using default value");
            
            if (colors[0] != null)
                newAppearance.setAmbient(...colors[0]);
            else
                this.onXMLMinorError("Material with id '" + materialId + '" is missing ambient component: Using default value');
            if (colors[1] != null)
                newAppearance.setDiffuse(...colors[1]);
            else
                this.onXMLMinorError("Material with id '" + materialId + '" is missing diffuse component: Using default value');
            if (colors[2] != null)
                newAppearance.setSpecular(...colors[2]);
            else
                this.onXMLMinorError("Material with id '" + materialId + '" is missing specular component: Using default value');
            if (colors[3] != null)
                newAppearance.setEmission(...colors[3]);
            else
                this.onXMLMinorError("Material with id '" + materialId + '" is missing emissive component: Using default value');

            this.materials.set(materialId, newAppearance);
        }

        if (this.materials.size == 0)
            return "There must be at least one valid material";

        this.log("Parsed materials");
        return null;
    }

    /**
   * Parses the <nodes> block.
   * @param {nodes block element} nodesNode
   */
    parseNodes(nodesNode) {
        var children = nodesNode.children;

        this.nodes = new Map();

        var grandChildren = [];
        var grandgrandChildren = [];
        var nodeNames = [];

        var axisConvertor = {
            "x": [1.0, 0.0, 0.0],
            "y": [0.0, 1.0, 0.0],
            "z": [0.0, 0.0, 1.0]
        };
        var curNode = null;

        // Any number of nodes.
        for (var i = 0; i < children.length; i++) {

            if (children[i].nodeName != "node") {
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }

            // Get id of the current node.
            var nodeID = this.reader.getString(children[i], 'id');
            if (nodeID == null) {
                this.onXMLMinorError("no ID defined for nodeID: Skipping node");
                continue;
            }

            // Checks for repeated IDs.
            if (this.nodes.has(nodeID)) {
                this.onXMLMinorError("ID must be unique for each node (conflict: ID = " + nodeID + "): Skipping node");
                continue;
            }

            grandChildren = children[i].children;

            nodeNames = [];
            for (var j = 0; j < grandChildren.length; j++) {
                nodeNames.push(grandChildren[j].nodeName);
            }

            var transformationsIndex = nodeNames.indexOf("transformations");
            var animationIndex = nodeNames.indexOf("animationref");
            var materialIndex = nodeNames.indexOf("material");
            var textureIndex = nodeNames.indexOf("texture");
            var descendantsIndex = nodeNames.indexOf("descendants");


            // Transformations (there may be none)
            var matrix = mat4.create();
            if (transformationsIndex == INDEX_NOT_FOUND) {
                this.onXMLMinorError("No <transformations> tag found on node with id '" + nodeID + "': Using default transformation matrix");
            }
            else {
                var transformations = grandChildren[transformationsIndex].children;
                for (let k = 0; k < transformations.length; k++) {
                    curNode = transformations[k];
                    var nodeType = curNode.nodeName;
                    if (nodeType == "translation") {
                        var coords = this.parseCoordinates3D(curNode);
                        if (!Array.isArray(coords)) {
                            this.onXMLMinorError("Failed to read translation coords on node with id '" + nodeID + "': Skipping translation");
                            continue;
                        }
                        mat4.translate(matrix, matrix, coords);
                    }
                    else if (nodeType == "rotation") {
                        var axis = this.reader.getString(curNode, "axis", true);
                        if (!axisConvertor.hasOwnProperty(axis)) {
                            this.onXMLMinorError("Unexpected axis on node with id '" + nodeID + "': Skipping rotation");
                            continue;
                        }
                        else
                            axis = axisConvertor[axis];

                        var angle = DEGREE_TO_RAD * this.reader.getFloat(curNode, "angle", true);
                        mat4.rotate(matrix, matrix, angle, axis);
                    }
                    else if (nodeType == "scale") {
                        var scale = this.parseFloat3(curNode, "sx", "sy", "sz");
                        if (!Array.isArray(scale)) {
                            this.onXMLMinorError("Couldn't read scale on node with id '" + nodeID + "': Skipping scale");
                            continue;
                        }
                        else
                            mat4.scale(matrix, matrix, scale);
                    }
                    else {
                        this.onXMLMinorError("Unexpected tag on transformations on node with id '" + nodeID + "': Skipping transformation");
                    }
                }
            }

            // Animation ~ Optional
            var animation = null;
            if (animationIndex != INDEX_NOT_FOUND) {
                curNode = grandChildren[animationIndex];
                var animation = this.reader.getString(curNode, "id", true);
                if (animation == null) {
                    this.onXMLMinorError("Tag <animation> had no id on node with id'" + nodeID + "': Using no animation");
                }
            }

            // Material ("mandatory")
            var material = null;
            if (materialIndex == INDEX_NOT_FOUND) {
                this.onXMLMinorError("No <material> tag found on node with id '" + nodeID + "': Using parent's material");
                material = "null";
            }
            else {
                curNode = grandChildren[materialIndex];
                var material = this.reader.getString(curNode, "id", true);
                if (material == null) {
                    this.onXMLMinorError("Tag <material> had no id on node with id'" + nodeID + "': Using parent's material");
                    material = "null";
                }
            }           


            // Texture ("mandatory")
            var texture = null;
            var afs = 1.0, aft = 1.0;
            if (textureIndex == INDEX_NOT_FOUND) {
                this.onXMLMinorError("No <texture> tag found on node with id '" + nodeID + "': Using clear texture and default amplification");
                texture = "clear";
            }
            else {
                curNode = grandChildren[textureIndex];
                texture = this.reader.getString(curNode, "id", true);
                if (texture == null) {
                    this.onXMLMinorError("Tag <texture> had no id on node with id '" + nodeID + "': Using clear texture");
                    texture = "clear";
                }
                
                // texture amplification
                nodeNames = [];
                for (var j = 0; j < curNode.children.length; j++) {
                    nodeNames.push(curNode.children[j].nodeName);
                }
                var ampIndex = nodeNames.indexOf("amplification");
                if (ampIndex == INDEX_NOT_FOUND) {
                    this.onXMLMinorError("Tag <amplification> on node with id '" + nodeID + "' not found: Using default amplification");
                }
                else {
                    var val = this.reader.getFloat(curNode.children[ampIndex], "afs", false);
                    if (val != null)
                        afs = val;
                    else
                        this.onXMLMinorError("Amplification value afs not found on node with id '" + nodeID + "': Using default afs");
                    val = this.reader.getFloat(curNode.children[ampIndex], "aft", false);
                    if (val != null)
                        aft = val;
                    else
                        this.onXMLMinorError("Amplification value aft not found on node with id '" + nodeID + "': Using default aft");
                }
            }

            // Descendants
            // declaring descendants, at least one node or one leaf must be present: descendants may be mixed, nodes and leafs

            if (descendantsIndex == INDEX_NOT_FOUND) {
                this.onXMLMinorError("No <descendants> tag found on node with id '" + nodeID + "': Skipping object");
                continue;
            }
            else {
                var descendants = [];
                var descendantTags = grandChildren[descendantsIndex].children;
                for (let j = 0; j < descendantTags.length; j++) {
                    curNode = descendantTags[j];
                    if (curNode.nodeName == "noderef") {
                        var noderef = this.reader.getString(curNode, "id", "id of <noderef> of node with id '" + nodeID + "': Ignoring noderef");
                        if (noderef == null)
                            continue;
                        descendants.push(noderef);
                    }
                    else if (curNode.nodeName == "leaf") {
                        // Primitive (leaf "node")
                        var primitive = this.parsePrimitive(curNode, afs, aft);
                        if (primitive == null) {
                            this.onXMLMinorError("Invalid <leaf> tag of node with id '" + nodeID + "': Skipping this descendant");
                            continue;
                        }
                        else {
                            descendants.push(primitive);
                        }
                    }
                    else {
                        this.onXMLMinorError("Invalid descendant tag (should be <noderef> or <leaf>) for node with id '" + nodeID + "': Ignoring this descendant");
                    }
                }
            }

            if (descendants.length <= 0) {
                this.onXMLMinorError("There must be at least 1 valid descendant in node with id '" + nodeID + "': Skipping node");
                continue;
            }
            this.nodes.set(nodeID, new MyNode(nodeID, animation, material, texture, aft, afs, matrix, descendants, this.scene));
        }

        if (this.nodes.size <= 0)
            return "There must be at least 1 valid node";

        this.log("Parsed Nodes");
        return null;
    }


    parseSpritesheets(spritesheetsNode) {
        // <spritesheet id=”ss” path=”ss” sizeM=”ii” sizeN=”ii” />
        var children = spritesheetsNode.children;

        this.spritesheets = new Map();

        // Any number of textures.
        var curNode = null;
        var spritesheet = null;
        for (var i = 0; i < children.length; i++) {
            curNode = children[i];

            if (curNode.nodeName != "spritesheet") {
                this.onXMLMinorError("Unknown tag <" + curNode.nodeName + "> in animations block");
                continue;
            }

            // Get id of the current material.
            var spritesheetId = this.reader.getString(curNode, 'id');
            if (spritesheetId == null) {
                this.onXMLMinorError("No id in <spritesheet> tag: Skipping spritesheet");
                continue;
            }

            // Checks for repeated IDs.
            if (this.spritesheets.has(spritesheetId)) {
                this.onXMLMinorError("ID must be unique for each spritesheet (conflict: ID = " + spritesheetId + "): Skipping spritesheet");
                continue;
            }

            if ((spritesheet = this.parseSpritesheet(curNode)) == null) {
                this.onXMLError("Failed to parse spritesheet with id '" + spritesheetId +  "': Ignoring spritesheet");
            }

            this.spritesheets.set(spritesheetId, spritesheet);
        }

        this.log("Parsed spritesheets");
        return null;

    }

    /**
     * Parses the <animations> block.
     * @param {animations block element} nodesNode
     */
    parseAnimations(animationsNode) {
        var children = animationsNode.children;

        this.animations = new Map();

        // Any number of textures.
        var curNode = null;
        var keyframe = null;
        var keyframes = [];
        for (var i = 0; i < children.length; i++) {
            curNode = children[i];

            if (curNode.nodeName != "animation") {
                this.onXMLMinorError("Unknown tag <" + curNode.nodeName + "> in animations block");
                continue;
            }

            // Get id of the current material.
            var animationId = this.reader.getString(curNode, 'id');
            if (animationId == null) {
                this.onXMLMinorError("No id in <animation> tag: Skipping animation");
                continue;
            }

            // Checks for repeated IDs.
            if (this.animations.has(animationId)) {
                this.onXMLMinorError("ID must be unique for each animation (conflict: ID = " + animationId + "): Skipping animation");
                continue;
            }

            keyframes = [];
            var descendantTags = curNode.children;
            for (let j = 0; j < descendantTags.length; j++) {
                curNode = descendantTags[j];
                if (curNode.nodeName != "keyframe") {
                    this.onXMLMinorError("Invalid descendant tag (should be <keyframe>) for animation with id '" + animationId + "': Skipping keyframe");
                    continue;
                }
                
                if ((keyframe = this.parseKeyframe(curNode)) == null) {
                    this.onXMLMinorError("Failed to parse keyframe of animation with id '" + animationId + "': Skipping keyframe");
                    continue;
                }

                if (keyframes.length > 0 && keyframe.instant <= keyframes[keyframes.length - 1].instant) {
                    this.onXMLMinorError("Keyframe of animation with id '" + animationId + "' with instant '" + keyframe.instant + "' comes before the previous read instant (with id '" + keyframes[keyframes.length - 1].instant + "): We will sort the keyframes, but watch out");
                }

                keyframes.push(keyframe);
            }

            if (keyframes.length < 1) {
                this.onXMLMinorError("Animation with id '" + animationId + "' has no keyframes: Skipping animation");
                continue;
            }

            keyframes.sort(instantCompare);
            this.animations.set(animationId, new KeyframeAnimation(keyframes));
        }

        this.log("Parsed animations");
        return null;
    }


// <keyframe instant=“2”>
//     <translation x=“0” y=“-6” z=“0” />
//     <rotation axis="x" angle="0" />
//     <rotation axis="y" angle="0" />
//     <rotation axis="z" angle="0" />
//     <scale sx=“0” sy=“0” sz=“0” />
// </keyframe>

    parseKeyframe(keyframeNode) {
        var instant = this.parseFloat(keyframeNode, 'instant', "Keyframe");
        if (instant == null) {
            this.onXMLMinorError("Keyframe does not have an instant");
            return null;
        }

        var children = keyframeNode.children;

        if (children[0].nodeName != "translation") {
            this.onXMLMinorError("Keyframe with instant '" + instant + "' does not have translation as first child");
            return null;
        }
        var translation = this.parseCoordinates3D(children[0]);
        if (!Array.isArray(translation)) {
            this.onXMLMinorError("Failed to read translation coords of keyframe with instant '" + instant + "'");
            return null;
        }

        var axis;
        var rotation = [];
        if (children[1].nodeName != "rotation" || children[2].nodeName != "rotation" || children[3].nodeName != "rotation") {
            this.onXMLMinorError("Keyframe with instant '" + instant + "' does not have rotation as second to fourth child");
            return null;
        }

        // X AXIS
        axis = this.reader.getString(children[1], "axis", true);
        if (axis != "x") {
            this.onXMLMinorError("First rotation must be on the 'x' axis on node keyframe with instant '" + instant + "'");
            return null;
        }
        rotation[0] = DEGREE_TO_RAD * this.reader.getFloat(children[1], "angle", true);

        // Y AXIS
        axis = this.reader.getString(children[2], "axis", true);
        if (axis != "y") {
            this.onXMLMinorError("Second rotation must be on the 'y' axis on node keyframe with instant '" + instant + "'");
            return null;
        }
        rotation[1] = DEGREE_TO_RAD * this.reader.getFloat(children[2], "angle", true);

        // Z AXIS
        axis = this.reader.getString(children[3], "axis", true);
        if (axis != "z") {
            this.onXMLMinorError("Third rotation must be on the 'z' axis on node keyframe with instant '" + instant + "'");
            return null;
        }
        rotation[2] = DEGREE_TO_RAD * this.reader.getFloat(children[3], "angle", true);
        
        // SCALE
        if (children[4].nodeName != "scale") {
            this.onXMLMinorError("Keyframe with instant '" + instant + "' does not have scale as fifth child");
            return null;
        }
        var scale = this.parseFloat3(children[4], "sx", "sy", "sz");
        if (!Array.isArray(scale)) {
            this.onXMLMinorError("Failed to read scale of keyframe with instant '" + instant + "'");
            return null;
        }

        return new Keyframe(instant, translation, rotation, scale);
    }

    parseGame(node) {
        this.gameConfig = new Map();

        let children = node.children;
        // Reads the names of the nodes to an auxiliary buffer.
        let nodeNames = [];
        for (var i = 0; i < children.length; i++) {
            nodeNames.push(children[i].nodeName);
        }

        let ret;
        if ((ret = this.parseGameObjectNodes(children, nodeNames,
                ["tile", "aux_tile", "white_ring", "white_ball", "black_ring", "black_ball"])) != null) {
            return ret;
        }

        let ring_height;
        if((ring_height = this.parseFloat(node, "ring_height", "Invalid or missing ring height", false)) == null)
            return "Failed to parse <game> node";
        this.ring_height = ring_height;

        return null;
    }

    parseGameObjectNodes(children, nodeNames, names) {
        let index;
        let noderef;
        let curNode;
        
        for (let name of names) {
            if ((index = nodeNames.indexOf(name)) == INDEX_NOT_FOUND)
                return "No tag <" + name + "> found";
            curNode = children[index];
            noderef = this.reader.getString(curNode, "noderef", true);
            if(noderef == null){
                this.onXMLMinorError("Couldn't parse tag <" + name + ">: Invalid noderef");
                return "Tag <" + name + "> without ";
            }
            this.gameConfig.set(name, this.nodes.get(noderef));
        }

        return null;
    }


    parseBoolean(node, name, messageError) {
        var boolVal = this.reader.getBoolean(node, name);
        if (
          !(
            boolVal != null &&
            !isNaN(boolVal) &&
            (boolVal == true || boolVal == false)
          )
        ) {
          this.onXMLMinorError(
            "unable to parse value component " +
              messageError +
              "; assuming 'value = 1'"
          );
          return true;
        }
        
        return boolVal;
    }

    /**
     * Parse 3 floats from a node with ID = id
     * @param {block element} node
     * @param {message to be displayed in case of error} messageError
     */
    parseFloat3(node, elem1, elem2, elem3, messageError) {
        var position = [];

        // x
        var x = this.reader.getFloat(node, elem1);
        if (!(x != null && !isNaN(x)))
            return "unable to parse first element of the " + messageError;

        // y
        var y = this.reader.getFloat(node, elem2);
        if (!(y != null && !isNaN(y)))
            return "unable to parse second element of the " + messageError;

        // z
        var z = this.reader.getFloat(node, elem3);
        if (!(z != null && !isNaN(z)))
            return "unable to parse third element of the " + messageError;

        position.push(...[x, y, z]);

        return position;
    }

    /**
     * Parse the coordinates from a node with ID = id
     * @param {block element} node
     * @param {message to be displayed in case of error} messageError
     */
    parseCoordinates3D(node, messageError) {
        var position = [];

        // x
        var x = this.reader.getFloat(node, 'x');
        if (!(x != null && !isNaN(x)))
            return "unable to parse x-coordinate of the " + messageError;

        // y
        var y = this.reader.getFloat(node, 'y');
        if (!(y != null && !isNaN(y)))
            return "unable to parse y-coordinate of the " + messageError;

        // z
        var z = this.reader.getFloat(node, 'z');
        if (!(z != null && !isNaN(z)))
            return "unable to parse z-coordinate of the " + messageError;

        position.push(...[x, y, z]);

        return position;
    }

    /**
     * Parse the coordinates from a node with ID = id
     * @param {block element} node
     * @param {message to be displayed in case of error} messageError
     */
    parseCoordinates4D(node, messageError) {
        var position = [];

        //Get x, y, z
        position = this.parseCoordinates3D(node, messageError);

        if (!Array.isArray(position))
            return position;


        // w
        var w = this.reader.getFloat(node, 'w');
        if (!(w != null && !isNaN(w)))
            return "unable to parse w-coordinate of the " + messageError;

        position.push(w);

        return position;
    }

    /**
     * Parse the color components from a node
     * @param {block element} node
     * @param {message to be displayed in case of error} messageError
     */
    parseColor(node, messageError) {
        var color = [];

        // R
        var r = this.reader.getFloat(node, 'r');
        if (!(r != null && !isNaN(r) && r >= 0 && r <= 1))
            return "unable to parse R component of the " + messageError;

        // G
        var g = this.reader.getFloat(node, 'g');
        if (!(g != null && !isNaN(g) && g >= 0 && g <= 1))
            return "unable to parse G component of the " + messageError;

        // B
        var b = this.reader.getFloat(node, 'b');
        if (!(b != null && !isNaN(b) && b >= 0 && b <= 1))
            return "unable to parse B component of the " + messageError;

        // A
        var a = this.reader.getFloat(node, 'a');
        if (!(a != null && !isNaN(a) && a >= 0 && a <= 1))
            return "unable to parse A component of the " + messageError;

        color.push(...[r, g, b, a]);

        return color;
    }

    /**
     * 
     * @param {block element} node 
     * @param {string} fieldName 
     * @param {message to be displayed in case of error} messageError
     * @param {bool} 
     */
    parseFloat(node, fieldName, messageError, required = true) {
        let val = this.reader.getFloat(node, fieldName, true);
        if (!(val != null && !isNaN(val))) {
            this.onXMLMinorError("Couldn't find '" + fieldName + "' in node: " + messageError);
            return null;
        }
        return val;
    }

    /**
     * 
     * @param {block element} node 
     * @param {string} fieldName 
     * @param {message to be displayed in case of error} messageError
     * @param {bool} 
     */
    parseInt(node, fieldName, messageError, required = true) {
        let val = this.reader.getInteger(node, fieldName, true);
        if (!(val != null && !isNaN(val))) {
            this.onXMLMinorError("Couldn't find '" + fieldName + "' in node: " + messageError);
            return null;
        }
        return val;
    }

    /**
     * 
     * @param {block element} node 
     */
    parsePrimitive(node, afs, aft) {
        let type = this.reader.getString(node, "type", false);
        if(type == null){
            this.onXMLMinorError("Couldn't parse leaf node: Invalid type");
            return null;
        } else if (type === "rectangle"){
            return this.parseRectangle(node, afs, aft);
        } else if (type === "triangle"){
            return this.parseTriangle(node, afs, aft);
        } else if (type === "sphere"){
            return this.parseSphere(node);
        } else if (type === "cylinder"){
            return this.parseCylinder(node);
        } else if (type === "torus"){
            return this.parseTorus(node);
        } else if (type === "spritetext") {
            return this.parseSpritetext(node);
        } else if (type === "spriteanim"){
            return this.parseSpriteAnim(node);
        } else if (type === "plane") {
            return this.parsePlane(node);
        } else if (type === "patch") {
            return this.parsePatch(node);
        } else if (type === "defbarrel") {
            return this.parseBarrel(node);
        } else {
            this.onXMLMinorError("Couldn't parse leaf node: Invalid type");
            return null;
        }
    }

    /**
     * 
     * @param {block element} node 
     */
    parseRectangle(node, afs, aft) {

        let x1,y1,x2,y2;

        if((x1 = this.parseFloat(node,"x1", "Rectangle", false)) == null)
            return null;
        if((y1 = this.parseFloat(node,"y1", "Rectangle", false)) == null)
            return null;
        if((x2 = this.parseFloat(node,"x2", "Rectangle", false)) == null)
            return null;
        if((y2 = this.parseFloat(node,"y2", "Rectangle", false)) == null)
            return null;

        return new MyRectangle(this.scene, x1, y1, x2, y2, afs, aft);
    }

    /**
    *  
    * @param {block element} node 
    */
    parseTriangle(node, afs, aft) {

        let x1,y1,x2,y2,x3,y3;
        
        if((x1 = this.parseFloat(node,"x1", "Triangle", false)) == null)
        return null;
        if((y1 = this.parseFloat(node,"y1", "Triangle", false)) == null)
            return null;
        if((x2 = this.parseFloat(node,"x2", "Triangle", false)) == null)
            return null;
        if((y2 = this.parseFloat(node,"y2", "Triangle", false)) == null)
            return null;
        if((x3 = this.parseFloat(node,"x3", "Triangle", false)) == null)
            return null;
        if((y3 = this.parseFloat(node,"y3", "Triangle", false)) == null)
            return null;

        return new MyTriangle(this.scene, x1, y1, x2, y2, x3, y3, afs, aft);
    }

    /**
    *  
    * @param {block element} node 
    */
   parseSphere(node) {

        let radius, slices, stacks;
        
        if((radius = this.parseFloat(node,"radius", "Sphere", false)) == null)
        return null;
        if((slices = this.parseInt(node,"slices", "Sphere", false)) == null)
            return null;
        if((stacks = this.parseInt(node,"stacks", "Sphere", false)) == null)
            return null;

        return new MySphere(this.scene, slices, stacks, radius);
    }

    /**
    *  
    * @param {block element} node 
    */
    parseCylinder(node) {

        let height, topRadius, bottomRadius, stacks, slices;
        
        if((height = this.parseFloat(node,"height", "Cylinder", false)) == null)
            return null;
        if((topRadius = this.parseFloat(node,"topRadius", "Cylinder", false)) == null)
            return null;
        if((bottomRadius = this.parseFloat(node,"bottomRadius", "Cylinder", false)) == null)
            return null;
        if((stacks = this.parseInt(node,"stacks", "Cylinder", false)) == null)
            return null;
        if((slices = this.parseInt(node,"slices", "Cylinder", false)) == null)
            return null;

        return new MyCylinder(this.scene, bottomRadius, topRadius, height, slices, stacks);
    }

    /**
    *  
    * @param {block element} node 
    */
   parseTorus(node) {

        let inner, outer, loops, slices;
        
        if((inner = this.parseFloat(node,"inner", "Torus", false)) == null)
            return null;
        if((outer = this.parseFloat(node,"outer", "Torus", false)) == null)
            return null;
        if((loops = this.parseInt(node,"loops", "Torus", false)) == null)
            return null;
        if((slices = this.parseInt(node,"slices", "Torus", false)) == null)
            return null;

        return new MyTorus(this.scene, inner, outer, loops, slices);
    }

    /**
     * 
     * @param {block element} node 
     */
    parseSpritetext(node) {
        let text = this.reader.getString(node, "text", true);

        if (text == null) {
            this.onXMLMinorError("Spritetext elements has no text: Ignoring this leaf");
            return null;
        }
        return new MySpriteText(this.scene, text);
    }

    /**
     * 
     * @param {block element} node 
     */
    parseSpriteAnim(node) {
        let ssid = this.reader.getString(node, "ssid", true);
        let duration, startCell, endCell;

        if (ssid == null) {
            this.onXMLMinorError("Spritetext elements has no text: Ignoring this leaf");
            return null;
        }

        if((duration = this.parseFloat(node, "duration", "SpriteAnime", false)) == null)
            return null;

        if((startCell = this.parseInt(node, "startCell", "SpriteAnim", false)) == null)
            return null;

        if((endCell = this.parseInt(node, "endCell", "SpriteAnim", false)) == null)
            return null;

        let sa = new MySpriteAnimation(null, startCell, endCell, duration, ssid);
        this.spriteAnims.push(sa);
        return sa;
    }

    parseSpritesheet(node) {
        
        let path = this.reader.getString(node, "path", true);
        if (path == null) {
            this.onXMLMinorError("Spritesheet has no path");
            return null;
        }

        let sizeM, sizeN;
        if((sizeM = this.parseInt(node, "sizeM", "Spritesheet", false)) == null) {
            this.onXMLMinorError("Spritesheet has no sizeN");
            return null;
        }

        if((sizeN = this.parseInt(node, "sizeN", "Spritesheet", false)) == null) {
            this.onXMLMinorError("Spritesheet has no sizeN");
            return null;
        }

        return new MySpriteSheet(this.scene, new CGFtexture(this.scene, path), sizeM, sizeN);
    }

    // <leaf type=”plane” npartsU=“ii” npartsV=“ii” />
    parsePlane(node) {
        let npartsU, npartsV;
        if((npartsU = this.parseInt(node, "npartsU", "Plane", false)) == null) {
            this.onXMLMinorError("Plane has no npartsU");
            return null;
        }

        if((npartsV = this.parseInt(node, "npartsV", "Plane", false)) == null) {
            this.onXMLMinorError("Plane has no npartsV");
            return null;
        }
        
        return new Plane(this.scene, npartsU, npartsV);
    }

    // <leaf type=”patch” npointsU=“ii” npointsV=“ii” npartsU=“ii” npartsV=“ii” >
    //   <controlpoint x=“ff” y=“ff” z=“ff” />
    //   ...
    // </leaf>
    parsePatch(node) {
        let npointsU, npointsV, npartsU, npartsV;
        if((npointsU = this.parseInt(node, "npointsU", "Patch", false)) == null) {
            this.onXMLMinorError("Patch has no npointsU");
            return null;
        }

        if((npointsV = this.parseInt(node, "npointsV", "Patch", false)) == null) {
            this.onXMLMinorError("Patch has no npartsV");
            return null;
        }

        if((npartsU = this.parseInt(node, "npartsU", "Patch", false)) == null) {
            this.onXMLMinorError("Patch has no npartsU");
            return null;
        }

        if((npartsV = this.parseInt(node, "npartsV", "Patch", false)) == null) {
            this.onXMLMinorError("Patch has no npartsV");
            return null;
        }

        let controlPoints = [];
        // <controlpoint x=“ff” y=“ff” z=“ff” />
        for (let child of node.children) {
            if (child.nodeName != "controlpoint") {
                this.onXMLMinorError("Unexpected child in Patch control points, expected <controlpoint> but was <" + child.nodeName + ">: Skipping control point");
                continue;
            }

            let coords = this.parseCoordinates3D(child, "Control Point");
            if (!Array.isArray(coords)) {
                this.onXMLMinorError("Failed to parse control point coords ("+ coords +"): Skipping controlpoint");
                continue;
            }
            // The gravity will always be 1
            coords.push(1);

            controlPoints.push(coords);
        }

        if(controlPoints.length != (npointsU * npointsV)){
            this.onXMLMinorError("Patch: Wrong number of control points");
            return null;
        }

        let finalControlPoints = [];
        for(let j = 0; j < npointsU; j++){
            let aux = [];
            for(let i = j * npointsV; i < (j + 1) * npointsV ; i++) {
                aux.push(controlPoints[i]);
            }
            finalControlPoints.push(aux);
        }

        // console.log(controlPoints);
        // console.log(finalControlPoints);

        return new Patch(this.scene, npartsU, npartsV, npointsU, npointsV, finalControlPoints);
    }

    // <leaf type=”defbarrel” base=“ff” middle=“ff” height=“ff” 
    //     slices=“ii” stacks=“ii” />
    parseBarrel(node) {

        let base, middle, height;
        if((base = this.parseFloat(node, "base", "Barrel", false)) == null) {
            this.onXMLMinorError("Barrel has no base");
            return null;
        }

        if((middle = this.parseFloat(node, "middle", "Barrel", false)) == null) {
            this.onXMLMinorError("Barrel has no middle");
            return null;
        }

        if((height = this.parseFloat(node, "height", "Barrel", false)) == null) {
            this.onXMLMinorError("Barrel has no height");
            return null;
        }

        let slices, stacks;
        if((slices = this.parseInt(node, "slices", "Barrel", false)) == null) {
            this.onXMLMinorError("Barrel has no slices");
            return null;
        }

        if((stacks = this.parseInt(node, "stacks", "Barrel", false)) == null) {
            this.onXMLMinorError("Barrel has no npartsV");
            return null;
        }

        return new MyBarrel(this.scene, base, middle, height, slices, stacks);
    }

    /**
     * Displays the scene, processing each node, starting in the root node.
     */
    displayScene() {
        this.rootNode.display();
    }

}