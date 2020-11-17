class MyBarrel extends CGFobject {
    
    static alpha = 30;

    Q1(x, y) {return [x * this.base, y, 0, 1]};
    Q2(x, y) {return [x * (this.base + this.H), y, this.H / Math.tan(MyBarrel.alpha), 1]};
    Q3(x, y) {return [x * (this.base + this.H), y, this.height - this.H / Math.tan(MyBarrel.alpha), 1]};
    Q4(x, y) {return [x * this.base, y, this.height, 1]};  

    constructor(scene, base, middle, height, slices, stacks) {
        super(scene);

        this.base = base;
        this.middle = middle;
        this.height = height;

        this.h = (4.0 / 3.0) * base;
        this.H = (4.0 / 3.0) * middle;
        this.widthOffset = (4.0 / 3.0) * (middle - base);

        // let P1 = [-base, 0, 0, 1];
        // let P2 = [-base, h, 0, 1];
        // let P3 = [base, h, 0, 1];
        // let P4 = [base, 0, 0, 1];

        // let Q1 = [base, 0, 0, 1];
        // let Q2 = [base + H, 0, H / Math.tan(MyBarrel.alpha), 1];
        // let Q3 = [base + H, 0, height - H / Math.tan(MyBarrel.alpha), 1];
        // let Q4 = [base, 0, height, 1];

        let tg = Math.tan(MyBarrel.alpha);

        let controlPoints = [
            [
                [this.base, 0, 0, 1],
                [this.base + this.widthOffset, 0, this.widthOffset / tg, 1],
                [this.base + this.widthOffset, 0, this.height - this.widthOffset / tg, 1],
                [this.base, 0, this.height, 1]
            ],
            [
                [this.base, this.h, 0, 1],
                [this.base + this.widthOffset, this.H, this.widthOffset / tg, 1],
                [this.base + this.widthOffset, this.H, this.height - this.widthOffset / tg, 1],
                [this.base, this.h, this.height, 1]
            ],
            [
                [-this.base, this.h, 0, 1],
                [-(this.base + this.widthOffset), this.H, this.widthOffset / tg, 1],
                [-(this.base + this.widthOffset), this.H, this.height - this.widthOffset / tg, 1],
                [-this.base, this.h, this.height, 1]
            ],
            [
                [-this.base, 0, 0, 1],
                [-(this.base + this.widthOffset), 0, this.widthOffset / tg, 1],
                [-(this.base + this.widthOffset), 0, this.height - this.widthOffset / tg, 1],
                [-this.base, 0, this.height, 1]
            ],
        ];

        console.log(controlPoints);
        
        this.nurbs = new CGFnurbsObject(this.scene, slices, stacks, new CGFnurbsSurface(3, 3, controlPoints));
    }

    display() {
        this.scene.pushMatrix();
        this.scene.translate(0, 0, -this.height / 2);
        this.nurbs.display();
        this.scene.rotate(Math.PI, 0, 0, 1)
        this.nurbs.display();
        this.scene.popMatrix();
    }

    setNormalViz(val) {
        val ? this.nurbs.enableNormalViz() : this.nurbs.disableNormalViz();
    }
}