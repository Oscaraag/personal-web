import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import {
  BlendFunction,
  BloomEffect,
  ChromaticAberrationEffect,
  EffectComposer,
  EffectPass,
  NoiseEffect,
  RenderPass,
  ToneMappingEffect,
  ToneMappingMode,
} from 'postprocessing';

const VERT = `void main(){ gl_Position = vec4(position, 1.0); }`;

// Geodesic raytracer in Schwarzschild spacetime (geometric units, rs = 1):
// horizon r=1, photon sphere r=1.5, ISCO r=3. The disk is volumetric and
// emits as a blackbody following a Novikov-Thorne temperature profile,
// observed through full relativistic Doppler (delta^4 beaming) plus
// gravitational redshift. Output is linear HDR; bloom + ACES happen in post.
const FRAG = `
precision highp float;
uniform vec2 iResolution;
uniform float iTime;
uniform vec2 iMouse;
uniform float iScroll;
#define PI 3.14159265359

float hash21(vec2 p){ p = fract(p*vec2(123.34,456.21)); p += dot(p,p+45.32); return fract(p.x*p.y); }
float vnoise(vec2 p){
  vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
  float a=hash21(i), b=hash21(i+vec2(1,0)), c=hash21(i+vec2(0,1)), d=hash21(i+vec2(1,1));
  return mix(mix(a,b,f.x), mix(c,d,f.x), f.y);
}
float fbm(vec2 p){ float v=0.0,a=0.5; for(int i=0;i<5;i++){ v+=a*vnoise(p); p*=2.03; a*=0.5; } return v; }
float fbm4(vec2 p){ float v=0.0,a=0.5; for(int i=0;i<4;i++){ v+=a*vnoise(p); p*=2.13; a*=0.5; } return v; }

// Planckian locus approximation: temperature in Kelvin -> normalized RGB.
vec3 blackbody(float T){
  vec3 c;
  c.r = 56100000.0*pow(T,-1.5) + 148.0;
  c.g = T > 6500.0 ? 35200000.0*pow(T,-1.5) + 184.0 : 100.04*log(T) - 623.6;
  c.b = 194.18*log(T) - 1448.6;
  c = clamp(c, 0.0, 255.0)/255.0;
  if(T < 1000.0) c *= T/1000.0;
  return c;
}

vec3 starField(vec3 dir){
  vec2 uv = vec2(atan(dir.z,dir.x), asin(clamp(dir.y,-1.0,1.0)));
  vec3 col = vec3(0.0);
  for(int k=0;k<3;k++){
    float sc = 55.0 + float(k)*95.0;
    vec2 g = uv*sc; vec2 id=floor(g); vec2 f=fract(g)-0.5;
    float h = hash21(id + float(k)*11.7);
    if(h>0.91){
      float d = length(f);
      float tw = 0.6 + 0.4*sin(iTime*1.5 + h*30.0);
      float b = smoothstep(0.16,0.0,d) * (h-0.91)/0.09 * tw;
      vec3 tint = mix(vec3(0.75,0.85,1.0), vec3(1.0,0.72,0.92), hash21(id+3.3));
      col += tint*b*1.3;
    }
  }
  float n = fbm(uv*2.5 + 4.0);
  vec3 neb = mix(vec3(0.04,0.02,0.10), vec3(0.10,0.04,0.16), n);
  neb += vec3(0.02,0.05,0.12)*fbm(uv*1.3 - 2.0);
  col += neb*0.4;
  return col;
}

mat3 lookAt(vec3 eye, vec3 tgt, vec3 up){
  vec3 f=normalize(tgt-eye); vec3 r=normalize(cross(f,up)); vec3 u=cross(r,f);
  return mat3(r,u,f);
}

const float R_IN   = 3.0;    // ISCO
const float R_OUT  = 10.0;
const float T_PEAK = 6200.0; // Kelvin at the Novikov-Thorne peak (~1.36 * R_IN)

void main(){
  vec2 uv = (gl_FragCoord.xy - 0.5*iResolution.xy)/iResolution.y;
  // empuja el agujero al tercio derecho en pantallas anchas; centrado en angostas
  float aspect = iResolution.x/iResolution.y;
  float off = clamp((aspect - 0.95)*0.60, 0.0, 0.62);
  vec2 suv = uv - vec2(off, 0.0);

  // órbita de cámara (leve: mouse + scroll)
  float az = 0.55 + iMouse.x*0.22;
  float el = 0.11 + iMouse.y*0.05 + iScroll*0.13;
  el = clamp(el, 0.045, 0.40);
  float dist = 19.0;
  vec3 eye = vec3(sin(az)*cos(el), sin(el), cos(az)*cos(el))*dist;
  mat3 cam = lookAt(eye, vec3(0.0), vec3(0.0,1.0,0.0));
  vec3 dir = normalize(cam*vec3(suv, 1.5));
  vec3 pos = eye;

  float h2 = pow(length(cross(pos,dir)), 2.0); // momento angular^2 conservado

  vec3 col = vec3(0.0);
  float transmit = 1.0;
  bool captured = false;

  for(int i=0;i<STEPS;i++){
    float r = length(pos);
    if(r < 1.0){ captured = true; break; }
    if(r > 46.0 && dot(pos,dir) > 0.0) break; // escapó al cielo

    float rr = length(pos.xz);
    bool nearDisk = rr > R_IN-1.1 && rr < R_OUT+0.8 && abs(pos.y) < 0.6;
    // adaptive step: fine inside the disk slab and near the photon sphere
    float dt = nearDisk ? 0.065 : clamp(0.09*r, 0.05, 0.45);
    if(r < 3.0) dt = min(dt, 0.05);

    vec3 accel = -1.5 * h2 * pos / pow(dot(pos,pos), 2.5); // null geodesic bending
    dir += accel*dt;
    pos += dir*dt;

    if(nearDisk){
      // flared scale height + gaussian vertical density
      float H = 0.07 + 0.17*smoothstep(R_IN, R_OUT, rr);
      float vert = exp(-(pos.y*pos.y)/(2.0*H*H));
      // Keplerian differential rotation shears the noise into spiral wisps;
      // sampling on a rotating polar frame keeps it seamless in angle
      float ang = atan(pos.z, pos.x);
      float phase = ang - 2.4*pow(max(rr,1.0), -1.5)*iTime;
      vec2 pc = rr*vec2(cos(phase), sin(phase));
      float n1 = fbm(pc*0.85);
      float n2 = fbm4(pc*2.6 + n1*1.7);
      // thresholded noise -> distinct filaments and gaps instead of uniform fog
      float n = n1*0.62 + n2*0.55;
      float dens = vert * pow(max(n - 0.28, 0.0)*2.2, 2.0) * 2.6;
      dens *= smoothstep(R_IN-0.25, R_IN+0.6, rr);   // sharp ISCO inner edge
      dens *= smoothstep(R_OUT, R_OUT-2.8, rr);
      dens *= pow(R_IN/rr, 1.8);                     // surface density falloff

      if(dens > 1e-3){
        // Novikov-Thorne: T ~ r^-3/4 (1 - sqrt(r_in/r))^1/4, normalized to peak
        float Temit = T_PEAK * 4.515 * pow(rr, -0.75) * pow(max(1.0 - sqrt(2.85/rr), 0.0), 0.25);
        // Keplerian speed seen by a static observer: beta = sqrt(M/(r-2M)), rs=1
        float beta = clamp(sqrt(0.5/max(rr-1.0, 0.7)), 0.0, 0.85);
        float gma = 1.0/sqrt(1.0 - beta*beta);
        vec3 orb = normalize(vec3(-pos.z, 0.0, pos.x));
        float cosT = dot(orb, -normalize(dir));        // photon direction to observer
        float dopp = 1.0/(gma*(1.0 - beta*cosT));      // relativistic Doppler
        float grav = sqrt(max(1.0 - 1.0/r, 0.03));     // gravitational redshift
        float s = dopp*grav;
        // I/nu^3 is Lorentz invariant -> bolometric intensity scales as s^4
        vec3 emis = blackbody(Temit*s) * pow(s, 4.0);
        float a = dens * dt * 5.5;
        col += emis * a * transmit * 1.35;
        transmit *= exp(-a*0.85); // semi-transparent: the hot inner edge shines through
        if(transmit < 0.01) break;
      }
    }
  }

  if(!captured){ col += starField(normalize(dir)) * transmit; }

  float vig = smoothstep(1.45,0.30,length(suv));
  col *= mix(0.84,1.0,vig);
  col *= 1.05; // exposure (ACES tonemap runs in the composer)
  // pre-tonemap saturation push: keeps blackbody hues alive through ACES
  float lum = dot(col, vec3(0.2126,0.7152,0.0722));
  col = max(mix(vec3(lum), col, 1.3), 0.0);
  gl_FragColor = vec4(col, 1.0);
}
`;

export default function BlackHoleHero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return; // se muestra el fallback CSS

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: false, // composer renders to offscreen targets; bloom smooths edges
        stencil: false,
        depth: false,
        powerPreference: 'high-performance',
        preserveDrawingBuffer: true, // permite capturar el canvas (screenshots/share)
      });
    } catch {
      return;
    }
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, coarse ? 1.5 : 2));

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -1, 1);
    const uniforms = {
      iResolution: { value: new THREE.Vector2(1, 1) },
      iTime: { value: 0 },
      iMouse: { value: new THREE.Vector2(0, 0) },
      iScroll: { value: 0 },
    };
    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: VERT,
      fragmentShader: FRAG,
      defines: { STEPS: coarse ? 220 : 320 },
    });
    const quad = new THREE.Mesh(geometry, material);
    scene.add(quad);

    // HDR pipeline: linear radiance from the shader -> bloom -> subtle
    // chromatic aberration -> ACES filmic -> grain (hides banding in the nebula)
    const composer = new EffectComposer(renderer, {
      frameBufferType: THREE.HalfFloatType,
    });
    composer.addPass(new RenderPass(scene, camera));
    const bloom = new BloomEffect({
      mipmapBlur: true,
      intensity: 1.25,
      radius: 0.72,
      luminanceThreshold: 0.7,
      luminanceSmoothing: 0.25,
    });
    const aberration = new ChromaticAberrationEffect({
      offset: new THREE.Vector2(0.0007, 0.0007),
      radialModulation: true,
      modulationOffset: 0.35,
    });
    const tonemap = new ToneMappingEffect({ mode: ToneMappingMode.ACES_FILMIC });
    const grain = new NoiseEffect({ premultiply: true, blendFunction: BlendFunction.SCREEN });
    grain.blendMode.opacity.value = 0.045;
    composer.addPass(new EffectPass(camera, bloom, aberration, tonemap, grain));

    const buf = new THREE.Vector2();
    let lastW = 0,
      lastH = 0;
    const resize = () => {
      const w = canvas.clientWidth || canvas.parentElement?.clientWidth || window.innerWidth;
      const h = canvas.clientHeight || canvas.parentElement?.clientHeight || window.innerHeight;
      if (!w || !h || (w === lastW && h === lastH)) return;
      lastW = w;
      lastH = h;
      composer.setSize(w, h, false);
      renderer.getDrawingBufferSize(buf);
      uniforms.iResolution.value.set(buf.x, buf.y);
    };

    let tMx = 0,
      tMy = 0,
      mx = 0,
      my = 0;
    const onMouse = (e: MouseEvent) => {
      tMx = (e.clientX / window.innerWidth - 0.5) * 2;
      tMy = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    const onTilt = (e: DeviceOrientationEvent) => {
      if (e.gamma == null) return;
      tMx = Math.max(-1, Math.min(1, e.gamma / 35));
      tMy = Math.max(-1, Math.min(1, ((e.beta ?? 45) - 45) / 35));
    };

    const ro = 'ResizeObserver' in window ? new ResizeObserver(resize) : null;
    ro?.observe(canvas);

    // Pause rendering when the hero scrolls out of view (saves GPU without
    // touching visual quality; rAF keeps ticking as a cheap no-op).
    let visible = true;
    const io =
      'IntersectionObserver' in window
        ? new IntersectionObserver((entries) => {
            visible = entries[0]?.isIntersecting ?? true;
          }, { threshold: 0 })
        : null;
    io?.observe(canvas);

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', onMouse);
    window.addEventListener('deviceorientation', onTilt);

    const start = performance.now();
    let last = start;
    let raf = 0;
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (!visible || document.hidden) return; // skip the expensive render while off-screen/hidden
      resize();
      const t = (now - start) / 1000;
      const delta = (now - last) / 1000;
      last = now;
      uniforms.iTime.value = t;
      mx += (tMx - mx) * 0.05;
      my += (tMy - my) * 0.05;
      uniforms.iMouse.value.set(mx, my);
      const hero = document.getElementById('hero');
      const hH = hero ? hero.offsetHeight : window.innerHeight;
      uniforms.iScroll.value = Math.max(0, Math.min(1, window.scrollY / hH));
      composer.render(delta);
    };
    resize();
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro?.disconnect();
      io?.disconnect();
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouse);
      window.removeEventListener('deviceorientation', onTilt);
      composer.dispose();
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return <canvas ref={canvasRef} className="bh-canvas" aria-hidden="true" />;
}
