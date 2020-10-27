class MyCGFcamera extends CGFcamera {

    constructor( fov, near, far, position, target ) {
        super( fov, near, far, position, target );
    
        this.originalPosition = vec4.create();
        vec4.copy(this.originalPosition, this.position);
        this.originalTarget = vec4.create();
        vec4.copy(this.originalTarget, this.target);
    }

    reset() {
        vec4.copy(this.position, this.originalPosition);
        vec4.copy(this.target, this.originalTarget);
        this._up = vec3.fromValues(0, 1, 0);
        this.direction = this.calculateDirection();
    }
}

class MyCGFcameraOrtho extends CGFcameraOrtho {
    constructor( left, right, bottom, top, near, far, position, target, up ) {
        super( left, right, bottom, top, near, far, position, target, up );

        this.originalPosition = vec4.create();
        vec4.copy(this.originalPosition, this.position);
        this.originalTarget = vec4.create();
        vec4.copy(this.originalTarget, this.target);
    }

    reset() {
        vec4.copy(this.position, this.originalPosition);
        vec4.copy(this.target, this.originalTarget);
        this._up = vec3.fromValues(0, 1, 0);
        this.direction = this.calculateDirection();
    }
}
