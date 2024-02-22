"use client";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import styles from "./page.module.css";
import { useEffect, useRef, useState } from "react";
import { Mesh, TextureLoader } from "three";
import { OrbitControls } from "@react-three/drei";
import { motion } from "framer-motion";

export default function Home() {
  const [scene, setScene] = useState<string>("ball");
  const [isDay, setIsDay] = useState<boolean>(true);

  return (
    <div className={styles.container}>
      <motion.span
        animate={{ opacity: 1 }}
        initial={{ opacity: 0 }}
        transition={{ duration: 1 }}
      >
        <Canvas
          className={styles.canvas}
          camera={{ fov: 45, near: 0.1, far: 100, position: [0, 0, 4] }}
          dpr={2}

          // style={{ width: "100vw", height: "100vw" }}
        >
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            autoRotate={true}
            autoRotateSpeed={scene === "ball" ? 5 : 0.3}
          />
          <pointLight
            color={"#fff"}
            distance={100}
            intensity={scene === "ball" ? 200 : 800}
            position={[0, 10, 10]}
          />
          {scene === "ball" ? <Ball /> : <Earth isDay={isDay} />}
        </Canvas>
      </motion.span>
      <motion.nav
        className={styles.navbar}
        animate={{ y: 0 }}
        initial={{ y: "-100%" }}
        transition={{ duration: 1, delay: 1 }}
      >
        <a href="https://adamplanet.cz/adamcode/">The Ball</a>
        <ul className={styles.sceneSwitch}>
          <li>
            <button onClick={() => setScene("ball")}>Ball</button>
          </li>
          <li>
            <button onClick={() => setScene("earth")}>Earth</button>
          </li>
          <motion.ul
            className={styles.earthButtons}
            animate={
              scene === "ball" ? { x: 1000, opacity: 1 } : { x: 0, opacity: 1 }
            }
            initial={{ x: 1000, opacity: 0 }}
            transition={{ duration: 1 }}
          >
            <li>
              <button onClick={() => setIsDay(true)}>Day</button>
            </li>
            <li>
              <button onClick={() => setIsDay(false)}>Night</button>
            </li>
          </motion.ul>
        </ul>
      </motion.nav>
      <motion.h1
        className={styles.title}
        animate={{ opacity: 1 }}
        initial={{ opacity: 0 }}
        transition={{ duration: 2, delay: 2.5 }}
      >
        Give it a spin
      </motion.h1>
    </div>
  );
}

function Ball() {
  const mesh = useRef<Mesh>(null);
  const [color, setColor] = useState("rgb(80,125,150)");

  useEffect(() => {
    let mouseDown = false;

    const manageMouseDown = () => (mouseDown = true);
    const manageMouseUp = () => (mouseDown = false);

    const manageMouseMove = (e: any) => {
      if (!mouseDown) return;
      const { innerWidth, innerHeight } = window;
      const { clientX, clientY } = e.touches ? e.touches[0] : e;
      setColor(
        `rgb(${Math.round((clientX / innerWidth) * 255)},${Math.round(
          (clientY / innerHeight) * 255
        )},150)`
      );
    };

    window.addEventListener("mousedown", manageMouseDown);
    window.addEventListener("mouseup", manageMouseUp);
    window.addEventListener("mousemove", manageMouseMove);

    window.addEventListener("touchstart", manageMouseDown);
    window.addEventListener("touchend", manageMouseUp);
    window.addEventListener("touchmove", manageMouseMove);

    return () => {
      window.removeEventListener("mousemove", manageMouseMove);
      window.removeEventListener("mousedown", manageMouseDown);
      window.removeEventListener("mouseup", manageMouseUp);

      window.removeEventListener("touchmove", manageMouseMove);
      window.removeEventListener("touchstart", manageMouseDown);
      window.removeEventListener("touchend", manageMouseUp);
    };
  }, []);

  return (
    <mesh ref={mesh}>
      <sphereGeometry args={[1, 64, 64]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

function Earth(props: any) {
  const earthRef = useRef<Mesh>(null);
  const cloudsRef = useRef<Mesh>(null);

  useFrame((state, delta) => {
    if (earthRef.current) {
      earthRef.current.rotation.x += delta * 0.1;
      earthRef.current.rotation.y += delta * 0.1;
      earthRef.current.rotation.z += delta * 0;
    }
  });

  useFrame((state, delta) => {
    if (cloudsRef.current) {
      cloudsRef.current.rotation.x += delta * 0.11;
      cloudsRef.current.rotation.y += delta * 0.11;
      cloudsRef.current.rotation.z += delta * 0;
    }
  });

  const earthDay = useLoader(TextureLoader, "2k_earth_daymap.jpg");
  const earthNight = useLoader(TextureLoader, "2k_earth_nightmap.jpg");
  const clouds = useLoader(TextureLoader, "2k_earth_clouds.jpg");
  return (
    <>
      <mesh ref={earthRef}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshLambertMaterial
          emissive={0x000000}
          color={0xffffff}
          map={props.isDay ? earthDay : earthNight}
        />
      </mesh>

      <mesh ref={cloudsRef}>
        <sphereGeometry args={[1.03, 64, 64]} />
        <meshLambertMaterial
          map={clouds}
          opacity={0.1}
          transparent={true}
          depthWrite={false}
        />
      </mesh>
    </>
  );
}
