import React, { useEffect, useRef } from 'react';
import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  Group,
  IcosahedronGeometry,
  TorusGeometry,
  OctahedronGeometry,
  DodecahedronGeometry,
  WireframeGeometry,
  LineSegments,
  LineBasicMaterial,
  BufferGeometry,
  BufferAttribute,
  Float32BufferAttribute,
  Points,
  PointsMaterial,
  DynamicDrawUsage,
} from 'three';
import './WireframeBackground.css';

export const WireframeBackground = ({
  variant = 'app',
  showGrid = true,
  showAmbient = true,
  className = '',
}) => {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Accessibility: Check for prefers-reduced-motion
    let prefersReducedMotion = false;
    try {
      prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch {
      prefersReducedMotion = false;
    }

    // 2. WebGL Availability Check
    let isWebGLAvailable = false;
    try {
      const testCanvas = document.createElement('canvas');
      isWebGLAvailable = !!(
        window.WebGLRenderingContext &&
        (testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl'))
      );
    } catch {
      isWebGLAvailable = false;
    }

    if (!isWebGLAvailable) {
      return;
    }

    // 3. Scene, Camera, and WebGL Renderer
    const scene = new Scene();
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const camera = new PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 50;

    const renderer = new WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // ResolveHub design system color constants - soft, light pastel tones for airy elegance
    const COLOR_LIGHT_LAVENDER = 0xB4A9E8;   // #B4A9E8 soft light lavender
    const COLOR_LIGHT_PERIWINKLE = 0xA5B4FC; // #A5B4FC airy light periwinkle
    const COLOR_LIGHT_LILAC = 0xC4B5FD;      // #C4B5FD gentle pastel lilac
    const COLOR_LIGHT_SKY = 0xBAE6FD;        // #BAE6FD soft light sky blue

    const isAuth = variant === 'auth';

    // Master group for 3D elements
    const sceneGroup = new Group();
    scene.add(sceneGroup);

    // 4. Object A: Dual Geodesic Icosphere (Upper Right Perimeter)
    const icosphereGroup = new Group();

    const outerIcoGeom = new IcosahedronGeometry(7.2, 1);
    const outerIcoWire = new WireframeGeometry(outerIcoGeom);
    const outerIcoMat = new LineBasicMaterial({
      color: COLOR_LIGHT_LAVENDER,
      transparent: true,
      opacity: isAuth ? 0.40 : 0.32,
    });
    const outerIcoMesh = new LineSegments(outerIcoWire, outerIcoMat);
    icosphereGroup.add(outerIcoMesh);

    const innerIcoGeom = new IcosahedronGeometry(4.4, 0);
    const innerIcoWire = new WireframeGeometry(innerIcoGeom);
    const innerIcoMat = new LineBasicMaterial({
      color: COLOR_LIGHT_PERIWINKLE,
      transparent: true,
      opacity: isAuth ? 0.45 : 0.36,
    });
    const innerIcoMesh = new LineSegments(innerIcoWire, innerIcoMat);
    icosphereGroup.add(innerIcoMesh);

    sceneGroup.add(icosphereGroup);

    // 5. Object B: Wireframe Torus Ring (Upper Left Corner - Behind Sidebar Header & Topbar Left)
    const torusGeom = new TorusGeometry(6.0, 1.8, 14, 30);
    const torusWire = new WireframeGeometry(torusGeom);
    const torusMat = new LineBasicMaterial({
      color: COLOR_LIGHT_PERIWINKLE,
      transparent: true,
      opacity: isAuth ? 0.38 : 0.30,
    });
    const torusMesh = new LineSegments(torusWire, torusMat);
    sceneGroup.add(torusMesh);

    // 6. Object C: Floating Wireframe Octahedron (Lower Left - Behind Lower Sidebar)
    const octaGeom = new OctahedronGeometry(5.2, 0);
    const octaWire = new WireframeGeometry(octaGeom);
    const octaMat = new LineBasicMaterial({
      color: COLOR_LIGHT_LILAC,
      transparent: true,
      opacity: isAuth ? 0.40 : 0.32,
    });
    const octaMesh = new LineSegments(octaWire, octaMat);
    sceneGroup.add(octaMesh);

    // 7. Object D: Floating Wireframe Dodecahedron (Mid / Lower Right)
    const dodecaGeom = new DodecahedronGeometry(5.4, 0);
    const dodecaWire = new WireframeGeometry(dodecaGeom);
    const dodecaMat = new LineBasicMaterial({
      color: COLOR_LIGHT_LAVENDER,
      transparent: true,
      opacity: isAuth ? 0.38 : 0.30,
    });
    const dodecaMesh = new LineSegments(dodecaWire, dodecaMat);
    sceneGroup.add(dodecaMesh);

    // 8. Object E: Center Floating Wireframe Icosahedron (Directly Behind Workspace Table)
    const centerGeom = new IcosahedronGeometry(6.2, 0);
    const centerWire = new WireframeGeometry(centerGeom);
    const centerMat = new LineBasicMaterial({
      color: COLOR_LIGHT_LAVENDER,
      transparent: true,
      opacity: isAuth ? 0.38 : 0.28,
    });
    const centerMesh = new LineSegments(centerWire, centerMat);
    sceneGroup.add(centerMesh);

    // 9. Connected Technical Network (Issues / Graph Constellation)
    const NODE_COUNT = width < 768 ? 40 : 88;
    const MAX_DISTANCE = 16.0;
    const nodePositions = [];
    const nodeVelocities = [];

    for (let i = 0; i < NODE_COUNT; i++) {
      nodePositions.push(
        (Math.random() - 0.5) * 85,
        (Math.random() - 0.5) * 52,
        (Math.random() - 0.5) * 16
      );
      nodeVelocities.push({
        x: (Math.random() - 0.5) * 0.052,
        y: (Math.random() - 0.5) * 0.052,
        z: (Math.random() - 0.5) * 0.024,
      });
    }

    const nodesGeom = new BufferGeometry();
    const posAttr = new Float32BufferAttribute(nodePositions, 3);
    nodesGeom.setAttribute('position', posAttr);

    const nodesMat = new PointsMaterial({
      color: COLOR_LIGHT_LAVENDER,
      size: 4.2,
      transparent: true,
      opacity: isAuth ? 0.60 : 0.48,
    });
    const nodesMesh = new Points(nodesGeom, nodesMat);
    sceneGroup.add(nodesMesh);

    // Pre-allocated line segment buffer for 60fps connectivity
    const MAX_CONNECTIONS = NODE_COUNT * 5;
    const linePositions = new Float32Array(MAX_CONNECTIONS * 2 * 3);
    const linesGeom = new BufferGeometry();
    linesGeom.setAttribute(
      'position',
      new BufferAttribute(linePositions, 3).setUsage(DynamicDrawUsage)
    );

    const linesMat = new LineBasicMaterial({
      color: COLOR_LIGHT_LAVENDER,
      transparent: true,
      opacity: isAuth ? 0.30 : 0.22,
    });
    const linesMesh = new LineSegments(linesGeom, linesMat);
    sceneGroup.add(linesMesh);

    // 10. Floating Ambient Star Dust Sparkles
    const SPARKLE_COUNT = 85;
    const sparklePositions = new Float32Array(SPARKLE_COUNT * 3);
    for (let s = 0; s < SPARKLE_COUNT; s++) {
      sparklePositions[s * 3] = (Math.random() - 0.5) * 85;
      sparklePositions[s * 3 + 1] = (Math.random() - 0.5) * 55;
      sparklePositions[s * 3 + 2] = (Math.random() - 0.5) * 24;
    }
    const sparklesGeom = new BufferGeometry();
    sparklesGeom.setAttribute('position', new Float32BufferAttribute(sparklePositions, 3));
    const sparklesMat = new PointsMaterial({
      color: COLOR_LIGHT_LILAC,
      size: 2.4,
      transparent: true,
      opacity: 0.38,
    });
    const sparklesMesh = new Points(sparklesGeom, sparklesMat);
    sceneGroup.add(sparklesMesh);

    // Store base positions for jitter-free sinusoidal floating
    const basePositions = {
      icoY: 0,
      torusY: 0,
      octaY: 0,
      dodecaY: 0,
      centerY: 0,
    };

    // Dynamic responsive positioning along the perimeter and layout of the screen
    const updatePositions = () => {
      const curW = container.clientWidth || window.innerWidth;
      const curH = container.clientHeight || window.innerHeight;
      const aspect = curW / curH;

      const vHeight = 2 * Math.tan((camera.fov * Math.PI) / 360) * 50;
      const vWidth = vHeight * aspect;

      if (curW < 768) {
        // Mobile layout
        icosphereGroup.position.set(vWidth * 0.32, vHeight * 0.32, 0);
        basePositions.icoY = vHeight * 0.32;
        icosphereGroup.scale.setScalar(0.7);

        torusMesh.position.set(-vWidth * 0.32, vHeight * 0.28, -2);
        basePositions.torusY = vHeight * 0.28;
        torusMesh.scale.setScalar(0.6);

        octaMesh.position.set(-vWidth * 0.30, -vHeight * 0.24, -2);
        basePositions.octaY = -vHeight * 0.24;
        octaMesh.scale.setScalar(0.6);

        dodecaMesh.position.set(vWidth * 0.30, -vHeight * 0.22, -2);
        basePositions.dodecaY = -vHeight * 0.22;
        dodecaMesh.scale.setScalar(0.6);

        centerMesh.position.set(0, -vHeight * 0.05, -3);
        basePositions.centerY = -vHeight * 0.05;
        centerMesh.scale.setScalar(0.6);
      } else {
        // Desktop layout: strategically positioned to be visible behind Topbar, Sidebar, and Table
        icosphereGroup.position.set(vWidth * 0.28, vHeight * 0.26, 0);
        basePositions.icoY = vHeight * 0.26;
        icosphereGroup.scale.setScalar(1.1);

        torusMesh.position.set(-vWidth * 0.30, vHeight * 0.24, -1);
        basePositions.torusY = vHeight * 0.24;
        torusMesh.scale.setScalar(1.05);

        octaMesh.position.set(-vWidth * 0.26, -vHeight * 0.16, -1);
        basePositions.octaY = -vHeight * 0.16;
        octaMesh.scale.setScalar(1.05);

        dodecaMesh.position.set(vWidth * 0.25, -vHeight * 0.15, -1);
        basePositions.dodecaY = -vHeight * 0.15;
        dodecaMesh.scale.setScalar(1.05);

        centerMesh.position.set(-vWidth * 0.05, -vHeight * 0.05, -2);
        basePositions.centerY = -vHeight * 0.05;
        centerMesh.scale.setScalar(1.15);
      }
    };

    updatePositions();

    // Mouse parallax variables
    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;

    const handleMouseMove = (event) => {
      const windowHalfX = window.innerWidth / 2;
      const windowHalfY = window.innerHeight / 2;
      targetMouseX = ((event.clientX - windowHalfX) / windowHalfX) * 0.09;
      targetMouseY = ((event.clientY - windowHalfY) / windowHalfY) * 0.09;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // 10. Active 60fps Animation Loop with dynamic floating & rotations
    let animationFrameId = null;
    let clock = 0;

    const animate = () => {
      clock += 0.016;

      // Mouse parallax smooth interpolation
      mouseX += (targetMouseX - mouseX) * 0.04;
      mouseY += (targetMouseY - mouseY) * 0.04;
      sceneGroup.rotation.y = mouseX;
      sceneGroup.rotation.x = -mouseY;

      // 3D Wireframe Rotations (visible, elegant, continuous)
      icosphereGroup.rotation.y += 0.0055;
      icosphereGroup.rotation.x += 0.0035;
      innerIcoMesh.rotation.y -= 0.008;
      innerIcoMesh.rotation.z += 0.006;

      torusMesh.rotation.x += 0.005;
      torusMesh.rotation.y += 0.006;

      octaMesh.rotation.y += 0.007;
      octaMesh.rotation.z += 0.0045;

      dodecaMesh.rotation.x += 0.0055;
      dodecaMesh.rotation.y -= 0.0065;

      centerMesh.rotation.y += 0.006;
      centerMesh.rotation.x -= 0.0045;

      // Noticeable floating sinusoidal bobbing (~35-45px range)
      icosphereGroup.position.y = basePositions.icoY + Math.sin(clock * 1.2) * 1.6;
      torusMesh.position.y = basePositions.torusY + Math.cos(clock * 1.0) * 1.4;
      octaMesh.position.y = basePositions.octaY + Math.sin(clock * 1.3) * 1.5;
      dodecaMesh.position.y = basePositions.dodecaY + Math.cos(clock * 1.1) * 1.5;
      centerMesh.position.y = basePositions.centerY + Math.sin(clock * 1.15) * 1.8;

      // Floating ambient sparkles drift
      const sPos = sparklesGeom.attributes.position.array;
      for (let s = 0; s < SPARKLE_COUNT; s++) {
        const s3 = s * 3;
        sPos[s3 + 1] += 0.025;
        if (sPos[s3 + 1] > 28) {
          sPos[s3 + 1] = -28;
        }
      }
      sparklesGeom.attributes.position.needsUpdate = true;

      // Network graph node updates with visible continuous drift
      const posArray = posAttr.array;
      let lineIndex = 0;

      for (let i = 0; i < NODE_COUNT; i++) {
        const i3 = i * 3;
        posArray[i3] += nodeVelocities[i].x;
        posArray[i3 + 1] += nodeVelocities[i].y;
        posArray[i3 + 2] += nodeVelocities[i].z;

        // Soft bounce within boundary limits
        if (Math.abs(posArray[i3]) > 42) nodeVelocities[i].x *= -1;
        if (Math.abs(posArray[i3 + 1]) > 26) nodeVelocities[i].y *= -1;
        if (Math.abs(posArray[i3 + 2]) > 8) nodeVelocities[i].z *= -1;

        // Connect nearby nodes with crisp wireframe lines
        for (let j = i + 1; j < NODE_COUNT; j++) {
          if (lineIndex >= MAX_CONNECTIONS) break;
          const j3 = j * 3;
          const dx = posArray[i3] - posArray[j3];
          const dy = posArray[i3 + 1] - posArray[j3 + 1];
          const dz = posArray[i3 + 2] - posArray[j3 + 2];
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (dist < MAX_DISTANCE) {
            const lIdx = lineIndex * 6;
            linePositions[lIdx] = posArray[i3];
            linePositions[lIdx + 1] = posArray[i3 + 1];
            linePositions[lIdx + 2] = posArray[i3 + 2];

            linePositions[lIdx + 3] = posArray[j3];
            linePositions[lIdx + 4] = posArray[j3 + 1];
            linePositions[lIdx + 5] = posArray[j3 + 2];

            lineIndex++;
          }
        }
      }

      posAttr.needsUpdate = true;
      linesGeom.attributes.position.needsUpdate = true;
      linesGeom.setDrawRange(0, lineIndex * 2);

      renderer.render(scene, camera);

      if (!prefersReducedMotion) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    if (prefersReducedMotion) {
      renderer.render(scene, camera);
    } else {
      animationFrameId = requestAnimationFrame(animate);
    }

    // 11. Window Resize Handling
    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth || window.innerWidth;
      const newHeight = container.clientHeight || window.innerHeight;

      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();

      renderer.setSize(newWidth, newHeight);
      updatePositions();

      if (prefersReducedMotion) {
        renderer.render(scene, camera);
      }
    };

    window.addEventListener('resize', handleResize);

    // 12. Complete Resource Cleanup
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);

      [
        outerIcoGeom,
        outerIcoWire,
        innerIcoGeom,
        innerIcoWire,
        torusGeom,
        torusWire,
        octaGeom,
        octaWire,
        dodecaGeom,
        dodecaWire,
        centerGeom,
        centerWire,
        nodesGeom,
        linesGeom,
        sparklesGeom,
      ].forEach((geom) => geom?.dispose?.());

      [
        outerIcoMat,
        innerIcoMat,
        torusMat,
        octaMat,
        dodecaMat,
        centerMat,
        nodesMat,
        linesMat,
        sparklesMat,
      ].forEach((mat) => mat?.dispose?.());

      renderer.dispose();

      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [variant]);

  return (
    <div
      className={`wireframe-bg-root fixed inset-0 pointer-events-none select-none z-0 overflow-hidden ${className}`}
      aria-hidden="true"
    >
      {/* A. Animated Wireframe Grid Layer */}
      {showGrid && <div className="wireframe-grid-layer absolute inset-0" />}

      {/* B. Ambient Soft Radial Gradient Lighting */}
      {showAmbient && (
        <>
          <div className="wireframe-ambient-glow-1 absolute -top-20 -right-20 w-[560px] h-[560px] rounded-full pointer-events-none" />
          <div className="wireframe-ambient-glow-2 absolute -bottom-24 -left-24 w-[600px] h-[600px] rounded-full pointer-events-none" />
          {/* Dedicated animated glows bathing topbar and sidebar areas */}
          <div className="wireframe-ambient-topbar-glow absolute -top-6 left-0 right-0 h-48 pointer-events-none" />
          <div className="wireframe-ambient-sidebar-glow absolute top-0 bottom-0 left-0 w-52 pointer-events-none" />
        </>
      )}

      {/* C. Three.js 3D Wireframe Objects & Connected Network Canvas */}
      <div ref={mountRef} className="wireframe-canvas-container absolute inset-0" />
    </div>
  );
};
export default WireframeBackground;
