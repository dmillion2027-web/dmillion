import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, MeshReflectorMaterial } from '@react-three/drei';
import * as THREE from 'three';

export function BagModel({ position = [0, 0, 0], scale = 1 }) {
  const meshRef = useRef();
  
  // Rotate the bag slowly
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.2;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <group position={position}>
      {/* Main Bag Body */}
      <mesh ref={meshRef} castShadow receiveShadow>
        <boxGeometry args={[1.5 * scale, 2 * scale, 0.8 * scale]} />
        <meshStandardMaterial
          color="#1a1a1a"
          roughness={0.2}
          metalness={0.8}
          envMapIntensity={1}
        />
      </mesh>

      {/* Quilted Pattern Effect */}
      <mesh position={[0, 0, 0.41 * scale]} castShadow>
        <boxGeometry args={[1.4 * scale, 1.9 * scale, 0.02 * scale]} />
        <meshStandardMaterial
          color="#0a0a0a"
          roughness={0.3}
          metalness={0.6}
          normalScale={new THREE.Vector2(0.5, 0.5)}
        />
      </mesh>

      {/* Logo Plate */}
      <mesh position={[0, 0.3 * scale, 0.42 * scale]} castShadow>
        <boxGeometry args={[0.4 * scale, 0.3 * scale, 0.02 * scale]} />
        <meshStandardMaterial
          color="#d4af37"
          roughness={0.1}
          metalness={1}
          emissive="#d4af37"
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* Handle */}
      <group position={[0, 1.3 * scale, 0]}>
        <mesh castShadow>
          <torusGeometry args={[0.4 * scale, 0.08 * scale, 16, 32, Math.PI]} />
          <meshStandardMaterial
            color="#1a1a1a"
            roughness={0.2}
            metalness={0.8}
          />
        </mesh>
      </group>

      {/* Bottom accent */}
      <mesh position={[0, -1 * scale, 0]} castShadow>
        <boxGeometry args={[1.5 * scale, 0.1 * scale, 0.8 * scale]} />
        <meshStandardMaterial
          color="#d4af37"
          roughness={0.1}
          metalness={1}
        />
      </mesh>

      {/* Side accents */}
      <mesh position={[-0.76 * scale, 0, 0]} rotation={[0, Math.PI / 2, 0]} castShadow>
        <boxGeometry args={[0.8 * scale, 2 * scale, 0.02 * scale]} />
        <meshStandardMaterial
          color="#0a0a0a"
          roughness={0.3}
          metalness={0.6}
        />
      </mesh>
      <mesh position={[0.76 * scale, 0, 0]} rotation={[0, Math.PI / 2, 0]} castShadow>
        <boxGeometry args={[0.8 * scale, 2 * scale, 0.02 * scale]} />
        <meshStandardMaterial
          color="#0a0a0a"
          roughness={0.3}
          metalness={0.6}
        />
      </mesh>
    </group>
  );
}

export function SimpleBagModel({ position = [0, 0, 0], scale = 0.5, color = "#1a1a1a" }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
    }
  });

  return (
    <group position={position}>
      <mesh ref={meshRef} castShadow>
        <boxGeometry args={[1.5 * scale, 2 * scale, 0.8 * scale]} />
        <meshStandardMaterial
          color={color}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>
      <mesh position={[0, 0.3 * scale, 0.41 * scale]}>
        <boxGeometry args={[0.4 * scale, 0.3 * scale, 0.02 * scale]} />
        <meshStandardMaterial
          color="#d4af37"
          roughness={0.1}
          metalness={1}
        />
      </mesh>
    </group>
  );
}
