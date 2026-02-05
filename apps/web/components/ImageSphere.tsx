"use client";

import * as THREE from "three";
import { useRef, useState, useMemo, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";

function ImagePlane({ url, position, rotation }: { url: string; position: [number, number, number]; rotation: [number, number, number] }) {
    const [texture, setTexture] = useState<THREE.Texture | null>(null);

    useEffect(() => {
        const loader = new THREE.TextureLoader();
        loader.load(
            url,
            (loadedTexture) => {
                setTexture(loadedTexture);
            },
            undefined,
            (err) => {
                console.error("Error loading texture from " + url, err);
            }
        );
    }, [url]);

    return (
        <mesh position={position} rotation={rotation}>
            <planeGeometry args={[1, 1]} />
            {texture ? (
                <meshBasicMaterial map={texture} side={THREE.DoubleSide} transparent />
            ) : (
                <meshBasicMaterial color="#444444" side={THREE.DoubleSide} transparent opacity={0.3} />
            )}
        </mesh>
    );
}

// ... existing code ...

function SphereGroup({ images, radius = 5 }: { images: string[]; radius?: number }) {
    const groupRef = useRef<THREE.Group>(null!);

    useFrame((state, delta) => {
        if (groupRef.current) {
            groupRef.current.rotation.y += delta * 0.1;
        }
    });

    const positions = useMemo(() => {
        const temp = [];
        const phi = Math.PI * (3 - Math.sqrt(5));

        for (let i = 0; i < images.length; i++) {
            const y = 1 - (i / (images.length - 1)) * 2;
            const radiusAtY = Math.sqrt(1 - y * y);

            const theta = phi * i;

            const x = Math.cos(theta) * radiusAtY;
            const z = Math.sin(theta) * radiusAtY;

            const pos = new THREE.Vector3(x * radius, y * radius, z * radius);

            const lookAt = new THREE.Vector3(0, 0, 0);
            const dummy = new THREE.Object3D();
            dummy.position.copy(pos);
            dummy.lookAt(lookAt);

            temp.push({
                pos: [pos.x, pos.y, pos.z] as [number, number, number],
                rot: [dummy.rotation.x, dummy.rotation.y, dummy.rotation.z] as [number, number, number]
            });
        }
        return temp;
    }, [images, radius]);

    return (
        <group ref={groupRef}>
            {images.map((img, i) => (
                positions[i] && (
                    <ImagePlane
                        key={i}
                        url={img}
                        position={positions[i].pos}
                        rotation={positions[i].rot}
                    />
                )
            ))}
        </group>
    );
}

export default function ImageSphere({ images }: { images: string[] }) {
    const displayImages = images.length > 0 ? images : Array(20).fill("https://avatar.vercel.sh/random");

    return (
        <div className="absolute inset-0 w-full h-full">
            <Canvas camera={{ position: [0, 0, 12], fov: 60 }}>
                {/* <fog attach="fog" args={['#000000', 8, 20]} /> */}
                <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
                <ambientLight intensity={1} />
                <SphereGroup images={displayImages} radius={6} />
            </Canvas>
        </div>
    );
}
