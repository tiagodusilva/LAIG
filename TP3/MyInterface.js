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

        let gameOptionsFolder = this.gui.addFolder("Game Options");
        gameOptionsFolder.open();
        gameOptionsFolder.add(this.scene, 'undoMoveGUI').name('Undo last move');
        gameOptionsFolder.add(this.scene, 'playMovieGUI').name('Play game movie');
        gameOptionsFolder.add(this.scene.gameorchestrator, 'gamemode', gamemode).name('Gamemode');
        gameOptionsFolder.add(this.scene.gameorchestrator, 'difficulty1', computerDifficulty).name('White Difficulty');
        gameOptionsFolder.add(this.scene.gameorchestrator, 'difficulty2', computerDifficulty).name('Black Difficulty');
        gameOptionsFolder.add(this.scene.gameorchestrator, 'startGame').name('Start Game');

        let sceneFolder = this.gui.addFolder("Scene Configuration");

        sceneFolder.add(this.scene, 'showAxis').name("Show Axis");
        sceneFolder.add(this.scene, 'showNormals').onChange(this.scene.changeNormalViz.bind(this.scene)).name('Show Normals');

        let cameraFolder = sceneFolder.addFolder("Cameras");
        cameraFolder.open();
        cameraFolder.add(this.scene, 'resetAllCameras').name('Reset All Cameras');
        cameraFolder.add(this.scene, 'resetCamera').name('Reset Camera');
        cameraFolder.add(this.scene, 'selectedCamera', this.scene.cameraDropdown).onChange(this.scene.onCameraChange.bind(this.scene)).name('Camera');

        let lightFolder = sceneFolder.addFolder("Illumination");
        lightFolder.open();

        lightFolder.add(this.scene, 'showLights').name("Display Lights");

        let lightListFolder = lightFolder.addFolder("Lights");
        lightListFolder.open();

        let i = 0;
        this.lightButtons = [];
        for (let lightId of this.scene.graph.lights.keys()) {
            if (i >= 8)
                break;
            
            this.lightButtons.push(lightListFolder.add(this.scene, 'lightEnabled' + i).name(lightId));
            i++;
        }

        lightFolder.add(this.scene, 'enableAllLights').name("Enable All");
        lightFolder.add(this.scene, 'disableAllLights').name("Disable all");

    }

    updateLightDisplay() {
        for (let toggle of this.lightButtons) {
            toggle.updateDisplay();
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