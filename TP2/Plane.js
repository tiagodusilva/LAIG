class Plane extends CGFobject {
    constructor(scene, divsU, divsV) {
        super(scene);
        this.divsU = divsU;
        this.divsV = divsV;
        this.controlPoints = [
            [
                [-0.5, 0, 0.5],
                [0.5, 0, 0.5]
            ],
            [
                [-0.5, 0, -0.5],
                [0.5, 0, -0.5]
            ]
        ];
        this.nurbs = new CGFnurbsObject(this.scene, this.divsU, this.divsV, new CGFnurbsSurface(1, 1, this.controlPoints));
    }

    display(){
        this.nurbs.display();
    }

    setNormalViz(val) {
        val ? this.nurbs.enableNormalViz() : this.nurbs.disableNormalViz();
    }
}