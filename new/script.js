document.documentElement.classList.add("js");

(() => {
  const canvas = document.querySelector(".dot-shader");
  if (!canvas) {
    return;
  }

  const gl = canvas.getContext("webgl", {
    alpha: true,
    antialias: false,
    depth: false,
    stencil: false
  });

  if (!gl) {
    canvas.classList.add("no-webgl");
    return;
  }

  const vertexSource = `
    attribute vec2 a_position;
    void main() {
      gl_Position = vec4(a_position, 0.0, 1.0);
    }
  `;

  const fragmentSource = `
    precision mediump float;

    uniform vec2 u_resolution;

    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
    }

    void main() {
      vec2 uv = gl_FragCoord.xy;
      float gap = 22.0;
      vec2 cell = floor(uv / gap);
      vec2 cellCenter = (cell + 0.5) * gap;
      vec2 delta = uv - cellCenter;
      float distanceToCenter = length(delta);

      float baseDotDiameter = 1.5;
      float sizeJitter = mix(0.6, 1.0, hash(cell + 0.31));
      float radius = (baseDotDiameter * sizeJitter) * 0.5;

      float opacityJitter = mix(0.6, 1.0, hash(cell + 13.7));
      float dot = 1.0 - smoothstep(radius, radius + 0.9, distanceToCenter);
      float alpha = dot * 0.46 * opacityJitter;

      gl_FragColor = vec4(0.0, 0.0, 0.0, alpha);
    }
  `;

  function createShader(source, type) {
    const shader = gl.createShader(type);
    if (!shader) {
      return null;
    }

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      gl.deleteShader(shader);
      return null;
    }

    return shader;
  }

  const vertexShader = createShader(vertexSource, gl.VERTEX_SHADER);
  const fragmentShader = createShader(fragmentSource, gl.FRAGMENT_SHADER);

  if (!vertexShader || !fragmentShader) {
    canvas.classList.add("no-webgl");
    return;
  }

  const program = gl.createProgram();
  if (!program) {
    canvas.classList.add("no-webgl");
    return;
  }

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    canvas.classList.add("no-webgl");
    return;
  }

  gl.useProgram(program);

  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([
      -1.0, -1.0,
      1.0, -1.0,
      -1.0, 1.0,
      1.0, 1.0
    ]),
    gl.STATIC_DRAW
  );

  const positionLocation = gl.getAttribLocation(program, "a_position");
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

  const resolutionLocation = gl.getUniformLocation(program, "u_resolution");

  function draw() {
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  function resize() {
    const bounds = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.max(1, Math.round(bounds.width * dpr));
    const height = Math.max(1, Math.round(bounds.height * dpr));

    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
      draw();
    }
  }

  if ("ResizeObserver" in window) {
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
  }

  window.addEventListener("resize", resize);
  resize();
})();
