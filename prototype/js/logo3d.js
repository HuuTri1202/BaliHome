/* ============================================================================
 *  Logo3D — Logo Bali Home dựng 3D bằng Three.js thuần (không phụ thuộc React)
 *  ----------------------------------------------------------------------------
 *  Cách dùng:
 *    const logo = new Logo3D(containerElement, { theme });
 *    logo.setTheme(themeObj);   // nhảy + đổi màu/chất liệu
 *    logo.dispose();            // dọn dẹp khi unmount
 *
 *  Logo được dựng từ các hình 2D (THREE.Shape) lấy toạ độ từ ảnh logo gốc
 *  (khung 1024×1024), sau đó đùn khối (ExtrudeGeometry) để có độ dày 3D:
 *    - Khung lục giác: 6 cạnh rời → 3 cạnh trên-phải màu phụ (đỏ), 3 cạnh dưới-trái màu chính (xanh)
 *    - Tấm nền lục giác bên trong (plate)
 *    - Ký hiệu A/G ở giữa: nét chéo phải + nét chữ G + tam giác nhỏ màu đỏ
 *
 *  Cấu trúc cây scene:
 *    scene
 *     ├─ lights + environment (phản chiếu cho chất liệu kim loại)
 *     ├─ shadow (bóng mờ giả lập)
 *     └─ floatGroup   → dập dềnh nhẹ (idle)
 *         └─ jumpGroup → GSAP điều khiển nhảy / squash & stretch
 *             └─ logo  → xoay theo auto-rotate + chuột (lerp)
 * ========================================================================== */
(function (global) {
  'use strict';

  /* ---------------------------- THÔNG SỐ CHỈNH NHANH ---------------------- */
  const CONFIG = {
    size: 1.55,            // bán kính ngoài của lục giác (đơn vị 3D)
    frameDepth: 0.34,      // độ dày khung lục giác
    markDepth: 0.26,       // độ dày ký hiệu A/G
    plateDepth: 0.1,       // độ dày tấm nền

    baseTiltX: -0.08,      // góc nghiêng ban đầu
    baseTiltZ: 0.0,
    autoRotateSpeed: 0.45, // rad/giây khi tự xoay
    hoverRotateY: 0.6,     // biên độ xoay Y khi rê chuột
    hoverTiltX: 0.35,      // biên độ ngửa/cúi khi rê chuột
    dragSensitivity: 0.009,// độ nhạy khi kéo
    easing: 0.0009,        // càng nhỏ → bám theo mục tiêu càng nhanh (lerp độc lập FPS)
    inertiaDecay: 0.05,    // quán tính sau khi thả chuột
  };

  /* Toạ độ trong ảnh logo gốc (1024×1024, tâm 512,512, trục y hướng xuống) */
  const SRC = { center: 512, outerR: 450, innerR: 385 };

  // Ký hiệu A/G (đa giác theo toạ độ ảnh gốc)
  const MARK = {
    // Nét chéo dài bên phải
    right: [[478, 268], [515, 215], [822, 712], [722, 712]],
    // Nét chữ "G": chéo trái → thanh đáy → móc lên → thanh ngang
    g: [
      [447, 330], [487, 385], [330, 650], [575, 650], [548, 600],
      [487, 600], [455, 543], [582, 543], [683, 712], [205, 712],
    ],
    // Tam giác nhỏ màu đỏ
    tri: [[412, 600], [455, 543], [487, 600]],
  };

  const lerp = (a, b, t) => a + (b - a) * t;
  // Cường độ phản chiếu môi trường theo chất liệu
  const envIntensity = (theme) => (theme.metalness > 0.5 ? 1.1 : 0.35);
  // Mã hex là màu sRGB → đổi sang linear để renderer (outputEncoding sRGB) hiển thị đúng màu thương hiệu
  const lin = (hex) => new THREE.Color(hex).convertSRGBToLinear();

  class Logo3D {
    constructor(container, options = {}) {
      this.container = container;
      this.theme = options.theme;

      // Trạng thái tương tác
      this.state = {
        spin: 0, boost: 0, velocity: 0,
        dragging: false, hovering: false,
        pointerX: 0, pointerY: 0, lastX: 0, lastT: 0,
      };
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

    /* ======================== 1. RENDERER ================================ */
    _initRenderer() {
      this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); // nền trong suốt → thấy gradient CSS
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      this.renderer.outputEncoding = THREE.sRGBEncoding; // giữ màu thương hiệu tươi, không dùng tone mapping
      this.renderer.domElement.style.touchAction = 'pan-y';
      this.renderer.domElement.style.cursor = 'grab';
      this.container.appendChild(this.renderer.domElement);
    }

    /* ======================== 2. SCENE + ENVIRONMENT ===================== */
    _initScene() {
      this.scene = new THREE.Scene();

      // Tạo "studio" giả bằng canvas gradient → dùng làm environment map,
      // giúp chất liệu kim loại (chrome, vàng) có phản chiếu thay vì bị đen.
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
      // Vài dải sáng (softbox) để tạo vệt bóng loáng trên bề mặt
      g.fillStyle = 'rgba(255,255,255,0.95)';
      g.fillRect(60, 40, 70, 120);
      g.fillRect(300, 30, 140, 50);
      g.fillRect(380, 110, 40, 90);

      const envTex = new THREE.CanvasTexture(c);
      envTex.mapping = THREE.EquirectangularReflectionMapping;
      envTex.encoding = THREE.sRGBEncoding;
      const pmrem = new THREE.PMREMGenerator(this.renderer);
      this.scene.environment = pmrem.fromEquirectangular(envTex).texture;
      envTex.dispose();
      pmrem.dispose();
    }

    /* ======================== 3. CAMERA ================================== */
    _initCamera() {
      this.camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
      this.camera.position.set(0, 0.3, 7.5);
      this.camera.lookAt(0, 0, 0);
      this._resize();
    }

    /* ======================== 4. LIGHTS ================================== */
    _initLights() {
      this.scene.add(new THREE.HemisphereLight(0xffffff, 0xc8d0e0, 0.55));

      const key = new THREE.DirectionalLight(0xffffff, 1.1);   // đèn chính
      key.position.set(3, 4, 6);
      this.scene.add(key);

      this.rimLight = new THREE.DirectionalLight(0xffffff, 0.9); // đèn viền phía sau
      this.rimLight.position.set(-4, 2, -5);
      this.scene.add(this.rimLight);

      const fill = new THREE.PointLight(0xffffff, 0.35, 20);     // đèn bổ trợ
      fill.position.set(-4, -1, 4);
      this.scene.add(fill);
    }

    /* ======================== 5. DỰNG LOGO 3D ============================= */
    _initLogo() {
      const C = CONFIG, t = this.theme;
      const S = C.size / SRC.outerR; // hệ số đổi px ảnh → đơn vị 3D

      // Đổi toạ độ ảnh (y xuống) → toạ độ 3D (y lên, tâm 0,0)
      const toV = ([x, y]) => new THREE.Vector2((x - SRC.center) * S, -(y - SRC.center) * S);
      const shapeFrom = (pts) => new THREE.Shape(pts.map(toV));

      // Đùn khối 2D → 3D, căn giữa theo trục Z
      const extrude = (shape, depth, bevel = 0.025) => {
        const geo = new THREE.ExtrudeGeometry(shape, {
          depth, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel * 0.8,
          bevelSegments: 4, curveSegments: 1,
        });
        geo.translate(0, 0, -depth / 2);
        geo.computeVertexNormals();
        return geo;
      };

      // --- Vật liệu (dùng chung, đổi màu bằng GSAP) ---
      const mat = (hex) => new THREE.MeshPhysicalMaterial({
        color: lin(hex), metalness: t.metalness, roughness: t.roughness, clearcoat: 0.35, clearcoatRoughness: 0.2,
        envMapIntensity: envIntensity(t), // nhựa: phản chiếu ít → màu đậm; kim loại: phản chiếu nhiều
      });
      this.mats = {
        primary: mat(t.primary),     // xanh: nửa dưới khung + ký hiệu
        secondary: mat(t.secondary), // đỏ: nửa trên khung + tam giác nhỏ
        plate: new THREE.MeshPhysicalMaterial({ color: lin(t.plate), roughness: 0.45, metalness: 0, clearcoat: 0.4 }),
      };

      this.floatGroup = new THREE.Group();
      this.jumpGroup = new THREE.Group();
      this.logo = new THREE.Group();
      this.floatGroup.add(this.jumpGroup);
      this.jumpGroup.add(this.logo);
      this.scene.add(this.floatGroup);

      // --- Khung lục giác: 6 cạnh hình thang, đỉnh nhọn hướng lên ---
      const hex = (r) => Array.from({ length: 6 }, (_, i) => {
        const a = Math.PI / 2 - (i * Math.PI) / 3; // i=0: đỉnh trên, đi theo chiều kim đồng hồ
        return new THREE.Vector2(Math.cos(a) * r * S, Math.sin(a) * r * S);
      });
      const outer = hex(SRC.outerR), inner = hex(SRC.innerR);
      // Cạnh i nối đỉnh i → i+1. Đỏ: trên-trái→đỉnh, đỉnh→trên-phải, phải. Xanh: còn lại.
      const redEdges = [0, 1, 5];
      for (let i = 0; i < 6; i++) {
        const j = (i + 1) % 6;
        const shape = new THREE.Shape([outer[i], outer[j], inner[j], inner[i]]);
        const m = redEdges.includes(i) ? this.mats.secondary : this.mats.primary;
        this.logo.add(new THREE.Mesh(extrude(shape, C.frameDepth), m));
      }

      // --- Tấm nền lục giác bên trong ---
      const plate = new THREE.Mesh(extrude(new THREE.Shape(inner), C.plateDepth, 0.01), this.mats.plate);
      this.logo.add(plate);

      // --- Ký hiệu A/G (nổi lên khỏi tấm nền) ---
      const markGroup = new THREE.Group();
      markGroup.add(new THREE.Mesh(extrude(shapeFrom(MARK.right), C.markDepth), this.mats.primary));
      markGroup.add(new THREE.Mesh(extrude(shapeFrom(MARK.g), C.markDepth), this.mats.primary));
      markGroup.add(new THREE.Mesh(extrude(shapeFrom(MARK.tri), C.markDepth * 0.9), this.mats.secondary));
      this.logo.add(markGroup);

      this.logo.rotation.set(C.baseTiltX, 0, C.baseTiltZ);
    }

    /* ======================== 6. BÓNG ĐỔ GIẢ ============================= */
    _initShadow() {
      const c = document.createElement('canvas');
      c.width = c.height = 256;
      const g = c.getContext('2d');
      const grd = g.createRadialGradient(128, 128, 0, 128, 128, 128);
      grd.addColorStop(0, 'rgba(10,20,60,0.4)');
      grd.addColorStop(1, 'rgba(10,20,60,0)');
      g.fillStyle = grd;
      g.fillRect(0, 0, 256, 256);

      this.shadow = new THREE.Mesh(
        new THREE.PlaneGeometry(3.4, 1.6),
        new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false })
      );
      this.shadow.rotation.x = -Math.PI / 2;
      this.shadow.position.y = -1.95;
      this.scene.add(this.shadow);
    }

    /* ======================== 7. EVENT LISTENERS ========================= */
    _bindEvents() {
      const el = this.renderer.domElement;

      const updatePointer = (e) => {
        const r = el.getBoundingClientRect();
        this.state.pointerX = ((e.clientX - r.left) / r.width) * 2 - 1;
        this.state.pointerY = ((e.clientY - r.top) / r.height) * 2 - 1;
      };

      // Rê chuột → nghiêng theo; đang kéo → cộng dồn góc xoay + lưu vận tốc
      this._onPointerMove = (e) => {
        updatePointer(e);
        this.state.hovering = true;
        if (this.state.dragging) {
          const now = performance.now();
          const dx = e.clientX - this.state.lastX;
          const dt = Math.max((now - this.state.lastT) / 1000, 1 / 120);
          const delta = dx * CONFIG.dragSensitivity;
          this.state.spin += delta;
          this.state.velocity = delta / dt;
          this.state.lastX = e.clientX;
          this.state.lastT = now;
        }
      };

      this._onPointerDown = (e) => {
        this.state.dragging = true;
        this.state.velocity = 0;
        this.state.lastX = e.clientX;
        this.state.lastT = performance.now();
        el.setPointerCapture(e.pointerId);
        el.style.cursor = 'grabbing';
      };

      this._onPointerUp = (e) => {
        this.state.dragging = false;
        if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
        el.style.cursor = 'grab';
        if (e.pointerType !== 'mouse') this.state.hovering = false;
      };

      this._onPointerLeave = () => {
        if (!this.state.dragging) this.state.hovering = false;
      };

      el.addEventListener('pointermove', this._onPointerMove);
      el.addEventListener('pointerdown', this._onPointerDown);
      el.addEventListener('pointerup', this._onPointerUp);
      el.addEventListener('pointercancel', this._onPointerUp);
      el.addEventListener('pointerleave', this._onPointerLeave);

      this._ro = new ResizeObserver(() => this._resize());
      this._ro.observe(this.container);
    }

    _resize() {
      const w = this.container.clientWidth || 1;
      const h = this.container.clientHeight || 1;
      this.renderer.setSize(w, h);
      this.camera.aspect = w / h;
      this.camera.position.z = w / h < 0.8 ? 10 : 7.5; // màn hình dọc → lùi camera
      this.camera.updateProjectionMatrix();
    }

    /* ======================== 8. ANIMATION LOOP ========================== */
    _loop() {
      this._raf = requestAnimationFrame(this._loop);
      const dt = Math.min(this.clock.getDelta(), 0.05);
      const t = this.clock.elapsedTime;
      const s = this.state, C = CONFIG;

      if (!s.dragging) {
        s.spin += s.velocity * dt;                               // quán tính
        s.velocity *= Math.pow(C.inertiaDecay, dt);
        s.spin += C.autoRotateSpeed * dt * (s.hovering ? 0.2 : 1); // auto-rotate
      }

      const px = s.hovering ? s.pointerX : 0;
      const py = s.hovering ? s.pointerY : 0;
      const target = {
        ry: s.spin + s.boost + px * C.hoverRotateY,
        rx: C.baseTiltX + py * C.hoverTiltX,
        rz: C.baseTiltZ - px * 0.08,
      };

      // Lerp độc lập FPS → chuyển động mượt như nhau trên mọi màn hình
      const k = 1 - Math.pow(C.easing, dt);
      this.current.ry = lerp(this.current.ry, target.ry, k);
      this.current.rx = lerp(this.current.rx, target.rx, k);
      this.current.rz = lerp(this.current.rz, target.rz, k);
      this.logo.rotation.set(this.current.rx, this.current.ry, this.current.rz);

      // Dập dềnh nhẹ + bóng co giãn theo độ cao
      const bob = Math.sin(t * 1.6) * 0.07;
      this.floatGroup.position.y = bob;
      const height = this.jumpGroup.position.y + bob;
      const sc = 1 - height * 0.3;
      this.shadow.scale.set(sc, sc, 1);
      this.shadow.material.opacity = THREE.MathUtils.clamp(1 - height * 0.6, 0.25, 1);

      this.renderer.render(this.scene, this.camera);
    }

    /* ======================== 9. ĐỔI PHONG CÁCH: NHẢY + ĐỔI MÀU (GSAP) ==== */
    setTheme(theme) {
      if (!theme || theme === this.theme) return;
      this.theme = theme;
      const jg = this.jumpGroup;

      gsap.killTweensOf([jg.position, jg.scale, this.state]);

      // a) Nhảy: nhún → bật lên → rơi → nảy đàn hồi
      gsap.timeline()
        .to(jg.scale, { x: 1.06, y: 0.9, z: 1.06, duration: 0.12, ease: 'power2.out' })
        .to(jg.position, { y: 0.7, duration: 0.34, ease: 'power2.out' }, '>')
        .to(jg.scale, { x: 0.96, y: 1.06, z: 0.96, duration: 0.34, ease: 'power2.out' }, '<')
        .to(jg.position, { y: 0, duration: 0.3, ease: 'power2.in' })
        .to(jg.scale, { x: 1, y: 1, z: 1, duration: 0.3, ease: 'power2.in' }, '<')
        .to(jg.scale, { x: 1.05, y: 0.93, z: 1.05, duration: 0.08, ease: 'power1.out' })
        .to(jg.scale, { x: 1, y: 1, z: 1, duration: 0.6, ease: 'elastic.out(1, 0.4)' });

      // b) Xoay thêm 1 vòng khi nhảy (gộp phần đang xoay dở để không giật)
      this.state.spin += this.state.boost;
      this.state.boost = 0;
      gsap.to(this.state, {
        boost: Math.PI * 2, duration: 1.0, ease: 'power3.inOut',
        onComplete: () => { this.state.spin += this.state.boost; this.state.boost = 0; },
      });

      // c) Chuyển màu + chất liệu mượt
      const tweenColor = (m, hex) => {
        const c = lin(hex);
        gsap.to(m.color, { r: c.r, g: c.g, b: c.b, duration: 0.7, ease: 'power2.inOut' });
      };
      tweenColor(this.mats.primary, theme.primary);
      tweenColor(this.mats.secondary, theme.secondary);
      tweenColor(this.mats.plate, theme.plate);
      [this.mats.primary, this.mats.secondary].forEach((m) =>
        gsap.to(m, { metalness: theme.metalness, roughness: theme.roughness, envMapIntensity: envIntensity(theme), duration: 0.7 })
      );

      // Đèn viền ám nhẹ màu chủ đạo
      const p = new THREE.Color(theme.primary);
      gsap.to(this.rimLight.color, { r: p.r * 0.5 + 0.5, g: p.g * 0.5 + 0.5, b: p.b * 0.5 + 0.5, duration: 0.7 });
    }

    /* ======================== 10. DỌN DẸP ================================= */
    dispose() {
      cancelAnimationFrame(this._raf);
      this._ro.disconnect();
      const el = this.renderer.domElement;
      el.removeEventListener('pointermove', this._onPointerMove);
      el.removeEventListener('pointerdown', this._onPointerDown);
      el.removeEventListener('pointerup', this._onPointerUp);
      el.removeEventListener('pointercancel', this._onPointerUp);
      el.removeEventListener('pointerleave', this._onPointerLeave);
      this.scene.traverse((o) => {
        if (o.geometry) o.geometry.dispose();
        if (o.material) [].concat(o.material).forEach((m) => { if (m.map) m.map.dispose(); m.dispose(); });
      });
      if (this.scene.environment) this.scene.environment.dispose();
      this.renderer.dispose();
      el.remove();
    }
  }

  global.Logo3D = Logo3D;
})(window);
