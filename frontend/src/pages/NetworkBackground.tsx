import { useCallback } from "react";
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";
import type { Engine } from "tsparticles-engine";

export default function NetworkBackground() {
  const particlesInit = useCallback(async (engine: Engine) => {
    // This loads the slim version of tsparticles
    await loadSlim(engine);
  }, []);

  return (
    <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={{
          fullScreen: { enable: false }, // Keeps it constrained to its container
          background: {
            color: { value: "transparent" },
          },
          fpsLimit: 60,
          particles: {
            color: {
              value: ["#ff6b00", "#0a0f1c", "#93c5fd"], // Orange, Navy, Light Blue
            },
            links: {
              color: "#cbd5e1", // Subtle gray lines
              distance: 180,
              enable: true,
              opacity: 0.4,
              width: 1,
            },
            move: {
              direction: "none",
              enable: true,
              outModes: {
                default: "bounce", // Particles bounce gently off the edges
              },
              random: true,
              speed: 0.6, // Very slow, smooth movement
              straight: false,
            },
            number: {
              density: {
                enable: true,
                area: 800,
              },
              value: 60, // Adjust this for more/less nodes
            },
            opacity: {
              value: 0.6,
            },
            shape: {
              type: "circle",
            },
            size: {
              value: { min: 1, max: 3 },
            },
          },
          detectRetina: true,
        }}
      />
    </div>
  );
}