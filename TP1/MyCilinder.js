/**
* @method constructor
* @param  {CGFscene} scene - MyScene object
* @param  {integer} bottomRadius - Radius of the bottom base
* @param  {integer} topRadius - Radius of the top base
* @param  {integer} height - size in the direction of the positive Z axis
* @param  {integer} slices - number of divisions around the circunference
* @param  {integer} stacks - number of divisions along the Z direction
*/

class MyCilinder extends CGFobject {
    
    constructor(scene, bottomRadius, topRadius, height, slices, stacks) {
        super(scene);
        this.bottomRadius = bottomRadius;
        this.topRadius = topRadius;
        this.height = height;
        this.slices = slices;
        this.stacks = stacks;

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

        var theta = 0;
        var thetaInc = (2 * Math.PI) / this.slices;
        var verts = this.slices;

        var heightInc = this.height / this.stacks;

        var tex_s = 0;
        var texInc = 1 / this.slices;


        var heightPoints = this.stacks + 1;

        for (let angle = 0; angle <= verts; angle++) {
            var currHeight = 0;
            
            for(let stack = 0; stack < heightPoints; stack++){
                var vec = [Math.cos(theta), Math.sin(theta), currHeight];
                this.normals.push(...[Math.cos(theta), Math.sin(theta), 0]);
                this.vertices.push(...vec);
                this.texCoords.push(tex_s, 1 - stack / this.stacks);

                if (angle != verts && stack != this.stacks) {
                    this.indices.push(heightPoints * angle + stack, heightPoints * (angle + 1) + stack, heightPoints * angle + 1 + stack);
                    this.indices.push(heightPoints * (angle + 1) + stack + 1, heightPoints * angle + stack + 1, heightPoints * (angle + 1) + stack);
                }
                currHeight += heightInc;
            }

            
            theta += thetaInc;
            tex_s += texInc;
        }
        

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();

    }
}
  