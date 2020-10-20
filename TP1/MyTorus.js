/**
* @method constructor
* @param  {CGFscene} scene - MyScene object
* @param  {integer} innerRadius - The tube radius
* @param  {integer} outerRadius - radius of the circular axis of the torus
* @param  {integer} loops - number of divisions along the outer radius
* @param  {integer} slices - number of divisions along the inner radius
*/

class MyTorus extends CGFobject {
    
    constructor(scene, innerRadius, outerRadius, loops, slices) {
        super(scene);
        this.innerRadius = innerRadius;
        this.outerRadius = outerRadius;
        this.loops = loops;
        this.slices = slices;

        this.initBuffers();
    }
  
    /**
     * @method initBuffers
     * Initializes the sphere buffers
     */
    initBuffers() {
        this.vertices = [];
        this.indices = [];
        this.normals = [];
        this.texCoords = [];

        //Used for loops(outer radius)
        var phi = 0;
        var phiInc = (2 * Math.PI) / this.loops;
        var outerVerts = this.loops;

        //Used for slices(inner radius)
        var theta = 0;
        var thetaInc = (2 * Math.PI) / this.slices;
        var innerVerts = this.slices;


        var loopPoints = this.slices + 1;


        var tex_s = 0;
        var tex_sInc = 1 / this.slices;

        var tex_t = 0;
        var tex_tInc = 1 /this.loops;


        for (let outerAngle = 0; outerAngle <= outerVerts; outerAngle++) {
            for(let innerAngle = 0; innerAngle <= innerVerts; innerAngle++){

                this.vertices.push(
                    (this.outerRadius + this.innerRadius * Math.cos(theta)) * Math.cos(phi),
                    (this.outerRadius + this.innerRadius * Math.cos(theta)) * Math.sin(phi), 
                    Math.sin(theta) * this.innerRadius
                );

                //Calculate normals
                this.normals.push(
                    Math.cos(theta) * Math.cos(phi), 
                    Math.cos(theta) * Math.sin(phi), 
                    Math.sin(theta)
                );

                this.texCoords.push(tex_s, tex_t);

                if (outerAngle != outerVerts && innerAngle != innerVerts) {
                    this.indices.push(loopPoints * outerAngle + innerAngle, loopPoints * (outerAngle + 1) + innerAngle, loopPoints * outerAngle + innerAngle + 1);
                    this.indices.push(loopPoints * (outerAngle + 1) + innerAngle + 1, loopPoints * outerAngle + innerAngle + 1, loopPoints * (outerAngle + 1) + innerAngle);
                }
                theta += thetaInc;
                tex_s += tex_sInc;
            }
            
            theta = 0;
            phi += phiInc;
            tex_t += tex_tInc;
            tex_s = 0;
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
  