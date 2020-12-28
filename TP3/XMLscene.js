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

        // Deltatime
        this.startT = null;
        this.currTime = 0;

        this.enableTextures(true);

        this.gl.clearDepth(100.0);
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.enable(this.gl.CULL_FACE);
        this.gl.depthFunc(this.gl.LEQUAL);

        this.axis = new CGFaxis(this);

        this.setUpdatePeriod(20);
        this.setPickEnabled(true);

        this.loadingProgressObject = new MyRectangle(this, -1, -.1, 1, .1);
        this.loadingProgress = 0;

        this.defaultAppearance = new MyCGFmaterial(this);

        this.material = this.defaultAppearance;
        this.material.apply();

        //Material Stack
        this.materialStack = [this.material];

        // Texture stack
        this.textureStack = [null];

        // Texture stack
        this.shaderStack = [this.defaultShader];

        this.activeTexture = null;

        this.showAxis = false;
        this.showNormals = false;
        this.showLights = false;

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

        this.currentUniqueId = -1;

        this.gameorchestrator = new MyGameOrchestrator(this);
        this.undoMoveGUI = () => this.gameorchestrator.undoMove();
        this.playMovieGUI = () => this.gameorchestrator.playMovie();
    }

    resetCamera() {
        this.camera.reset();
    };

    resetAllCameras() {
        for (let cam of this.graph.cameras.values()) {
            cam.reset();
        }
    };

    /**
     * Enables all lights
     */
    enableAllLights() {
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
     */
    disableAllLights() {
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
            if (light[0]) {
                this.lights[i].enable();
                this["lightEnabled" + i] = true;
            }
            else {
                this.lights[i].disable();
                this["lightEnabled" + i] = false;
            }

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

    updateGraphLights() {
        //Only updates instantiated lights
        for (let i = 0; i < this.lightCount; i++) {
            if (this["lightEnabled" + i])
                this.lights[i].enable();
            else
                this.lights[i].disable();

            this.lights[i].setVisible(this.showLights);
            this.lights[i].update();
        }
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
        this.material.apply();
    }

    popMaterial() {
        let popped = this.materialStack.pop();
        popped.apply();
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
        let popped = this.textureStack.pop();
        if (popped != null)
            popped.bind(0);
        else
            this.unbindTexture(0);
    }

    pushShader(shader) {
        this.shaderStack.push(this.activeShader);
        this.setActiveShader(shader);
    }

    popShader() {
        let popped = this.shaderStack.pop();
        if (popped != null) {
            this.setActiveShader(popped);
        }
        else {
            console.log("This should not have happened");
        }
    }

    update(t) {
        if (this.sceneInited) {
            // Deltatime is normalized to seconds
            if (this.startT == null) {
                this.startT = t;
                this.currTime = 0;
            }
            else
                this.currTime = (t - this.startT) / 1000;


            for (let animation of this.graph.animations.values()) {
                animation.update(this.currTime);
            }

            for (let spriteAnim of this.graph.spriteAnims) {
                spriteAnim.update(this.currTime);
            }

            if (this.gameorchestrator)
                this.gameorchestrator.update(this.currTime);
        }
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

        // Apply transformations corresponding to the camera position relative to the origin
        this.applyViewMatrix();

        this.pushMatrix();

        //Update lights after GUI changes
        this.updateGraphLights();

        if (this.sceneInited) {
            this.gl.enable(this.gl.BLEND);
            this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);

            this.looped = true;
            // Draw axis
            if (this.showAxis) {
                this.defaultAppearance.apply();
                this.axis.display();
            }
            this.defaultAppearance.apply();

            // Displays the scene (MySceneGraph function).
            // this.graph.displayScene();
            this.gameorchestrator.managePick(this.pickMode, this.pickResults);
            this.clearPickRegistration();
            this.gameorchestrator.display();

            this.gl.disable(this.gl.BLEND);
        }
        else {
            // Show some "loading" visuals
            this.defaultAppearance.apply();

            this.rotate(-this.loadingProgress / 10.0, 0, 0, 1);

            this.loadingProgressObject.display();
            this.loadingProgress++;
        }

        this.popMatrix();
        // ---- END Background, camera and axis setup
    }
}
