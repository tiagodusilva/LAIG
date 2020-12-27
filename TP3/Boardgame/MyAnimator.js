class MyAnimator {
    constructor(gameOrchestrator) {
        this.gameOrchestrator = gameOrchestrator;
        this.animations = [];
    }

    addAnimation(anim) {
        anim.setAnimator(this);
        this.animations.push(anim);
    }

    removeAnimation(anim) {
        this.animations.filter( a => {
            if (a != anim)
                return a;
        });
    }

    update(t) {
        this.animations.forEach( anim => anim.update(t) );
    }
}

class Transform {
    constructor(pos, rotation, scale) {
        this.pos = pos;
        this.rotation = rotation;
        this.scale = scale;
        this.dirty = true;
        this.mat = null;
    }

    getMatrix() {
        if (this.dirty)
            this.recalculateMatrix();
        return this.mat;
    }

    recalculateMatrix() {
        this.dirty = false;
        this.mat = mat4.create();
        mat4.translate(this.mat, this.mat, this.pos);
        mat4.rotate(this.mat, this.mat, this.rotation[0], [1, 0, 0]);
        mat4.rotate(this.mat, this.mat, this.rotation[1], [0, 1, 0]);
        mat4.rotate(this.mat, this.mat, this.rotation[2], [0, 0, 1]);
        mat4.scale(this.mat, this.mat, this.scale);
    }
}

const moveType = {
    PARABOLA: 0
}

class MyMovementAnimation {
    static movements = [
        (s, e, d) => {
            return new Transform(
                lerpVec3(s.pos, e.pos, d),
                lerpVec3(s.rotation, e.rotation, d),
                lerpVec3(s.scale, e.scale, d)
            );
        }
    ];

    constructor(obj, startTransform, endTransform, duration) {
        this.obj = obj;
        this.startTransform = startTransform;
        this.endTransform = endTransform;
        this.duration = duration;
        this.initial = null;
    }

    setAnimator(animator) {
        this.animator = animator;
    }

    update(t) {
        if (this.initial === null)
            this.initial = t;

        let curInstance = (t - this.initial) / this.duration;
        curInstance = curInstance > 1 ? 1 : curInstance;
        this.obj.transform = MyMovementAnimation.movements[0](this.startTransform, this.endTransform, curInstance);

        if (curInstance >= 1)
            this.animator.removeAnimation(this);
    }
}
