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

    changeGameMode(gamemodeChosen) {
        this.gameOptionsFolderElements.forEach(elem => {
            this.newGameOptionsFolder.remove(elem);
        });
        this.gameOptionsFolderElements = [];

        //First call doesnt count because it is the initial on change
        if(gamemodeChosen == gamemode.HUMAN_VS_COMPUTER) {
            this.gameOptionsFolderElements.push(this.newGameOptionsFolder.add(this.scene.gameorchestrator, 'newGameDifficulty2', computerDifficulty).name('AI Difficulty'));
        } else if (gamemodeChosen == gamemode.COMPUTER_VS_HUMAN) {
            this.gameOptionsFolderElements.push(this.newGameOptionsFolder.add(this.scene.gameorchestrator, 'newGameDifficulty1', computerDifficulty).name('AI Difficulty'));
        } else if (gamemodeChosen == gamemode.COMPUTER_VS_COMPUTER) {
            this.gameOptionsFolderElements.push(this.newGameOptionsFolder.add(this.scene.gameorchestrator, 'newGameDifficulty1', computerDifficulty).name('AI 1 Difficulty'));
            this.gameOptionsFolderElements.push(this.newGameOptionsFolder.add(this.scene.gameorchestrator, 'newGameDifficulty2', computerDifficulty).name('AI 2 Difficulty'));
        }

        this.gameOptionsFolderElements.push(this.newGameOptionsFolder.add(this.scene.gameorchestrator, 'markRestartGame').name('Restart Game'));
    }

    rebuildGui() {
        this.gui.destroy();
        this.gui = new dat.GUI();
        //Used to store the folder elements that need to be changed
        this.gameOptionsFolderElements = [];

        
        this.gameOptionsFolder = this.gui.addFolder("Game Options");
        this.gameOptionsFolder.open();
        this.gameOptionsFolder.add(this.scene, '_selectedScene', this.scene.scenesDropdown).onChange(this.scene.onSelectedSceneChange.bind(this.scene)).name("Scene");
        this.gameOptionsFolder.add(this.scene, 'undoMoveGUI').name('Undo last move');
        this.gameOptionsFolder.add(this.scene, 'playMovieGUI').name('Play game movie');

        this.newGameOptionsFolder = this.gui.addFolder("New Game");
        this.newGameOptionsFolder.open();
        this.newGameOptionsFolder.add(this.scene.gameorchestrator, 'nextGameMaxTurnTime', 0, 180).name('Turn Timer');
        this.newGameOptionsFolder.add(this.scene.gameorchestrator, 'newGameGamemode', gamemode).onChange((val) => this.changeGameMode(val)).name('Gamemode');
        //First call that needs to be done
        this.changeGameMode(this.scene.gameorchestrator.gamemode);


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