import React, { useEffect, useRef } from 'react';
import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  Group,
  IcosahedronGeometry,
  TorusGeometry,
  OctahedronGeometry,
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
      // Graceful fallback: CSS grid & ambient lighting will still render via HTML/CSS
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
      powerPreference: 'low-power',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // ResolveHub design system color constants
    const COLOR_IRIS = 0x6257D9;   // #6257D9 primary brand purple
    const COLOR_BLUE = 0x3B82F6;   // #3B82F6 sapphire accent
    const COLOR_VIOLET = 0x8B5CF6; // #8B5CF6 light violet accent

    const isAuth = variant === 'auth';

    // Master group for 3D elements
    const sceneGroup = new Group();
    scene.add(sceneGroup);

    // 4. Object A: Dual Geodesic Icosphere (Upper Right Perimeter)
    const icosphereGroup = new Group();

    const outerIcoGeom = new IcosahedronGeometry(7, 1);
    const outerIcoWire = new WireframeGeometry(outerIcoGeom);
    const outerIcoMat = new LineBasicMaterial({
      color: COLOR_IRIS,
      transparent: true,
      opacity: isAuth ? 0.22 : 0.17,
    });
    const outerIcoMesh = new LineSegments(outerIcoWire, outerIcoMat);
    icosphereGroup.add(outerIcoMesh);

    const innerIcoGeom = new IcosahedronGeometry(4.2, 0);
    const innerIcoWire = new WireframeGeometry(innerIcoGeom);
    const innerIcoMat = new LineBasicMaterial({
      color: COLOR_BLUE,
      transparent: true,
      opacity: isAuth ? 0.25 : 0.20,
    });
    const innerIcoMesh = new LineSegments(innerIcoWire, innerIcoMat);
    icosphereGroup.add(innerIcoMesh);

    sceneGroup.add(icosphereGroup);

    // 5. Object B: Wireframe Torus Ring (Lower Left Perimeter)
    const torusGeom = new TorusGeometry(5.8, 1.6, 10, 24);
    const torusWire = new WireframeGeometry(torusGeom);
    const torusMat = new LineBasicMaterial({
      color: COLOR_BLUE,
      transparent: true,
      opacity: isAuth ? 0.20 : 0.15,
    });
    const torusMesh = new LineSegments(torusWire, torusMat);
    sceneGroup.add(torusMesh);

    // 6. Object C: Floating Wireframe Octahedron (Far Right / Margin Perimeter)
    const octaGeom = new OctahedronGeometry(4.5, 0);
    const octaWire = new WireframeGeometry(octaGeom);
    const octaMat = new LineBasicMaterial({
      color: COLOR_VIOLET,
      transparent: true,
      opacity: isAuth ? 0.22 : 0.16,
    });
    const octaMesh = new LineSegments(octaWire, octaMat);
    sceneGroup.add(octaMesh);

    // 7. Connected Technical Network (Issues / Graph Connections)
    const NODE_COUNT = width < 768 ? 16 : 28;
    const MAX_DISTANCE = 11;
    const nodePositions = [];
    const nodeVelocities = [];

    for (let i = 0; i < NODE_COUNT; i++) {
      nodePositions.push(
        (Math.random() - 0.5) * 58,
        (Math.random() - 0.5) * 34,
        (Math.random() - 0.5) * 12
      );
      nodeVelocities.push({
        x: (Math.random() - 0.5) * 0.016,
        y: (Math.random() - 0.5) * 0.016,
        z: (Math.random() - 0.5) * 0.008,
      });
    }

    const nodesGeom = new BufferGeometry();
    const posAttr = new Float32BufferAttribute(nodePositions, 3);
    nodesGeom.setAttribute('position', posAttr);

    const nodesMat = new PointsMaterial({
      color: COLOR_IRIS,
      size: 2.5,
      transparent: true,
      opacity: isAuth ? 0.38 : 0.28,
    });
    const nodesMesh = new Points(nodesGeom, nodesMat);
    sceneGroup.add(nodesMesh);

    // Pre-allocated line segment buffer for 60fps connectivity
    const MAX_CONNECTIONS = NODE_COUNT * 4;
    const linePositions = new Float32Array(MAX_CONNECTIONS * 2 * 3);
    const linesGeom = new BufferGeometry();
    linesGeom.setAttribute(
      'position',
      new BufferAttribute(linePositions, 3).setUsage(DynamicDrawUsage)
    );

    const linesMat = new LineBasicMaterial({
      color: COLOR_IRIS,
      transparent: true,
      opacity: isAuth ? 0.15 : 0.12,
    });
    const linesMesh = new LineSegments(linesGeom, linesMat);
    sceneGroup.add(linesMesh);

    // Dynamic responsive positioning along the perimeter of the screen
    const updatePositions = () => {
      const curW = container.clientWidth || window.innerWidth;
      const curH = container.clientHeight || window.innerHeight;
      const aspect = curW / curH;

      // Approximate visible dimensions at z=0 (camera at z=50, FOV 45)
      const vHeight = 2 * Math.tan((camera.fov * Math.PI) / 360) * 50;
      const vWidth = vHeight * aspect;

      if (curW < 768) {
        // Mobile layout: scale down and push to corners
        icosphereGroup.position.set(vWidth * 0.38, vHeight * 0.38, 0);
        icosphereGroup.scale.setScalar(0.62);

        torusMesh.position.set(-vWidth * 0.36, -vHeight * 0.36, -4);
        torusMesh.scale.setScalar(0.55);

        octaMesh.position.set(vWidth * 0.35, -vHeight * 0.22, -2);
        octaMesh.scale.setScalar(0.52);
      } else {
        // Desktop / Laptop layout: position around perimeter margins
        icosphereGroup.position.set(vWidth * 0.36, vHeight * 0.32, 0);
        icosphereGroup.scale.setScalar(1.0);

        torusMesh.position.set(-vWidth * 0.38, -vHeight * 0.30, -5);
        torusMesh.scale.setScalar(1.0);

        octaMesh.position.set(vWidth * 0.40, -vHeight * 0.12, -2);
        octaMesh.scale.setScalar(0.9);
      }
    };

    updatePositions();

    // 8. Animation Loop
    let animationFrameId = null;
    let clock = 0;

    const animate = () => {
      clock += 0.01;

      // 3D Wireframe Rotations & Floats
      icosphereGroup.rotation.y += 0.0022;
      icosphereGroup.rotation.x += 0.0014;
      innerIcoMesh.rotation.y -= 0.0035;
      innerIcoMesh.rotation.z += 0.0025;
      icosphereGroup.position.y += Math.sin(clock * 0.8) * 0.018;

      torusMesh.rotation.x += 0.002;
      torusMesh.rotation.y += 0.0024;
      torusMesh.position.y += Math.cos(clock * 0.7) * 0.014;

      octaMesh.rotation.y += 0.003;
      octaMesh.rotation.z += 0.0018;
      octaMesh.position.y += Math.sin(clock * 0.9) * 0.016;

      // Network graph node updates
      const posArray = posAttr.array;
      let lineIndex = 0;

      for (let i = 0; i < NODE_COUNT; i++) {
        const i3 = i * 3;
        posArray[i3] += nodeVelocities[i].x;
        posArray[i3 + 1] += nodeVelocities[i].y;
        posArray[i3 + 2] += nodeVelocities[i].z;

        // Soft bounce within boundary limits
        if (Math.abs(posArray[i3]) > 32) nodeVelocities[i].x *= -1;
        if (Math.abs(posArray[i3 + 1]) > 18) nodeVelocities[i].y *= -1;
        if (Math.abs(posArray[i3 + 2]) > 6) nodeVelocities[i].z *= -1;

        // Connect nearby nodes with subtle wireframe lines
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
      // Render static frame once for accessibility
      renderer.render(scene, camera);
    } else {
      animationFrameId = requestAnimationFrame(animate);
    }

    // 9. Window Resize Handling
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

    // 10. Complete Resource Cleanup
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      window.removeEventListener('resize', handleResize);

      // Dispose geometries
      [
        outerIcoGeom,
        outerIcoWire,
        innerIcoGeom,
        innerIcoWire,
        torusGeom,
        torusWire,
        octaGeom,
        octaWire,
        nodesGeom,
        linesGeom,
      ].forEach((geom) => geom?.dispose?.());

      // Dispose materials
      [
        outerIcoMat,
        innerIcoMat,
        torusMat,
        octaMat,
        nodesMat,
        linesMat,
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
          <div className="wireframe-ambient-glow-1 absolute -top-24 -right-24 w-[520px] h-[520px] rounded-full pointer-events-none" />
          <div className="wireframe-ambient-glow-2 absolute -bottom-28 -left-28 w-[560px] h-[560px] rounded-full pointer-events-none" />
        </>
      )}

      {/* C. Three.js 3D Wireframe Objects & Connected Network Canvas */}
      <div ref={mountRef} className="wireframe-canvas-container absolute inset-0" />
    </div>
  );
};
