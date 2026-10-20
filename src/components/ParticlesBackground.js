import { useCallback } from 'react';
import Particles from 'react-particles';
import { loadSlim } from 'tsparticles-slim';

const PARTICLE_OPTIONS = {
  background: { color: { value: '#FAFAFA' } },
  fpsLimit: 120,
  interactivity: {
    events: {
      onClick: { enable: true, mode: 'push' },
      onHover: { enable: true, mode: 'repulse' },
      resize: true,
    },
    modes: {
      push: { quantity: 5 },
      repulse: { distance: 70, duration: 200 },
    },
  },
  particles: {
    color: { value: '#0A0A0A' },
    links: { color: '#0A0A0A', distance: 150, enable: true, opacity: 0.5, width: 1 },
    move: {
      direction: 'none',
      enable: true,
      outModes: { default: 'bounce' },
      random: false,
      speed: 2,
      straight: false,
    },
    number: { density: { enable: true, area: 1200 }, value: 80 },
    opacity: { value: 0.5 },
    shape: { type: 'circle' },
    size: { value: { min: 1, max: 5 } },
  },
  detectRetina: true,
};

export default function ParticlesBackground() {
  const init = useCallback(async (engine) => {
    await loadSlim(engine);
  }, []);

  return <Particles id="tsparticles" init={init} options={PARTICLE_OPTIONS} />;
}
