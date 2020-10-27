/**
 * @method constructor
 * @param  {CGFscene} scene - MyScene object
 * @param  {integer} slices - number of slices around Z axis
 * @param  {integer} stacks - number of stacks along Z axis, from the center to the poles (half of sphere)
 * @param  {float} radius - sphere's radius
 */

class MySphere extends CGFobject {

    constructor(scene, slices, stacks, radius) {
      super(scene);
      this.radius = radius;
      this.latDivs = stacks * 2;
      this.longDivs = slices;
  
      this.initBuffers();
    }

    initBuffers(){
        this.vertices = [];
        this.indices = [];
        this.normals = [];
        this.texCoords = [];

        var phi = 0;
        var theta = 0;
        var phiInc = Math.PI / this.latDivs;
        var thetaInc = (2 * Math.PI) / this.longDivs;
        var latVertices = this.longDivs + 1;

        var tex_s = 0;
        var texInc_s = 1 / this.longDivs;
        var tex_t = 0;
        var texInc_t = 1 / this.latDivs;

        // build an all-around stack at a time, starting on "north pole" and proceeding "south"
        for (let latitude = 0; latitude <= this.latDivs; latitude++) {
            var sinPhi = Math.sin(phi);
            var cosPhi = Math.cos(phi);

            // in each stack, build all the slices around, starting on longitude 0
            theta = 0;
            tex_s = 0;
            for (let longitude = 0; longitude <= this.longDivs; longitude++) {
                //-- Vertices coordinates
                var x = Math.sin(-theta) * sinPhi;
                var y = Math.cos(theta) * sinPhi;
                var z = cosPhi;
                this.vertices.push(x * this.radius, y * this.radius, z * this.radius);
    
                //--- Indices
                if (latitude < this.latDivs && longitude < this.longDivs) {
                    var current = latitude * latVertices + longitude;
                    var next = current + latVertices;
                    // pushing two triangles using indices from this round (current, current+1)
                    // and the ones directly south (next, next+1)
                    // (i.e. one full round of slices ahead)
                    
                    this.indices.push( current + 1, current, next);
                    this.indices.push( current + 1, next, next + 1);
                }
    
                //--- Normals
                // at each vertex, the direction of the normal is equal to 
                // the vector from the center of the sphere to the vertex.
                // in a sphere of radius equal to one, the vector length is one.
                // therefore, the value of the normal is equal to the position vectro
                this.normals.push(x, y, z);
                theta += thetaInc;

                //--- Texture Coordinates
                this.texCoords.push(tex_s, tex_t);
                tex_s += texInc_s;
            
            }
            phi += phiInc;
            tex_t += texInc_t;
        }

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();

    }

    /**
     * Enables/disables normal viz for object
     * @param {bool} val 
     */
    setNormalViz(val) {
        val ? this.enableNormalViz() : this.disableNormalViz();
    }
}