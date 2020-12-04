class MyGameOrchestrator {
    constructor(scene) {
        this.scene = scene;
        this.gameBoard = new MyGameboard(this.scene);
    }

    display(){
        this.gameBoard.display();
    }
}