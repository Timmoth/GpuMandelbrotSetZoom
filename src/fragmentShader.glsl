precision highp float;

uniform vec2 u_zoomCenter;
uniform float u_zoomSize;
uniform vec2 u_size;
uniform float u_maxIterations;

vec3 hsl2rgb(in vec3 c) { // © 2014 Inigo Quilez, MIT license, see https://www.shadertoy.com/view/lsS3Wc
    vec3 rgb = clamp(abs(mod(c.x * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
    return c.z + c.y * (rgb - 0.5) * (1.0 - abs(2.0 * c.z - 1.0));
}

void main() {
    vec2 uv = gl_FragCoord.xy / vec2(500, 500);
    vec2 c = u_zoomCenter + (uv * 4.0 - vec2(2.0)) * (u_zoomSize / 4.0);
    vec2 x = vec2(0.0);

    float iterations = 0.0;
    do {
        x = mat2(x, -x.y, x.x) * x + c;
        if(length(x) > 2.0) {
            break;
        }
    } while(++iterations <= u_maxIterations);

    if(iterations < u_maxIterations) {
        float l = -log(iterations / u_maxIterations);
        vec3 hsl = vec3(l, 0.5, 0.5);
        gl_FragColor = vec4(hsl2rgb(hsl), 1);
    } else {
        gl_FragColor = vec4(0, 0, 0, 1);
    }
}