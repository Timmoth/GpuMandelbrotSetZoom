import * as THREE from "three";
import { useRef, useMemo, useCallback } from "react";
import { unmountComponentAtNode } from "react-dom";
import { createRoot, Root } from "react-dom/client";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import React from "react";
import fragmentShader from "./fragmentShader.glsl";
import vertexShader from "./vertexShader.glsl";

let nexPosition: THREE.Vector2;
let zoomIn: boolean = true;

const ShaderPlane = () => {
  const mesh = useRef<THREE.Mesh>(null!);
  const size = useThree((state) => state.size);
  const viewport = useThree((state) => state.viewport);
  nexPosition = getZoomCenter();

  const uniforms = useMemo(
    () => ({
      u_time: {
        value: 1.0,
      },
      u_size: {
        value: new THREE.Vector2(size.width, size.height),
      },
      u_lightCount: {
        value: 100.0,
      },
      u_radius: {
        value: 100.0,
      },
      u_zoomCenter: {
        value: nexPosition,
      },
      u_zoomSize: { value: 5 },
      u_maxIterations: { value: 500 },

      iResolution: { value: new THREE.Vector3() },
    }),
    []
  );

  useThree((state) => {
    uniforms.u_size.value.set(state.size.width, state.size.height);

    if (mesh.current != undefined) {
      mesh.current.scale.x = state.viewport.width;
      mesh.current.scale.y = state.viewport.height;
    }
  });

  useFrame(({ camera, mouse }) => {
    uniforms.u_time.value += 0.04;
    let pos = uniforms.u_zoomCenter.value as THREE.Vec2;
    var dX = nexPosition.x - pos.x;
    var dY = nexPosition.y - pos.y;

    if (Math.abs(dX) >= 0.01 || Math.abs(dY) >= 0.01) {
      uniforms.u_zoomCenter.value = new THREE.Vector2(
        pos.x + dX / 10.0,
        pos.y + dY / 10.0
      );
    } else {
      uniforms.u_zoomCenter.value = nexPosition;
    }

    if (zoomIn) {
      uniforms.u_zoomSize.value *= 0.995;
    } else {
      uniforms.u_zoomSize.value *= 1.05;
    }

    if (uniforms.u_zoomSize.value <= 0.00001) {
      zoomIn = false;
    } else if (uniforms.u_zoomSize.value >= 5) {
      let next = getZoomCenter();
      while (Math.abs(next.x - nexPosition.x) < 0.001) {
        next = getZoomCenter();
      }
      nexPosition = next;
      zoomIn = true;
    }
  });

  return (
    <mesh
      ref={mesh}
      scale={[viewport.width, viewport.height, 1]}
      onPointerMove={(e) => {
        e.stopPropagation();
        let x = e.x / size.width;
        let y = e.y / size.height;

        uniforms.u_lightCount.value = x * 50 + 5;
        uniforms.u_radius.value = y * 200 + 5;
      }}
    >
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        fragmentShader={fragmentShader}
        vertexShader={vertexShader}
        uniforms={uniforms}
      />
    </mesh>
  );
};

function getZoomCenter(): THREE.Vector2 {
  let val = Math.round(Math.random() * 9);
  switch (val) {
    case 0:
      return new THREE.Vector2(-0.04524074130409, 0.9868162207157852);
    case 1:
      return new THREE.Vector2(0.2549870375144766, -0.0005679790528465);
    case 2:
      return new THREE.Vector2(-1.315180982097868, 0.073481649996795);
    case 3:
      return new THREE.Vector2(-0.7746806106269039, -0.1374168856037867);
    case 4:
      return new THREE.Vector2(-0.7336438924199521, 0.2455211406714035);
    case 5:
      return new THREE.Vector2(0.2929859127507, 0.6117848324958);
    case 6:
      return new THREE.Vector2(0.33698444648918, 0.048778219681);
    case 7:
      return new THREE.Vector2(0.3369844464869, 0.048778219666);
    case 8:
      return new THREE.Vector2(0.432539867562512, 0.226118675951818);
    case 9:
      return new THREE.Vector2(0.432539867562512, 0.226118675951765);
  }
}

export function Start() {
  createRoot(document.getElementById("root") as HTMLElement).render(
    <Canvas>
      <ShaderPlane />
    </Canvas>
  );
}

export function Stop() {
  unmountComponentAtNode(document.getElementById("root") as HTMLElement);
}
