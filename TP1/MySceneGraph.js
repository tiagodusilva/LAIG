const DEGREE_TO_RAD = Math.PI / 180;
const INDEX_NOT_FOUND = -1;

// Order of the groups in the XML document.
var INITIALS_INDEX = 0;
var VIEWS_INDEX = 1;
var ILLUMINATION_INDEX = 2;
var LIGHTS_INDEX = 3;
var TEXTURES_INDEX = 4;
var MATERIALS_INDEX = 5;
var NODES_INDEX = 6;

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

        this.nodes = [];

        this.idRoot = null; // The id of the root element.

        this.axisCoords = [];
        this.axisCoords['x'] = [1, 0, 0];
        this.axisCoords['y'] = [0, 1, 0];
        this.axisCoords['z'] = [0, 0, 1];

        // File reading 
        this.reader = new CGFXMLreader();

        /*
         * Read the contents of the xml file, and refer to this class for loading and error handlers.
         * After the file is read, the reader calls onXMLReady on this object.
         * If any error occurs, the reader calls onXMLError on this object, with an error message
         */
        this.reader.open('scenes/' + filename, this);
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

        this.loadedOk = true;

        // As the graph loaded ok, signal the scene so that any additional initialization depending on the graph can take place
        this.scene.onGraphLoaded();
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

        // <initials>
        var index;
        if ((index = nodeNames.indexOf("initials")) == -1)
            return "tag <initials> missing";
        else {
            if (index != INITIALS_INDEX)
                this.onXMLMinorError("tag <initials> out of order " + index);

            //Parse initials block
            if ((error = this.parseInitials(nodes[index])) != null)
                return error;
        }

        // <views>
        if ((index = nodeNames.indexOf("views")) == -1)
            return "tag <views> missing";
        else {
            if (index != VIEWS_INDEX)
                this.onXMLMinorError("tag <views> out of order");

            //Parse views block
            if ((error = this.parseViews(nodes[index])) != null)
                return error;
        }

        // <illumination>
        if ((index = nodeNames.indexOf("illumination")) == -1)
            return "tag <illumination> missing";
        else {
            if (index != ILLUMINATION_INDEX)
                this.onXMLMinorError("tag <illumination> out of order");

            //Parse illumination block
            if ((error = this.parseIllumination(nodes[index])) != null)
                return error;
        }

        // <lights>
        if ((index = nodeNames.indexOf("lights")) == -1)
            return "tag <lights> missing";
        else {
            if (index != LIGHTS_INDEX)
                this.onXMLMinorError("tag <lights> out of order");

            //Parse lights block
            if ((error = this.parseLights(nodes[index])) != null)
                return error;
        }
        // <textures>
        if ((index = nodeNames.indexOf("textures")) == -1)
            return "tag <textures> missing";
        else {
            if (index != TEXTURES_INDEX)
                this.onXMLMinorError("tag <textures> out of order");

            //Parse textures block
            if ((error = this.parseTextures(nodes[index])) != null)
                return error;
        }

        // <materials>
        if ((index = nodeNames.indexOf("materials")) == -1)
            return "tag <materials> missing";
        else {
            if (index != MATERIALS_INDEX)
                this.onXMLMinorError("tag <materials> out of order");

            //Parse materials block
            if ((error = this.parseMaterials(nodes[index])) != null)
                return error;
        }

        // <nodes>
        if ((index = nodeNames.indexOf("nodes")) == -1)
            return "tag <nodes> missing";
        else {
            if (index != NODES_INDEX)
                this.onXMLMinorError("tag <nodes> out of order");

            //Parse nodes block
            if ((error = this.parseNodes(nodes[index])) != null)
                return error;
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
                this.cameras.set(id, new CGFcamera(fov, near, far, position, target));
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
                this.cameras.set(id, new CGFcameraOrtho(left, right, bot, top, near, far, position, target, up));
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

        this.lights = [];
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
            if (this.lights[lightId] != null)
                return "ID must be unique for each light (conflict: ID = " + lightId + ")";

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
            this.lights[lightId] = global;
            numLights++;
        }

        if (numLights == 0)
            return "at least one light must be defined";
        else if (numLights > 8)
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

            // TODO: Check this later
            // // Open the file
            // var fileTest = new File(fileName);
            // // See if the file exists
            // if(!fileTest.exists()) {
            //     this.onXMLMinorError("Texture with id '" + textureId + "' file does not exist: Skipping texture");
            // }

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

        // Any number of textures.
        var curNode = null;
        for (var i = 0; i < children.length; i++) {

            curNode = children[i];

            if (curNode.nodeName != "material") {
                this.onXMLMinorError("Unknown tag <" + curNode.nodeName + "> in materials block");
                continue;
            }

            // Get id of the current texture.
            var materialId = this.reader.getString(curNode, 'id');
            if (materialId == null) {
                this.onXMLMinorError("No id in <material> tag: Skipping material");
                continue;
            }

            // Checks for repeated IDs.
            if (this.materials.has(materialId)) {
                this.onXMLMinorError("ID must be unique for each texture (conflict: ID = " + materialId + "): Skipping material");
                continue;
            }

            // Read colors
            var colors = [null, null, null, null];
            var nodeNames = [];
            var grandChildren = curNode.children;
            for (var j = 0; j < grandChildren.length; j++) {
                nodeNames.push(grandChildren[j].nodeName);
            }
            for (var j = 0; j < attributeNames.length; j++) {
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
            var newAppearance = new CGFappearance();
            if (shininess != null)
                newAppearance.setShininess();
            else
                this.onXMLMinorError("Material with id '" + materialId + "' is missing shininess: Using default value");
            
            if (colors[0] != null)
                newAppearance.setAmbient(colors[0]);
            else
                this.onXMLMinorError("Material with id '" + materialId + '" is missing ambient component: Using default value');
            if (colors[1] != null)
                newAppearance.setDiffuse(colors[1]);
            else
                this.onXMLMinorError("Material with id '" + materialId + '" is missing diffuse component: Using default value');
            if (colors[2] != null)
                newAppearance.setSpecular(colors[2]);
            else
                this.onXMLMinorError("Material with id '" + materialId + '" is missing specular component: Using default value');
            if (colors[3] != null)
                newAppearance.setEmission(colors[3]);
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

        // Any number of nodes.
        for (var i = 0; i < children.length; i++) {

            if (children[i].nodeName != "node") {
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }

            // Get id of the current node.
            var nodeID = this.reader.getString(children[i], 'id');
            if (nodeID == null)
                return "no ID defined for nodeID";

            // Checks for repeated IDs.
            if (this.nodes.has(nodeID))
                return "ID must be unique for each node (conflict: ID = " + nodeID + ")";

            grandChildren = children[i].children;

            nodeNames = [];
            for (var j = 0; j < grandChildren.length; j++) {
                nodeNames.push(grandChildren[j].nodeName);
            }

            var transformationsIndex = nodeNames.indexOf("transformations");
            var materialIndex = nodeNames.indexOf("material");
            if (materialIndex == INDEX_NOT_FOUND) {
                this.onXMLMinorError("No <material> tag found: Skipping object");
                continue;
            }
            var textureIndex = nodeNames.indexOf("texture");
            if (textureIndex == INDEX_NOT_FOUND) {
                this.onXMLMinorError("No <texture> tag found; Skipping object");
                continue;
            }
            var descendantsIndex = nodeNames.indexOf("descendants");
            if (descendantsIndex == INDEX_NOT_FOUND) {
                this.onXMLMinorError("No <descendants> tag found: Skipping object");
                continue;
            }

            var matrix = mat4.create();
            var axisConvertor = {
                "xx": [1.0, 0.0, 0.0],
                "yy": [0.0, 1.0, 0.0],
                "zz": [0.0, 0.0, 1.0]
            };
            var curNode = null;

            // Transformations (optional)
            if (transformationsIndex != INDEX_NOT_FOUND) {
                var transformations = grandChildren[transformationsIndex].children;
                for (let k = 0; k < transformations.length; k++) {
                    curNode = transformations[k];
                    var nodeType = curNode.nodeName;
                    if (nodeType == "translation") {
                        var coords = this.parseCoordinates3D(curNode);
                        if (!Array.isArray(coords)) {
                            this.onXMLMinorError("Failed to read translation coords: Skipping translation");
                            continue;
                        }
                        mat4.translate(matrix, matrix, coords);
                    }
                    else if (nodeType == "rotation") {
                        var axis = this.reader.getString(curNode, "axis", true);
                        if (!axisConvertor.hasOwnProperty()) {
                            this.onXMLMinorError("Unexpected axis: Skipping rotation");
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
                            this.onXMLMinorError("Couldn't read scale: Skipping scale");
                            continue;
                        }
                        else
                            mat4.scale(matrix, matrix, scale);
                    }
                    else {
                        this.onXMLMinorError("Unexpected tag on node transformations");
                    }
                }
            }

            // Material (mandatory)
            curNode = grandChildren[materialIndex];
            var material = this.reader.getString(curNode, "id", true);
            if (material == null)
                return "Tag <material> had no id";


            // Texture (mandatory)
            curNode = grandChildren[textureIndex];
            var texture = this.reader.getString(curNode, "id", true);
            if (texture == null)
                return "Tag <texture> had no id";
            
            // texture amplification
            var afs = 1.0, aft = 1.0;
            nodeNames = [];
            for (var j = 0; j < curNode.children.length; j++) {
                nodeNames.push(curNode.children[j].nodeName);
            }
            var ampIndex = nodeNames.indexOf("amplification");
            var val = this.reader.getFloat(curNode.children[ampIndex], "afs", false);
            if (val != null)
                afs = val;
            val = this.reader.getFloat(curNode.children[ampIndex], "aft", false);
            if (val != null)
                aft = val;

            // Descendants
            // declaring descendants, at least one node or one leaf must be present: descendants may be mixed, nodes and leafs
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
                    // TODO PRIMITIVES:
                    var primitive = null;
                    if (primitive == null) {
                        this.onXMLMinorError("Invalid <leaf> tag of node ");
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

            if (descendants.length <= 0) {
                this.onXMLMinorError("There must be at least 1 valid descendant in node with id '" + nodeID + "': Skipping node");
                continue;
            }
            this.nodes.set(nodeID, new MyNode(material, texture, aft, afs, matrix, this.scene, descendants));
        }

        if (this.nodes.size <= 0)
            return "There must be at least 1 valid node";

        this.log("Parsed Nodes");
        return null;
    }


    parseBoolean(node, name, messageError){
        var boolVal = true;
        boolVal = this.reader.getBoolean(node, name);
        if (!(boolVal != null && !isNaN(boolVal) && (boolVal == true || boolVal == false)))
            this.onXMLMinorError("unable to parse value component " + messageError + "; assuming 'value = 1'");

        return boolVal || 1;
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
        var val = this.reader.getFloat(node, fieldName, true);
        if (val == null) {
            this.onXMLMinorError("Couldn't find '" + name + "' in node: " + messageError);
            return null;
        }
        return val;
    }

    /**
     * Displays the scene, processing each node, starting in the root node.
     */
    displayScene() {
        
        //To do: Create display loop for transversing the scene graph, calling the root node's display function
        
        //this.nodes[this.idRoot].display()


        //Testing Purposes:

        
        var testTriangle = new MyTriangle(this.scene,0,0,3,0,0,3);
        this.scene.earthAppearance.apply();
        testTriangle.display();
        

       
        /*
        var testSphere = new MySphere(this.scene, 20, 20, 0.5);

        this.scene.earthAppearance.apply();
        testSphere.display();
        */

        /*
        var testCilinder = new MyCilinder(this.scene,5,5,3,40,40);
        testCilinder.enableNormalViz();
        this.scene.earthAppearance.apply();
        testCilinder.display();
        */
        
        /*
        var testTorus = new MyTorus(this.scene,1,3,40,20);
        testTorus.enableNormalViz();
        this.scene.earthAppearance.apply();
        testTorus.display();
        */
    }


}