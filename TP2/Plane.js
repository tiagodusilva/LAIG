class Plane extends CGFobject {
    constructor(scene, divsU, divsV) {
        super(scene);
        this.divsU = divsU;
        this.divsV = divsV;
        this.controlPoints = [
            [ // V = 0..1;
                [-0.5, 0.0, 0.5, 1 ],
                [-0.5,  0.0, -0.5, 1 ]
               
           ],
           // U = 1
           [ // V = 0..1
                [0.5, 0, 0.5, 1 ],
                [0.5,  0, -0.5, 1 ]							 
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