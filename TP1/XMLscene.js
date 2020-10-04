/**
 * XMLscene class, representing the scene that is to be rendered.
 */
class XMLscene extends CGFscene {
    /**
     * @constructor
     * @param {MyInterface} myinterface 
     */
    constructor(myinterface) {
        super();

        this.interface = myinterface;
    }

    /**
     * Initializes the scene, setting some WebGL defaults, initializing the camera and the axis.
     * @param {CGFApplication} application
     */
    init(application) {
        super.init(application);

        this.sceneInited = false;

        this.initCameras();

        this.enableTextures(true);

        this.gl.clearDepth(100.0);
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.enable(this.gl.CULL_FACE);
        this.gl.depthFunc(this.gl.LEQUAL);

        this.axis = new CGFaxis(this);
        this.setUpdatePeriod(100);

        this.loadingProgressObject=new MyRectangle(this, -1, -.1, 1, .1);
        this.loadingProgress=0;

        this.defaultAppearance=new CGFappearance(this);

        this.material = this.defaultAppearance;
        this.material.apply();

        // Texture stack
        this.textureStack = [ null ];

        //Material Stack
        this.materialStack = [ this.material ];

        this.activeTexture = null;

        this.showAxis = false;
        this.showNormals = false;
        this.resetCameraGUI = false;
        this.enableLightsBool = false;
        this.disableLightsBool = false;

        //Used to control the lights from the GUI
        this.lightCount = 0;
        this.lightEnabled0;
        this.lightEnabled1;
        this.lightEnabled2;
        this.lightEnabled3;
        this.lightEnabled4;
        this.lightEnabled5;
        this.lightEnabled6;
        this.lightEnabled7;
    }

    /**
     * Enables all lights
     * @param {bool} val 
     */
    enableAllLights(val) {
        this.enableLightsBool = false;

        var i = 0;
        for (var lightId of this.graph.lights.keys()) {
            if (i >= 8)
                break;

            this['lightEnabled' + i] = true;
            i++;
        }
        this.interface.updateLightDisplay();
    }

    /**
     * Disables all lights
     * @param {bool} val 
     */
    disableAllLights(val) {
        this.disableLightsBool = false;

        var i = 0;
        for (var lightId of this.graph.lights.keys()) {
            if (i >= 8)
                break;

            this['lightEnabled' + i] = false;
            i++;
        }
        this.interface.updateLightDisplay();
    }

    /**
     * Enables/Disables normal viz
     * @param {bool} val 
     */
    changeNormalViz(val) {
        this.graph.setNormalViz(val);
    }

    /**
     * Initializes the scene cameras.
     */
    initCameras() {
        this.camera = new MyCGFcamera(0.4, 0.1, 500, vec3.fromValues(15, 15, 15), vec3.fromValues(0, 0, 0));
    }
    /**
     * Initializes the scene lights with the values read from the XML file.
     */
    initLights() {
        var i = 0;
        // Lights index.

        // Reads the lights from the scene graph.
        for (var [lightId, light] of this.graph.lights.entries()) {
            if (i >= 8)
                break;              // Only eight lights allowed by WebCGF on default shaders.

            this.lights[i].setPosition(...light[1]);
            this.lights[i].setAmbient(...light[2]);
            this.lights[i].setDiffuse(...light[3]);
            this.lights[i].setSpecular(...light[4]);

            this.lights[i].setVisible(true);
            if (light[0])
                this.lights[i].enable();
            else
                this.lights[i].disable();

            this["lightEnabled" + i] = light[0];

            this.lights[i].update();
            
            //Used to update the lights in the GUI
            this.lightCount++;
            i++;
        }
    }

    /** Handler called when the graph is finally loaded. 
     * As loading is asynchronous, this may be called already after the application has started the run loop
     */
    onGraphLoaded() {
        this.axis = new CGFaxis(this, this.graph.referenceLength);

        this.gl.clearColor(...this.graph.background);

        this.setGlobalAmbientLight(...this.graph.ambient);

        this.initLights();

        this.updateGraphLights();

        console.log("On loaded");
        this.selectedCamera = this.graph.defaultCamera;
        this.cameraDropdown = {};
        var i = 0;
        for (let key of this.graph.cameras.keys()) {
            this.cameraDropdown[key] = i;
            if (key == this.graph.defaultCamera)
                this.selectedCamera = i;
            i++;
        }
        this.onCameraChange(this.selectedCamera);
        this.interface.rebuildGui();

        this.sceneInited = true;
    }

    onCameraChange(val) {
        this.selectedCamera = val;

        for (const property in this.cameraDropdown) {
            if (this.cameraDropdown[property] == this.selectedCamera) {
                var selectedCamera = this.graph.cameras.get(property);
                this.camera = selectedCamera;
                this.interface.setActiveCamera(this.camera);
                break;
            }
        }
    };

    resetCamera() {
        this.camera.reset();
        this.resetCameraGUI = false;
    }

    updateGraphLights() {
        //Only updates instantiated lights
        for (let i = 0; i < this.lightCount; i++){
            if(this["lightEnabled" + i])
                this.lights[i].enable();
            else
                this.lights[i].disable();

            this.lights[i].update();
        }
    }

    /**
     * Applies a material without messing with textures
     * CGFappearance.apply() would casually unbind the current texture and change the value of this.activeTexture, so this a way to circumvent that
     * Using this method allows us to bind/unbind textures only when needed, resulting is superior performance ;D
     * @param {CGFappearance} material 
     */
    applyMaterial(material) {
        this.setAmbient(material.ambient[0], material.ambient[1], material.ambient[2], material.ambient[3]);
        this.setDiffuse(material.diffuse[0], material.diffuse[1], material.diffuse[2], material.diffuse[3]);
        this.setSpecular(material.specular[0], material.specular[1], material.specular[2], material.specular[3]);
        this.setShininess(material.shininess);
        this.setEmission(material.emission[0], material.emission[1], material.emission[2], material.emission[3]);
    }

    /**
     * Unbinds any texture set on the scene
     * Once again just a more convenient way to use it, as unlike the CGFtexture.unbind(e) method, this one does not require an active texture object
     * @param {int} index
     */
    unbindTexture(index = 0) {
        var e = index || 0;
        this.gl.activeTexture(this.gl.TEXTURE0 + e);
        this.gl.bindTexture(this.gl.TEXTURE_2D, null);
        this.activeTexture = null;
    }

    pushMaterial(material) {
        this.materialStack.push(this.material);
        this.material = material;
        this.applyMaterial(this.material);
    }

    popMaterial() {
        var popped = this.materialStack.pop();
        this.applyMaterial(popped);
        this.material = popped;
    }

    pushTexture(texture) {
        this.textureStack.push(this.activeTexture);
        this.activeTexture = texture;
        if (texture != null)
            texture.bind(0);
        else
            this.unbindTexture(0);
    }

    popTexture() {
        var popped = this.textureStack.pop();
        if (popped != null)
            popped.bind(0);
        else
            this.unbindTexture(0);
    }

    /**
     * Displays the scene.
     */
    display() {
        // ---- BEGIN Background, camera and axis setup

        // Clear image and depth buffer everytime we update the scene
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        // Initialize Model-View matrix as identity (no transformation
        this.updateProjectionMatrix();
        this.loadIdentity();


        //Update lights after GUI changes
        this.updateGraphLights();

        // Apply transformations corresponding to the camera position relative to the origin
        this.applyViewMatrix();

        this.pushMatrix();

        for (var i = 0; i < this.lights.length; i++) {
            this.lights[i].setVisible(true);
            this.lights[i].enable();
        }

        if (this.sceneInited) {
            this.looped = true;
            // Draw axis
            if (this.showAxis) {
                this.defaultAppearance.apply();
                this.axis.display();
            } 
            this.defaultAppearance.apply();

            // Displays the scene (MySceneGraph function).
            this.graph.displayScene();
        }
        else
        {
            // Show some "loading" visuals
            this.defaultAppearance.apply();

            this.rotate(-this.loadingProgress/10.0,0,0,1);
            
            this.loadingProgressObject.display();
            this.loadingProgress++;
        }

        this.popMatrix();
        // ---- END Background, camera and axis setup
    }
}
