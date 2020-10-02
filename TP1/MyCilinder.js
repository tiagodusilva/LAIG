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
        var heightPoints = this.stacks + 1;

        var tex_s = 0;
        var texInc = 1 / this.slices;

        //Used to make the normals perpendicular to the cilinder side face
        var normalSlope = (this.bottomRadius - this.topRadius) / heightPoints
        

        //Side Faces
        for (let angle = 0; angle <= verts; angle++) {
            var currHeight = 0;
            for(let stack = 0; stack <= this.stacks; stack++){
                //Vertices (Linear interpolation for different radius on top and bottom)
                var currHeightRatio = currHeight / this.height
                var currRadius = (1 - currHeightRatio) * this.bottomRadius + currHeightRatio * this.topRadius;
                var vert = [Math.cos(theta) * currRadius, Math.sin(theta) * currRadius, currHeight];
                this.vertices.push(...vert);

                //Calculate and normalize normals
                var normal = [Math.cos(theta), Math.sin(theta), normalSlope];
                var normalSize = Math.sqrt(Math.pow(normal[0], 2) + Math.pow(normal[1], 2) + Math.pow(normal[2], 2));
                this.normals.push(...normal.map(x => x / normalSize));

                this.texCoords.push(tex_s, 1 - stack / this.stacks);

                if (angle != verts && stack != this.stacks) {
                    this.indices.push(heightPoints * angle + stack, heightPoints * (angle + 1) + stack, heightPoints * angle + stack + 1);
                    this.indices.push(heightPoints * (angle + 1) + stack + 1, heightPoints * angle + stack + 1, heightPoints * (angle + 1) + stack);
                }
                currHeight += heightInc;
            }

            theta += thetaInc;
            tex_s += texInc;
        }


        //Bottom Face
        theta = 0;
        var vertexCount = heightPoints * (this.slices + 1) + 1;

        //Middle Point
        this.vertices.push(0, 0, 0);
        this.texCoords.push(0.5,0.5); //Middle of texture
        this.normals.push(0, 0, -1);
        var middleIndex = vertexCount;
        vertexCount++;

        for (let angle = 0; angle < verts; angle++) {
            this.vertices.push(Math.cos(theta) * this.bottomRadius, Math.sin(theta) * this.bottomRadius, 0);
            this.texCoords.push(0.5 + 0.5 * Math.cos(theta), 0.5 - 0.5 * Math.sin(theta));

            if (angle != verts) {
                this.indices.push(vertexCount + angle + 1, vertexCount + angle, middleIndex);
            }

            this.normals.push(0, 0, -1);

            theta += thetaInc;
        }


        //Top face
        theta = 0;
        vertexCount += this.slices;

        //Middle Point
        this.vertices.push(0, 0, this.height);
        this.texCoords.push(0.5,0.5); //Middle of texture
        this.normals.push(0, 0, 1);
        middleIndex = vertexCount;
        vertexCount++;

        for (let angle = 0; angle < verts; angle++) {
            this.vertices.push(Math.cos(theta) * this.topRadius, Math.sin(theta) * this.topRadius, this.height);
            this.texCoords.push(0.5 + 0.5 * Math.cos(theta), 0.5 - 0.5 * Math.sin(theta));

            if (angle != verts) {
                this.indices.push(vertexCount + angle, vertexCount + angle + 1, middleIndex);
            }

            this.normals.push(0, 0, 1);

            theta += thetaInc;
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
  