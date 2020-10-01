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

        // add a group of controls (and open/expand by defult)
        this.gui.add(this.scene, 'selectedCamera', this.scene.cameraDropdown).onChange(this.scene.onCameraChange.bind(this.scene)).name('Camera');

        this.gui.add(this.scene, 'showNormals').onChange(this.scene.changeNormalViz.bind(this.scene)).name('Show normals');
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