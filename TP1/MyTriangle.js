/**
 * MyRectangle
 * @constructor
 * @param scene - Reference to MyScene object
 * @param x1 - x coordinate corner 1
 * @param y1 - y coordinate corner 1
 * @param x2 - x coordinate corner 2
 * @param y2 - y coordinate corner 2
 * @param x3 - x coordinate corner 3
 * @param y3 - y coordinate corner 3
 */
class MyTriangle extends CGFobject {
	constructor(scene, x1, y1, x2, y2, x3, y3, afs, aft) {
		super(scene);
		this.x1 = x1;
		this.x2 = x2;
		this.y1 = y1;
		this.y2 = y2;
		this.x3 = x3;
		this.y3 = y3;

		this.afs = afs;
		this.aft = aft;

		this.a = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
		this.b = Math.sqrt(Math.pow(x3 - x2, 2) + Math.pow(y3 - y2, 2));
		this.c = Math.sqrt(Math.pow(x1 - x3, 2) + Math.pow(y1 - y3, 2));

		this.cosAlpha = (Math.pow(this.a, 2) - Math.pow(this.b, 2) + Math.pow(this.c, 2)) / (2 * this.a * this.c);
		this.sinAlpha = Math.sqrt(1 - Math.pow(this.cosAlpha, 2))

		this.initBuffers();
	}
	
	initBuffers() {
		this.vertices = [
			this.x1, this.y1, 0,	//0
			this.x2, this.y2, 0,	//1
			this.x3, this.y3, 0		//2
		];

		//Counter-clockwise reference of vertices
		this.indices = [0, 1, 2];

		//Facing Z positive
		this.normals = [
			0, 0, 1,
			0, 0, 1,
			0, 0, 1
		];
		
		/*
		Texture coords (s,t)
		+----------> s
        |
        |
		|
		v
        t
        */

		// this.texCoords = [
		// 	0, 0,												//T1
		// 	this.a, 0,											//T2
		// 	-this.c * this.cosAlpha, -this.c * this.sinAlpha	//T3
		// ];
		
		this.texCoords = [
			0, 1,																		//T1
			this.a / this.afs, 1,														//T2
			this.c * this.cosAlpha / this.afs, 1 - (this.c * this.sinAlpha / this.aft)	//T3
		];

		this.primitiveType = this.scene.gl.TRIANGLES;
		this.initGLBuffers();
	}

	/**
	 * @method updateTexCoords
	 * Updates the list of texture coordinates of the rectangle
	 * @param {Array} coords - Array of texture coordinates
	 */
	updateTexCoords(coords) {
		this.texCoords = [...coords];
		this.updateTexCoordsGLBuffers();
	}

    /**
     * Enables/disables normal viz for object
     * @param {bool} val 
     */
    setNormalViz(val) {
        val ? this.enableNormalViz() : this.disableNormalViz();
    }

}

