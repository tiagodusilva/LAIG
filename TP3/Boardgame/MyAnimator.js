class MyAnimator {
    constructor(gameOrchestrator) {
        this.gameOrchestrator = gameOrchestrator;
        this.animations = [];
    }

    addAnimation(anim) {
        let exists = this.animations.find(a => a.target == anim.target);
        if (exists != undefined) {
            exists.endAnimation();
        }

        anim.setAnimator(this);
        this.animations.push(anim);
    }

    removeAnimation(anim) {
        this.animations = this.animations.filter(a => a != anim);
    }

    update(t) {
        this.animations.forEach( anim => anim.update(t) );
    }
}

const AnimationInterruption = {
    NONE: 0, // Simply cancels the animation execution
    CUT_TO_END: 1 // Sets target Transform to 'onInterruptTransform'
}

class MyAnimatorAnimation {
    constructor(target, interruptionBehaviour, callback=null) {
        this.animator = null;
        this.target = target;
        this.interruptionBehaviour = interruptionBehaviour;
        this.callback = callback;
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
        if (this.callback != null)
            this.callback();
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
        mat4.translate(this.mat, this.mat, this.position);
        mat4.rotate(this.mat, this.mat, this.rotation[0], [1, 0, 0]);
        mat4.rotate(this.mat, this.mat, this.rotation[1], [0, 1, 0]);
        mat4.rotate(this.mat, this.mat, this.rotation[2], [0, 0, 1]);
        mat4.scale(this.mat, this.mat, this.scale);
    }
}

class MyMovementAnimation extends MyAnimatorAnimation {
    constructor(target, startTransform, endTransform, speed=1, callback=null) {
        super(target, AnimationInterruption.CUT_TO_END, callback);

        this.startTransform = startTransform;
        this.endTransform = endTransform;
        let distance = Math.sqrt((startTransform.x - endTransform.x)**2 + (startTransform.z - endTransform.z)**2);
        this.height = Math.max(startTransform.y, endTransform.y) + (distance * 0.125 + 0.25);
        this.duration = 0.5 * speed * distance;
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

    constructor(target, ascend=true, callback=null) {
        super(target, AnimationInterruption.NONE, callback);
        
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
