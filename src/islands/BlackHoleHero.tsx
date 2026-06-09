import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const VERT = `void main(){ gl_Position = vec4(position, 1.0); }`;

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
  col += neb*0.5;
  return col;
}

vec3 diskColor(float t){
  vec3 c1=vec3(2.4,2.6,3.0); // hot white-cyan
  vec3 c2=vec3(0.5,1.6,3.0); // cyan  #4dd0ff
  vec3 c3=vec3(1.1,0.7,3.0); // violet #7b61ff
  vec3 c4=vec3(3.0,0.8,1.7); // pink  #ff5db1
  if(t<0.30) return mix(c1,c2,t/0.30);
  if(t<0.62) return mix(c2,c3,(t-0.30)/0.32);
  return mix(c3,c4,(t-0.62)/0.38);
}

mat3 lookAt(vec3 eye, vec3 tgt, vec3 up){
  vec3 f=normalize(tgt-eye); vec3 r=normalize(cross(f,up)); vec3 u=cross(r,f);
  return mat3(r,u,f);
}

void main(){
  vec2 uv = (gl_FragCoord.xy - 0.5*iResolution.xy)/iResolution.y;
  // empuja el agujero al tercio derecho en pantallas anchas; centrado en angostas
  float aspect = iResolution.x/iResolution.y;
  float off = clamp((aspect - 0.95)*0.60, 0.0, 0.62);
  vec2 suv = uv - vec2(off, 0.0);

  // órbita de cámara (leve: mouse + scroll)
  float az = 0.55 + iMouse.x*0.22;
  float el = 0.085 + iMouse.y*0.05 + iScroll*0.13;
  el = clamp(el, 0.045, 0.40);
  float dist = 19.0;
  vec3 eye = vec3(sin(az)*cos(el), sin(el), cos(az)*cos(el))*dist;
  mat3 cam = lookAt(eye, vec3(0.0), vec3(0.0,1.0,0.0));
  vec3 dir = normalize(cam*vec3(suv, 1.5));
  vec3 pos = eye;

  float h2 = pow(length(cross(pos,dir)), 2.0); // momento angular^2 conservado

  vec3 color = vec3(0.0);
  float transmit = 1.0;
  bool captured = false;

  const float STEP = 0.115;
  float inner = 2.75, outer = 9.5;
  for(int i=0;i<320;i++){
    vec3 accel = -1.5 * h2 * pos / pow(dot(pos,pos), 2.5); // curvatura geodésica
    vec3 ndir = dir + accel*STEP;
    vec3 npos = pos + dir*STEP;
    float r = length(npos);
    if(r < 1.0){ captured = true; break; }          // horizonte de eventos
    if(pos.y*npos.y < 0.0){                          // cruce del disco (plano y=0)
      float tc = pos.y/(pos.y-npos.y);
      vec3 hp = mix(pos,npos,tc);
      float rr = length(hp.xz);
      if(rr>inner && rr<outer){
        float t = (rr-inner)/(outer-inner);
        float ang = atan(hp.z,hp.x);
        float spd = 3.4/pow(rr,0.85);
        float sw = ang*1.0 - iTime*spd;
        float band = fbm(vec2(sw*1.6, rr*0.9 - iTime*0.7));
        float fil  = 0.45 + 0.55*fbm(vec2(sw*4.5, rr*2.2));
        float dens = mix(0.35,1.25, band) * fil;
        vec3 orb = normalize(vec3(-hp.z, 0.0, hp.x));
        float dopp = dot(orb, normalize(eye-hp));       // doppler beaming
        float beam = pow(clamp(0.5+0.5*dopp,0.0,1.0), 1.6)*1.8 + 0.25;
        float bright = (smoothstep(1.0,0.0,t)*1.5 + 0.4);
        float edge = smoothstep(0.0,0.26,t) * smoothstep(1.0,0.82,t);
        vec3 dc = diskColor(t) * bright * dens * beam * edge * 1.7;
        color += dc * transmit;
        transmit *= mix(0.34, 0.66, t);
      }
    }
    dir = ndir; pos = npos;
    if(r > 45.0) break;                                 // escapó al cielo
  }

  if(!captured){ color += starField(normalize(dir)) * transmit; }

  color = vec3(1.0) - exp(-color * 1.2);               // tonemap exposición
  float lum = dot(color, vec3(0.299,0.587,0.114));
  color = mix(vec3(lum), color, 1.12);                 // saturación leve
  float vig = smoothstep(1.45,0.30,length(suv));       // viñeta
  color *= mix(0.84,1.0,vig);
  gl_FragColor = vec4(color, 1.0);
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
        antialias: true,
        powerPreference: 'high-performance',
        preserveDrawingBuffer: true, // permite capturar el canvas (screenshots/share)
      });
    } catch {
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -1, 1);
    const uniforms = {
      iResolution: { value: new THREE.Vector2(1, 1) },
      iTime: { value: 0 },
      iMouse: { value: new THREE.Vector2(0, 0) },
      iScroll: { value: 0 },
    };
    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.ShaderMaterial({ uniforms, vertexShader: VERT, fragmentShader: FRAG });
    const quad = new THREE.Mesh(geometry, material);
    scene.add(quad);

    const buf = new THREE.Vector2();
    let lastW = 0,
      lastH = 0;
    const resize = () => {
      const w = canvas.clientWidth || canvas.parentElement?.clientWidth || window.innerWidth;
      const h = canvas.clientHeight || canvas.parentElement?.clientHeight || window.innerHeight;
      if (!w || !h || (w === lastW && h === lastH)) return;
      lastW = w;
      lastH = h;
      renderer.setSize(w, h, false);
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
    let raf = 0;
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (!visible || document.hidden) return; // skip the expensive render while off-screen/hidden
      resize();
      const t = (now - start) / 1000;
      uniforms.iTime.value = t;
      mx += (tMx - mx) * 0.05;
      my += (tMy - my) * 0.05;
      uniforms.iMouse.value.set(mx, my);
      const hero = document.getElementById('hero');
      const hH = hero ? hero.offsetHeight : window.innerHeight;
      uniforms.iScroll.value = Math.max(0, Math.min(1, window.scrollY / hH));
      renderer.render(scene, camera);
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
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return <canvas ref={canvasRef} className="bh-canvas" aria-hidden="true" />;
}
