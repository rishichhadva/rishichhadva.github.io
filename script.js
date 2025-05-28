const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('nav-links');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('active');
  navLinks.classList.toggle('active');
});

const canvas = document.getElementById("glcanvas");
const gl = canvas.getContext("webgl");
let pointer = [0.5, 0.5];

canvas.addEventListener("pointermove", (e) => {
  const rect = canvas.getBoundingClientRect();
  pointer[0] = (e.clientX - rect.left) / rect.width;
  pointer[1] = 1.0 - (e.clientY - rect.top) / rect.height;
});

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
}
window.addEventListener("resize", resize);
resize();

const vert = `
  attribute vec2 a_position;
  void main() {
    gl_Position = vec4(a_position, 0, 1);
  }
`;

const frag = `
  precision mediump float;
  uniform vec2 u_resolution;
  uniform float u_time;
  uniform vec2 u_pointer;
  uniform float u_speed;
  uniform float u_strength;

  void main() {
    vec2 st = gl_FragCoord.xy / u_resolution;
    float wave = sin((st.x + u_time * 0.1 * u_speed) * 10.0) * 0.2;
    float pointerDist = distance(st, u_pointer);
    float ripple = exp(-pointerDist * 10.0) * sin(pointerDist * 40.0 - u_time * 4.0) * u_strength;

    float brightness = smoothstep(0.4, 0.6, st.y + wave + ripple);
    vec3 color = vec3(0.2 + 0.8 * brightness, 0.4 + 0.5 * sin(u_time + st.x * 4.0), 0.6 + 0.4 * brightness);
    gl_FragColor = vec4(color, 1.0);
  }
`;

function createShader(type, src) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("Shader compile failed:", gl.getShaderInfoLog(shader));
    return null;
  }
  return shader;
}

const vs = createShader(gl.VERTEX_SHADER, vert);
const fs = createShader(gl.FRAGMENT_SHADER, frag);

const program = gl.createProgram();
gl.attachShader(program, vs);
gl.attachShader(program, fs);
gl.linkProgram(program);
gl.useProgram(program);

const pos = new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]);
const buf = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buf);
gl.bufferData(gl.ARRAY_BUFFER, pos, gl.STATIC_DRAW);
const loc = gl.getAttribLocation(program, "a_position");
gl.enableVertexAttribArray(loc);
gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

const u_resolution = gl.getUniformLocation(program, "u_resolution");
const u_time = gl.getUniformLocation(program, "u_time");
const u_pointer = gl.getUniformLocation(program, "u_pointer");
const u_speed = gl.getUniformLocation(program, "u_speed");
const u_strength = gl.getUniformLocation(program, "u_strength");

let start = Date.now();
function render() {
  const t = (Date.now() - start) / 1000;
  gl.uniform2f(u_resolution, canvas.width, canvas.height);
  gl.uniform1f(u_time, t);
  gl.uniform2fv(u_pointer, pointer);
  gl.uniform1f(u_speed, parseFloat(document.getElementById("colorSpeed").value));
  gl.uniform1f(u_strength, parseFloat(document.getElementById("rippleStrength").value));
  gl.drawArrays(gl.TRIANGLES, 0, 6);
  requestAnimationFrame(render);
}
render();
