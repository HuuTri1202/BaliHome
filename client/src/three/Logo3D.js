/* ============================================================================
 *  Logo3D — Logo Bali Home dựng 3D (Three.js thuần, không phụ thuộc React)
 *  ----------------------------------------------------------------------------
 *    const logo = new Logo3D(container, { theme });
 *    logo.setTheme(theme);  // nhảy + đổi màu/chất liệu
 *    logo.dispose();
 *
 *  Logo dựng từ THREE.Shape (toạ độ lấy theo ảnh logo gốc 1024×1024) rồi đùn khối:
 *    - Khung lục giác 6 cạnh: 3 cạnh trên-phải màu phụ (đỏ), 3 cạnh dưới-trái màu chính (xanh)
 *    - Tấm nền lục giác bên trong
 *    - Ký hiệu A/G + tam giác nhỏ
 *
 *  Cây scene: scene → floatGroup (dập dềnh) → jumpGroup (GSAP nhảy) → logo (xoay)
 * ========================================================================== */
import * as THREE from 'three';
import gsap from 'gsap';

/* ---------------------------- THÔNG SỐ CHỈNH NHANH ------------------------ */
const CONFIG = {
  size: 1.55,             // bán kính ngoài lục giác (đơn vị 3D)
  frameDepth: 0.34,       // độ dày khung
  markDepth: 0.26,        // độ dày ký hiệu A/G
  plateDepth: 0.1,        // độ dày tấm nền
  baseTiltX: -0.08,
  baseTiltZ: 0,
  autoRotateSpeed: 0.45,  // rad/giây
  hoverRotateY: 0.6,      // biên độ xoay khi rê chuột
  hoverTiltX: 0.35,
  dragSensitivity: 0.009,
  easing: 0.0009,         // càng nhỏ → bám mục tiêu càng nhanh (lerp độc lập FPS)
  inertiaDecay: 0.05,     // quán tính sau khi thả chuột
};

const SRC = { center: 512, outerR: 450, innerR: 385 };
const MARK = {
  right: [[478, 268], [515, 215], [822, 712], [722, 712]],
  g: [[447, 330], [487, 385], [330, 650], [575, 650], [548, 600], [487, 600], [455, 543], [582, 543], [683, 712], [205, 712]],
  tri: [[412, 600], [455, 543], [487, 600]],
};

const lerp = (a, b, t) => a + (b - a) * t;
const envIntensity = (theme) => (theme.metalness > 0.5 ? 1.1 : 0.35);
const reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

export class Logo3D {
  constructor(container, { theme, interactive = true } = {}) {
    this.container = container;
    this.theme = theme;
    this.interactive = interactive;
    this.reduced = reducedMotion();
    this.visible = true;

    this.state = { spin: 0, boost: 0, velocity: 0, dragging: false, hovering: false, pointerX: 0, pointerY: 0, lastX: 0, lastT: 0 };
    this.current = { rx: CONFIG.baseTiltX, ry: 0, rz: CONFIG.baseTiltZ };

    this._initRenderer();
    this._initScene();
    this._initCamera();
    this._initLights();
    this._initLogo();
    this._initShadow();
    this._bindEvents();

    this.clock = new THREE.Clock();
    this._loop = this._loop.bind(this);
    this._raf = requestAnimationFrame(this._loop);
  }

  /* 1. RENDERER — nền trong suốt để thấy gradient CSS phía sau */
  _initRenderer() {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    const el = this.renderer.domElement;
    el.style.display = 'block';
    if (this.interactive) {
      el.style.touchAction = 'pan-y';
      el.style.cursor = 'grab';
    }
    this.container.appendChild(el);
  }

  /* 2. SCENE + ENVIRONMENT — "studio" giả bằng canvas gradient để kim loại có phản chiếu */
  _initScene() {
    this.scene = new THREE.Scene();
    const c = document.createElement('canvas');
    c.width = 512; c.height = 256;
    const g = c.getContext('2d');
    const grd = g.createLinearGradient(0, 0, 0, 256);
    grd.addColorStop(0, '#ffffff');
    grd.addColorStop(0.45, '#dfe6f2');
    grd.addColorStop(0.55, '#8d97a8');
    grd.addColorStop(1, '#3a4150');
    g.fillStyle = grd;
    g.fillRect(0, 0, 512, 256);
    g.fillStyle = 'rgba(255,255,255,0.95)'; // softbox
    g.fillRect(60, 40, 70, 120);
    g.fillRect(300, 30, 140, 50);
    g.fillRect(380, 110, 40, 90);

    const envTex = new THREE.CanvasTexture(c);
    envTex.mapping = THREE.EquirectangularReflectionMapping;
    envTex.colorSpace = THREE.SRGBColorSpace;
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.envRT = pmrem.fromEquirectangular(envTex);
    this.scene.environment = this.envRT.texture;
    envTex.dispose();
    pmrem.dispose();
  }

  /* 3. CAMERA */
  _initCamera() {
    this.camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
    this.camera.position.set(0, 0.3, 7.5);
    this.camera.lookAt(0, 0, 0);
    this._resize();
  }

  /* 4. LIGHTS — Three.js r155+ dùng đơn vị vật lý nên cường độ lớn hơn bản cũ */
  _initLights() {
    this.scene.add(new THREE.HemisphereLight(0xffffff, 0xc8d0e0, 1.7));
    const key = new THREE.DirectionalLight(0xffffff, 3.2);
    key.position.set(3, 4, 6);
    this.scene.add(key);
    this.rimLight = new THREE.DirectionalLight(0xffffff, 2.6);
    this.rimLight.position.set(-4, 2, -5);
    this.scene.add(this.rimLight);
    const fill = new THREE.DirectionalLight(0xffffff, 0.9);
    fill.position.set(-4, -1, 4);
    this.scene.add(fill);
  }

  /* 5. DỰNG LOGO 3D */
  _initLogo() {
    const C = CONFIG, t = this.theme;
    const S = C.size / SRC.outerR;
    const toV = ([x, y]) => new THREE.Vector2((x - SRC.center) * S, -(y - SRC.center) * S);
    const shapeFrom = (pts) => new THREE.Shape(pts.map(toV));
    const extrude = (shape, depth, bevel = 0.025) => {
      const geo = new THREE.ExtrudeGeometry(shape, {
        depth, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel * 0.8, bevelSegments: 4, curveSegments: 1,
      });
      geo.translate(0, 0, -depth / 2);
      geo.computeVertexNormals();
      return geo;
    };

    // Color(hex) tự chuyển sRGB → linear (ColorManagement bật mặc định)
    const mat = (hex) => new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(hex), metalness: t.metalness, roughness: t.roughness,
      clearcoat: 0.35, clearcoatRoughness: 0.2, envMapIntensity: envIntensity(t),
    });
    this.mats = {
      primary: mat(t.primary),
      secondary: mat(t.secondary),
      plate: new THREE.MeshPhysicalMaterial({ color: new THREE.Color(t.plate), roughness: 0.45, clearcoat: 0.4, envMapIntensity: 0.35 }),
    };

    this.floatGroup = new THREE.Group();
    this.jumpGroup = new THREE.Group();
    this.logo = new THREE.Group();
    this.floatGroup.add(this.jumpGroup);
    this.jumpGroup.add(this.logo);
    this.scene.add(this.floatGroup);

    // Khung lục giác đỉnh nhọn hướng lên; cạnh i nối đỉnh i → i+1 (theo chiều kim đồng hồ từ đỉnh trên)
    const hex = (r) => Array.from({ length: 6 }, (_, i) => {
      const a = Math.PI / 2 - (i * Math.PI) / 3;
      return new THREE.Vector2(Math.cos(a) * r * S, Math.sin(a) * r * S);
    });
    const outer = hex(SRC.outerR), inner = hex(SRC.innerR);
    const redEdges = [0, 1, 5];
    for (let i = 0; i < 6; i++) {
      const j = (i + 1) % 6;
      const shape = new THREE.Shape([outer[i], outer[j], inner[j], inner[i]]);
      this.logo.add(new THREE.Mesh(extrude(shape, C.frameDepth), redEdges.includes(i) ? this.mats.secondary : this.mats.primary));
    }

    this.logo.add(new THREE.Mesh(extrude(new THREE.Shape(inner), C.plateDepth, 0.01), this.mats.plate));
    this.logo.add(new THREE.Mesh(extrude(shapeFrom(MARK.right), C.markDepth), this.mats.primary));
    this.logo.add(new THREE.Mesh(extrude(shapeFrom(MARK.g), C.markDepth), this.mats.primary));
    this.logo.add(new THREE.Mesh(extrude(shapeFrom(MARK.tri), C.markDepth * 0.9), this.mats.secondary));

    this.logo.rotation.set(C.baseTiltX, 0, C.baseTiltZ);
  }

  /* 6. BÓNG ĐỔ GIẢ */
  _initShadow() {
    const c = document.createElement('canvas');
    c.width = c.height = 256;
    const g = c.getContext('2d');
    const grd = g.createRadialGradient(128, 128, 0, 128, 128, 128);
    grd.addColorStop(0, 'rgba(10,20,60,0.4)');
    grd.addColorStop(1, 'rgba(10,20,60,0)');
    g.fillStyle = grd;
    g.fillRect(0, 0, 256, 256);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    this.shadow = new THREE.Mesh(
      new THREE.PlaneGeometry(3.4, 1.6),
      new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false })
    );
    this.shadow.rotation.x = -Math.PI / 2;
    this.shadow.position.y = -1.95;
    this.scene.add(this.shadow);
  }

  /* 7. EVENT LISTENERS */
  _bindEvents() {
    const el = this.renderer.domElement;
    this._listeners = [];
    const on = (type, fn) => { el.addEventListener(type, fn); this._listeners.push([type, fn]); };

    if (this.interactive) {
      const updatePointer = (e) => {
        const r = el.getBoundingClientRect();
        this.state.pointerX = ((e.clientX - r.left) / r.width) * 2 - 1;
        this.state.pointerY = ((e.clientY - r.top) / r.height) * 2 - 1;
      };
      on('pointermove', (e) => {
        updatePointer(e);
        this.state.hovering = true;
        if (!this.state.dragging) return;
        const now = performance.now();
        const dt = Math.max((now - this.state.lastT) / 1000, 1 / 120);
        const delta = (e.clientX - this.state.lastX) * CONFIG.dragSensitivity;
        this.state.spin += delta;
        this.state.velocity = delta / dt;
        this.state.lastX = e.clientX;
        this.state.lastT = now;
      });
      on('pointerdown', (e) => {
        Object.assign(this.state, { dragging: true, velocity: 0, lastX: e.clientX, lastT: performance.now() });
        el.setPointerCapture(e.pointerId);
        el.style.cursor = 'grabbing';
      });
      const up = (e) => {
        this.state.dragging = false;
        if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
        el.style.cursor = 'grab';
        if (e.pointerType !== 'mouse') this.state.hovering = false;
      };
      on('pointerup', up);
      on('pointercancel', up);
      on('pointerleave', () => { if (!this.state.dragging) this.state.hovering = false; });
    }

    this._ro = new ResizeObserver(() => this._resize());
    this._ro.observe(this.container);
    // Không render khi khuất màn hình → tiết kiệm pin/CPU
    this._io = new IntersectionObserver(([entry]) => { this.visible = entry.isIntersecting; });
    this._io.observe(this.container);
  }

  _resize() {
    const w = this.container.clientWidth || 1;
    const h = this.container.clientHeight || 1;
    this.renderer.setSize(w, h);
    this.camera.aspect = w / h;
    this.camera.position.z = w / h < 0.8 ? 10 : 7.5;
    this.camera.updateProjectionMatrix();
  }

  /* 8. ANIMATION LOOP */
  _loop() {
    this._raf = requestAnimationFrame(this._loop);
    const dt = Math.min(this.clock.getDelta(), 0.05);
    if (!this.visible) return;
    const t = this.clock.elapsedTime;
    const s = this.state, C = CONFIG;
    const autoSpeed = this.reduced ? C.autoRotateSpeed * 0.3 : C.autoRotateSpeed;

    if (!s.dragging) {
      s.spin += s.velocity * dt;
      s.velocity *= Math.pow(C.inertiaDecay, dt);
      s.spin += autoSpeed * dt * (s.hovering ? 0.2 : 1);
    }

    const px = s.hovering ? s.pointerX : 0;
    const py = s.hovering ? s.pointerY : 0;
    const k = 1 - Math.pow(C.easing, dt);
    this.current.ry = lerp(this.current.ry, s.spin + s.boost + px * C.hoverRotateY, k);
    this.current.rx = lerp(this.current.rx, C.baseTiltX + py * C.hoverTiltX, k);
    this.current.rz = lerp(this.current.rz, C.baseTiltZ - px * 0.08, k);
    this.logo.rotation.set(this.current.rx, this.current.ry, this.current.rz);

    const bob = this.reduced ? 0 : Math.sin(t * 1.6) * 0.07;
    this.floatGroup.position.y = bob;
    const height = this.jumpGroup.position.y + bob;
    const sc = 1 - height * 0.3;
    this.shadow.scale.set(sc, sc, 1);
    this.shadow.material.opacity = THREE.MathUtils.clamp(1 - height * 0.6, 0.25, 1);

    this.renderer.render(this.scene, this.camera);
  }

  /* 9. ĐỔI PHONG CÁCH: nhảy + xoay 1 vòng + chuyển màu (GSAP) */
  setTheme(theme) {
    if (!theme || theme === this.theme) return;
    this.theme = theme;
    const jg = this.jumpGroup;
    const dur = this.reduced ? 0.01 : 0.7;

    gsap.killTweensOf([jg.position, jg.scale, this.state]);
    if (!this.reduced) {
      gsap.timeline()
        .to(jg.scale, { x: 1.06, y: 0.9, z: 1.06, duration: 0.12, ease: 'power2.out' })
        .to(jg.position, { y: 0.7, duration: 0.34, ease: 'power2.out' }, '>')
        .to(jg.scale, { x: 0.96, y: 1.06, z: 0.96, duration: 0.34, ease: 'power2.out' }, '<')
        .to(jg.position, { y: 0, duration: 0.3, ease: 'power2.in' })
        .to(jg.scale, { x: 1, y: 1, z: 1, duration: 0.3, ease: 'power2.in' }, '<')
        .to(jg.scale, { x: 1.05, y: 0.93, z: 1.05, duration: 0.08, ease: 'power1.out' })
        .to(jg.scale, { x: 1, y: 1, z: 1, duration: 0.6, ease: 'elastic.out(1, 0.4)' });

      this.state.spin += this.state.boost;
      this.state.boost = 0;
      gsap.to(this.state, {
        boost: Math.PI * 2, duration: 1, ease: 'power3.inOut',
        onComplete: () => { this.state.spin += this.state.boost; this.state.boost = 0; },
      });
    }

    const tweenColor = (m, hex) => {
      const c = new THREE.Color(hex);
      gsap.to(m.color, { r: c.r, g: c.g, b: c.b, duration: dur, ease: 'power2.inOut' });
    };
    tweenColor(this.mats.primary, theme.primary);
    tweenColor(this.mats.secondary, theme.secondary);
    tweenColor(this.mats.plate, theme.plate);
    [this.mats.primary, this.mats.secondary].forEach((m) =>
      gsap.to(m, { metalness: theme.metalness, roughness: theme.roughness, envMapIntensity: envIntensity(theme), duration: dur })
    );
  }

  /* 10. DỌN DẸP */
  dispose() {
    cancelAnimationFrame(this._raf);
    this._ro.disconnect();
    this._io.disconnect();
    const el = this.renderer.domElement;
    this._listeners.forEach(([type, fn]) => el.removeEventListener(type, fn));
    gsap.killTweensOf([this.jumpGroup.position, this.jumpGroup.scale, this.state]);
    this.scene.traverse((o) => {
      if (o.geometry) o.geometry.dispose();
      if (o.material) [].concat(o.material).forEach((m) => { m.map?.dispose(); m.dispose(); });
    });
    this.envRT.dispose();
    this.renderer.dispose();
    el.remove();
  }
}
