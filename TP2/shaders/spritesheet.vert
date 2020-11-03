#ifdef GL_ES
precision highp float;
#endif

attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec2 aTextureCoord;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat4 uNMatrix;

varying vec2 vTextureCoord;
uniform sampler2D uSampler2;

uniform float M, N;
uniform float m, n;

void main() {
	vTextureCoord = vec2((aTextureCoord.x + m) / M, (aTextureCoord.y + n) / N);

	gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
}

