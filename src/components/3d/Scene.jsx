import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, PerspectiveCamera } from '@react-three/drei';
import { Suspense } from 'react';

export function Scene({ children, enableControls = false }) {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{ 
        antialias: true,
        alpha: true,
        preserveDrawingBuffer: true 
      }}
    >
      <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={50} />
      
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <spotLight
        position={[10, 10, 10]}
        angle={0.15}
        penumbra={1}
        intensity={1}
        castShadow
        shadow-mapSize={[512, 512]}
      />
      <pointLight position={[-10, -10, -10]} intensity={0.5} />
      <pointLight position={[10, 5, 5]} intensity={0.3} color="#d4af37" />

      {/* Environment for reflections */}
      <Environment preset="city" />

      {/* 3D Models */}
      <Suspense fallback={null}>
        {children}
      </Suspense>

      {/* Shadows */}
      <ContactShadows
        position={[0, -2, 0]}
        opacity={0.4}
        scale={10}
        blur={2}
        far={4}
      />

      {/* Controls */}
      {enableControls && (
        <OrbitControls
          enableZoom={true}
          enablePan={false}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 2}
        />
      )}
    </Canvas>
  );
}
