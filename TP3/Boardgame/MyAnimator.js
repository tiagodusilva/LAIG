class MyAnimator {
    constructor(gameOrchestrator) {
        this.gameOrchestrator = gameOrchestrator;
        this.animations = [];
    }

    async addAnimation(anim) {
        let exists = this.animations.find(a => a[0].target == anim.target);
        if (exists != undefined) {
            exists[0].endAnimation();
        }

        let _res;
        let promise = new Promise((resolve, reject) => {
            _res = resolve;
        });
        anim.setAnimator(this);
        this.animations.push([anim, _res]);
        
        await promise;
    }

    removeAnimation(anim) {
        let old = this.animations.findIndex(a => a[0] == anim);
        this.animations[old][1]();
        this.animations.splice(old, 1);
    }

    removeAll() {
        this.animations.forEach( a => { a[0].endAnimation(); a[1](); } );
        this.animations = [];
    }

    update(t) {
        this.animations.forEach( anim => anim[0].update(t) );
    }
}

const AnimationInterruption = {
    NONE: 0, // Simply cancels the animation execution
    CUT_TO_END: 1 // Sets target Transform to 'onInterruptTransform'
}

class MyAnimatorAnimation {
    constructor(target, interruptionBehaviour) {
        this.animator = null;
        this.target = target;
        this.interruptionBehaviour = interruptionBehaviour;
    }

    setAnimator(animator) {
        this.animator = animator;
    }

    onInterruptTransform() {
        // To be overriden by children
        return null;
    }

    endAnimation() {
        if (this.interruptionBehaviour == AnimationInterruption.CUT_TO_END) {
            this.target.transform = this.onInterruptTransform();
            this.target.transform.markDirty();
        }

        if (this.animator != null)
            this.animator.removeAnimation(this);
    }
}

class Transform {
    constructor(position, rotation, scale) {
        this._position = position;
        this._rotation = rotation;
        this._scale = scale;
        this.mat = null;

        this.markDirty();
    }

    clone() {
        return new Transform([...this._position], [...this._rotation], [...this._scale]);
    }

    getMatrix() {
        if (this.dirty)
            this.recalculateMatrix();
        return this.mat;
    }

    get position() { return this._position; }
    get rotation() { return this._rotation; }
    get scale() { return this._scale; }

    get x() { return this._position[0]; }
    get y() { return this._position[1]; }
    get z() { return this._position[2]; }

    set x(x) {
        if (this._position[0] != x) this.markDirty();
        this._position[0] = x;
    }
    set y(y) {
        if (this._position[1] != y) this.markDirty();
        this._position[1] = y;
    }
    set z(z) {
        if (this._position[2] != z) this.markDirty();
        this._position[2] = z;
    }

    get xAngle() { return this._rotation[0]; }
    get yAngle() { return this._rotation[1]; }
    get zAngle() { return this._rotation[2]; }

    set xAngle(xAngle) {
        if (this._rotation[0] != xAngle) this.markDirty();
        this._rotation[0] = xAngle;
    }
    set yAngle(yAngle) {
        if (this._rotation[1] != yAngle) this.markDirty();
        this._rotation[1] = yAngle;
    }
    set zAngle(zAngle) {
        if (this._rotation[2] != zAngle) this.markDirty();
        this._rotation[2] = zAngle;
    }

    get sx() { return this._scale[0]; }
    get sy() { return this._scale[1]; }
    get sy() { return this._scale[2]; }

    set sx(sx) {
        if (this._scale[0] != sx) this.markDirty();
        this._scale[0] = sx;
    }
    set sy(sy) {
        if (this._scale[1] != sy) this.markDirty();
        this._scale[1] = sy;
    }
    set sz(sz) {
        if (this._scale[2] != sz) this.markDirty();
        this._scale[2] = sz;
    }

    markDirty() {
        this.dirty = true;
    }

    recalculateMatrix() {
        this.dirty = false;
        this.mat = mat4.create();
        mat4.translate(this.mat, this.mat, this._position);
        mat4.rotate(this.mat, this.mat, this._rotation[0], [1, 0, 0]);
        mat4.rotate(this.mat, this.mat, this._rotation[1], [0, 1, 0]);
        mat4.rotate(this.mat, this.mat, this._rotation[2], [0, 0, 1]);
        mat4.scale(this.mat, this.mat, this._scale);
    }
}

class MyMovementAnimation extends MyAnimatorAnimation {
    constructor(target, startTransform, endTransform) {
        super(target, AnimationInterruption.CUT_TO_END);

        this.startTransform = startTransform;
        this.endTransform = endTransform;
        let distance = Math.sqrt((startTransform.x - endTransform.x)**2 + (startTransform.z - endTransform.z)**2);
        this.height = Math.max(startTransform.y, endTransform.y) + (distance * 0.125 + 0.25);
        this.duration = 0.5 * Math.sqrt(distance);
        this.initial = null;
    }

    onInterruptTransform() {
        return this.endTransform;
    }

    update(t) {
        if (this.initial === null)
            this.initial = t;

        let curInstant = (t - this.initial) / this.duration;
        curInstant = curInstant > 1 ? 1 : curInstant;

        this.target.transform.x = lerp(this.startTransform.x, this.endTransform.x, curInstant);
        this.target.transform.z = lerp(this.startTransform.z, this.endTransform.z, curInstant);

        this.target.transform.y = lerp(this.startTransform.y, this.endTransform.y, curInstant);

        this.target.transform.y = curInstant < 0.5 ?
            lerp(this.startTransform.y, this.height, Math.sin(Math.PI * curInstant)) :
            lerp(this.endTransform.y, this.height, Math.sin(Math.PI * curInstant));

        if (curInstant >= 1)
            this.endAnimation();
    }
}

class MyHoverAnimation extends MyAnimatorAnimation {
    static height = 0.25;
    static duration = 0.25;

    constructor(target, ascend=true) {
        super(target, AnimationInterruption.NONE);
        
        if (ascend) {
            this.startTransform = target.transform.clone();
            this.endTransform = target.generateOwnTransform();
            this.endTransform.y = this.endTransform.y + MyHoverAnimation.height;
        } else {
            this.endTransform = target.generateOwnTransform();
            this.startTransform = target.transform.clone();
        }

        this.ascend = ascend;
        this.initial = null;
    }

    onInterruptTransform() {
        return this.target.transform.clone();
    }

    update(t) {
        if (this.initial === null)
            this.initial = t;

        let curInstant = (t - this.initial) / MyHoverAnimation.duration;
        curInstant = curInstant > 1 ? 1 : curInstant;        
        this.target.transform.y = lerp(this.startTransform.y, this.endTransform.y, curInstant);

        if (curInstant >= 1) {
            this.endAnimation();
        }
    }
}
