/**
* MyInterface class, creating a GUI interface.
*/
class MyInterface extends CGFinterface {
    /**
     * @constructor
     */
    constructor() {
        super();
    }

    /**
     * Initializes the interface.
     * @param {CGFapplication} application
     */
    init(application) {
        super.init(application);
        // init GUI. For more information on the methods, check:
        //  http://workshop.chromeexperiments.com/examples/gui

        this.gui = new dat.GUI();

        this.initKeys();

        return true;
    }

    rebuildGui() {
        this.gui.destroy();
        this.gui = new dat.GUI();

        this.gui.add(this.scene, 'showAxis').name("Show Axis");
        this.gui.add(this.scene, 'showNormals').onChange(this.scene.changeNormalViz.bind(this.scene)).name('Show Normals');
        this.gui.add(this.scene, 'resetCameraGUI').name('Reset Camera').onChange(this.scene.resetCamera.bind(this.scene));
        this.gui.add(this.scene, 'selectedCamera', this.scene.cameraDropdown).onChange(this.scene.onCameraChange.bind(this.scene)).name('Camera');

        var lightFolder = this.gui.addFolder("Illumination");
        var i = 0;
        for (var lightId of this.scene.graph.lights.keys()) {
            if (i >= 8)
                break;
            
            lightFolder.add(this.scene, 'lightEnabled' + i).name(lightId);
            i++;
        }

    }

    /**
     * initKeys
     */
    initKeys() {
        this.scene.gui=this;
        this.processKeyboard=function(){};
        this.activeKeys={};
    }

    processKeyDown(event) {
        this.activeKeys[event.code]=true;
    };

    processKeyUp(event) {
        this.activeKeys[event.code]=false;
    };

    isKeyPressed(keyCode) {
        return this.activeKeys[keyCode] || false;
    }
}