class Patch extends CGFobject {
    constructor(scene, divsU, divsV, pointsU, pointsV, controlPoints) {
        super(scene);
        this.divsU = divsU;
        this.divsV = divsV;
        this.pointsU = pointsU;
        this.pointsV = pointsV;
        this.controlPoints = controlPoints;
        this.nurbs = new CGFnurbsObject(this.scene, this.divsU, this.divsV, new CGFnurbsSurface(this.pointsU - 1, this.pointsV - 1, this.controlPoints));
    }

    display() {
        this.nurbs.display();
    }

    setNormalViz(val) {
        val ? this.nurbs.enableNormalViz() : this.nurbs.disableNormalViz();
    }
}