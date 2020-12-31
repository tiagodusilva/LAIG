class MyCGFcamera extends CGFcamera {

    constructor( fov, near, far, position, target ) {
        super( fov, near, far, position, target );
    
        super.orbit(CGFcameraAxisID.X, 0);

        this.originalFov = this.fov;
        this.originalNear = this.near;
        this.originalFar = this.far;
        this._originalUp = vec3.create();
        vec3.copy(this._originalUp, this._up);
        this.originalPosition = vec4.create();
        vec4.copy(this.originalPosition, this.position);
        this.originalTarget = vec4.create();
        vec4.copy(this.originalTarget, this.target);
    
        this.targetCamera = null;
        this.animationStart = null;
        this.animationFov = null;
        this.animationNear = null;
        this.animationFar = null;
        this.animationPosition = vec4.create();
        this.animationTarget = vec4.create();
        this._animationUp = vec3.create();
        this.scene = null;

        this.targetPosition = vec4.create();
        this.targetTarget = vec4.create();
        this._targetUp = vec3.create();
    }

    get isOrtho() {
        return false;
    }

    orbit(t, e) {
        if (this.targetCamera == null)
            super.orbit(t, e);
    }

    pan(t) {
        if (this.targetCamera == null)
            super.pan(t);
    }

    zoom(t) {
        if (this.targetCamera == null)
            super.zoom(t);
    }

    reset() {
        vec4.copy(this.position, this.originalPosition);
        vec4.copy(this.target, this.originalTarget);
        this.direction = this.calculateDirection();
        this.fov = this.originalFov;
        this.near = this.originalNear;
        this.far = this.originalFar;
        vec3.copy(this._up, this._originalUp);
    }

    resetToAnim() {
        vec4.copy(this.position, this.animationPosition);
        vec4.copy(this.target, this.animationTarget);
        this.direction = this.calculateDirection();
        this.fov = this.animationFov;
        this.near = this.animationNear;
        this.far = this.animationFar;
        vec3.copy(this._up, this._animationUp);
    }

    update(t) {
        if (this.targetCamera == null)
            return;
        
        if (this.animationStart == null)
            this.animationStart = t;

        let instant = (t - this.animationStart) / 2;
        instant = instant > 1 ? 1 : instant;
        this.position = lerpVec4(this.animationPosition, this.targetPosition, instant);
        this.target = lerpVec4(this.animationTarget, this.targetTarget, instant);
        this.direction = this.calculateDirection();

        this.fov = lerp(this.animationFov, this.targetFov, instant);
        this.near = lerp(this.animationNear, this.targetNear, instant);
        this.far = lerp(this.animationFar, this.targetFar, instant);

        vec3.normalize(this._up, lerpVec3(this._animationUp, this._targetUp, instant));


        if (instant == 1) {
            this.scene.camera = this.targetCamera;
            this.scene.interface.setActiveCamera(this.targetCamera);
            if (this != this.targetCamera)
                this.resetToAnim();
            this.targetCamera = null;
        }
    }

    animateToCamera(scene, camera) {
        this.scene = scene;
        this.targetCamera = camera;

        if (this == camera) {
            this.targetFov = this.animationFov;
            this.targetNear = this.animationNear;
            this.targetFar = this.animationFar;
            vec4.copy(this.targetPosition, this.animationPosition);
            vec4.copy(this.targetTarget, this.animationTarget);
            vec3.copy(this._targetUp, this._animationUp);
        } else {
            this.targetFov = this.targetCamera.fov;
            this.targetNear = this.targetCamera.near;
            this.targetFar = this.targetCamera.far;
            vec4.copy(this.targetPosition, this.targetCamera.position);
            vec4.copy(this.targetTarget, this.targetCamera.target);
            vec3.copy(this._targetUp, this.targetCamera._up);
        }

        this.animationStart = null;
        this.animationFov = this.fov;
        this.animationNear = this.near;
        this.animationFar = this.far;
        vec4.copy(this.animationPosition, this.position);
        vec4.copy(this.animationTarget, this.target);
        vec3.copy(this._animationUp, this._up);
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

    get isOrtho() {
        return true;
    }

    reset() {
        vec4.copy(this.position, this.originalPosition);
        vec4.copy(this.target, this.originalTarget);
        this._up = vec3.fromValues(0, 1, 0);
        this.direction = this.calculateDirection();
    }
}
