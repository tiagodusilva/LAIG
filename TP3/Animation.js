function lerp(start, end, time) {
    return start * (1 - time) + end * time;
}

function lerpVec3(start, end, time) {
    return [
        lerp(start[0], end[0], time),
        lerp(start[1], end[1], time),
        lerp(start[2], end[2], time)
    ]
}

function lerpVec4(start, end, time) {
    return [
        lerp(start[0], end[0], time),
        lerp(start[1], end[1], time),
        lerp(start[2], end[2], time),
        lerp(start[3], end[3], time)
    ]
}

class Keyframe {

    constructor(instant, translation, rotation, scale) {
        this.instant = instant;
        this.translation = translation;
        this.rotation = rotation;
        this.scale = scale;
    }

    static interpolate(kf1, kf2, t) {
        if (t < kf1.instant)
            return null;
        if (t > kf2.instant) {
            // Calculate matrix of kf2
            let mat = mat4.create();
            mat4.translate(mat, mat, kf2.translation);
            mat4.rotate(mat, mat, kf2.rotation[0], [1, 0, 0]);
            mat4.rotate(mat, mat, kf2.rotation[1], [0, 1, 0]);
            mat4.rotate(mat, mat, kf2.rotation[2], [0, 0, 1]);
            mat4.scale(mat, mat, kf2.scale);
            return mat;
        }

        let interpolated = vec3.create();
        let normalizedTime = (t - kf1.instant) / (kf2.instant - kf1.instant);
        let mat = mat4.create();

        // vec3.lerp(interpolated, kf1.translation, kf2.translation, normalizedTime);
        interpolated = lerpVec3(kf1.translation, kf2.translation, normalizedTime);
        mat4.translate(mat, mat, interpolated);

        // vec3.lerp(interpolated, kf1.rotation, kf2.rotation, normalizedTime);
        interpolated = lerpVec3(kf1.rotation, kf2.rotation, normalizedTime);
        mat4.rotate(mat, mat, interpolated[0], [1, 0, 0]);
        mat4.rotate(mat, mat, interpolated[1], [0, 1, 0]);
        mat4.rotate(mat, mat, interpolated[2], [0, 0, 1]);

        // vec3.lerp(interpolated, kf1.scale, kf2.scale, normalizedTime);
        interpolated = lerpVec3(kf1.scale, kf2.scale, normalizedTime);
        mat4.scale(mat, mat, interpolated);

        return mat;
    }
}

class Animation {
    constructor(curKeyframe, nextKeyframe) {
        this.curKeyframe = curKeyframe;
        this.nextKeyframe = nextKeyframe;
        this.matrix = mat4.create();
    }

    update(t) {
        this.matrix = Keyframe.interpolate(this.curKeyframe, this.nextKeyframe, t);
    }

    apply() {
        return this.matrix;
    }
}

class KeyframeAnimation extends Animation {
    constructor(keyframes) {
        super(keyframes[0], keyframes.length > 1 ? keyframes[1] : keyframes[0]);
        this.keyframes = keyframes;
        this.keyframeIndex = 1;
    }

    setNextKeyframe(t) {
        if (t < this.nextKeyframe.instant) {
            return;
        }

        for (let i = this.keyframeIndex; i < this.keyframes.length - 1; i++) {
            if (t >= this.keyframes[i].instant && t <= this.keyframes[i + 1].instant) {
                // Somewhere in the middle (and never the beginning)
                this.curKeyframe = this.keyframes[i];
                this.nextKeyframe = this.keyframes[i + 1];
                this.keyframeIndex = i + 1;

                return;
            }
        }

        // Last keyframe
        let last = this.keyframes.length - 1;
        this.curKeyframe = this.keyframes[last];
        this.nextKeyframe = this.keyframes[last];
        // Marks the animation and terminated
        this.keyframeIndex = this.keyframes.length;
    }

    update(t) {
        // If animation has not ended
        if (this.keyframeIndex < this.keyframes.length) {
            // Find next keyframe (update could be extremely slow or animation have really small time intervals)
            this.setNextKeyframe(t);
            super.update(t);
        }
    }
}

