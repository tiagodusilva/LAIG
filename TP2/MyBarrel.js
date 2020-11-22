class MyBarrel extends CGFobject {
    
    static alpha = 30;

    constructor(scene, base, middle, height, slices, stacks) {
        super(scene);

        this.base = base;
        this.middle = middle;
        this.height = height;

        this.baseControlP = (4.0 / 3.0) * base;
        this.middleControlP = (4.0 / 3.0) * middle;
        this.widthOffset = (4.0 / 3.0) * (middle - base);

        let tg = Math.tan(MyBarrel.alpha);

        let controlPoints = [
            [
                [this.base, 0, 0, 1],
                [this.base + this.widthOffset, 0, this.widthOffset / tg, 1],
                [this.base + this.widthOffset, 0, this.height - this.widthOffset / tg, 1],
                [this.base, 0, this.height, 1]
            ],
            [
                [this.base, this.baseControlP, 0, 1],
                [this.base + this.widthOffset, this.middleControlP, this.widthOffset / tg, 1],
                [this.base + this.widthOffset, this.middleControlP, this.height - this.widthOffset / tg, 1],
                [this.base, this.baseControlP, this.height, 1]
            ],
            [
                [-this.base, this.baseControlP, 0, 1],
                [-(this.base + this.widthOffset), this.middleControlP, this.widthOffset / tg, 1],
                [-(this.base + this.widthOffset), this.middleControlP, this.height - this.widthOffset / tg, 1],
                [-this.base, this.baseControlP, this.height, 1]
            ],
            [
                [-this.base, 0, 0, 1],
                [-(this.base + this.widthOffset), 0, this.widthOffset / tg, 1],
                [-(this.base + this.widthOffset), 0, this.height - this.widthOffset / tg, 1],
                [-this.base, 0, this.height, 1]
            ],
        ];
        
        this.nurbs = new CGFnurbsObject(this.scene, slices, stacks, new CGFnurbsSurface(3, 3, controlPoints));
    }

    display() {
        this.scene.pushMatrix();
        this.nurbs.display();
        this.scene.rotate(Math.PI, 0, 0, 1)
        this.nurbs.display();
        this.scene.popMatrix();
    }

    setNormalViz(val) {
        val ? this.nurbs.enableNormalViz() : this.nurbs.disableNormalViz();
    }
}