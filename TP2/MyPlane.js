class MyPlane extends CGFobject {

    constructor(scene, divsU, divsV) {
        super(scene);
        this.weight = 1;
        this.scene = scene;
        this.divsU = divsU;
        this.divsV = divsV;
        this.controlPoints = [
            [
              [0.5, 0.0, -0.5, this.weight],
              [0.5, 0.0, 0.5, this.weight],
            ],
            [
              [-0.5, 0.0, -0.5, this.weight],
              [-0.5, 0.0, 0.5, this.weight],
            ],
      ];
        this.nurbObject = new CGFnurbsObject(this.scene, this.divsU, this.divsV, new CGFnurbsSurface(1, 1, this.controlPoints));
    }

    display() {
        this.nurbObject.display();
    }

    /**
    * Enables/disables normal viz for object
    * @param {bool} val 
    */
    setNormalViz(val) {
        val ? this.nurbObject.enableNormalViz() : this.nurbObject.disableNormalViz();
    }

}