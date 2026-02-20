import { useEffect, useRef } from 'react';

/** Orange accent colour – rgb(241, 90, 36) */
const ORANGE = (alpha: number) => `rgba(241, 90, 36, ${alpha})`;

const NODE_COUNT = 55;
const MAX_DIST = 165;        // px — max distance to draw a line
const SPEED = 0.28;          // px / frame
const NODE_RADIUS = 1.6;

interface Node {
    x: number;
    y: number;
    vx: number;
    vy: number;
    /** 0–1, fraction that determines whether node is orange accent */
    accent: boolean;
}

function makeNodes(w: number, h: number): Node[] {
    return Array.from({ length: NODE_COUNT }, () => {
        const angle = Math.random() * Math.PI * 2;
        return {
            x: Math.random() * w,
            y: Math.random() * h,
            vx: Math.cos(angle) * SPEED * (0.4 + Math.random() * 0.6),
            vy: Math.sin(angle) * SPEED * (0.4 + Math.random() * 0.6),
            accent: Math.random() < 0.13,   // ~13% are orange
        };
    });
}

export default function LandingBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const nodesRef = useRef<Node[]>([]);
    const rafRef = useRef<number>(0);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d')!;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            nodesRef.current = makeNodes(canvas.width, canvas.height);
        };
        resize();
        window.addEventListener('resize', resize);

        const draw = () => {
            const { width: W, height: H } = canvas;
            ctx.clearRect(0, 0, W, H);

            const nodes = nodesRef.current;

            // Move nodes — wrap at edges with a soft margin
            for (const n of nodes) {
                n.x += n.vx;
                n.y += n.vy;
                if (n.x < -20) n.x = W + 20;
                if (n.x > W + 20) n.x = -20;
                if (n.y < -20) n.y = H + 20;
                if (n.y > H + 20) n.y = -20;
            }

            // Draw connections
            for (let i = 0; i < nodes.length; i++) {
                for (let j = i + 1; j < nodes.length; j++) {
                    const a = nodes[i];
                    const b = nodes[j];
                    const dx = a.x - b.x;
                    const dy = a.y - b.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist > MAX_DIST) continue;

                    const fade = 1 - dist / MAX_DIST;
                    const isOrangeLine = a.accent || b.accent;

                    ctx.beginPath();
                    ctx.moveTo(a.x, a.y);
                    ctx.lineTo(b.x, b.y);
                    ctx.strokeStyle = isOrangeLine
                        ? ORANGE(fade * 0.12)
                        : `rgba(0, 0, 0, ${fade * 0.055})`;
                    ctx.lineWidth = isOrangeLine ? 0.9 : 0.6;
                    ctx.stroke();
                }
            }

            // Draw nodes
            for (const n of nodes) {
                ctx.beginPath();
                ctx.arc(n.x, n.y, NODE_RADIUS, 0, Math.PI * 2);
                ctx.fillStyle = n.accent ? ORANGE(0.55) : `rgba(0, 0, 0, 0.18)`;
                ctx.fill();
            }

            rafRef.current = requestAnimationFrame(draw);
        };

        rafRef.current = requestAnimationFrame(draw);
        return () => {
            cancelAnimationFrame(rafRef.current);
            window.removeEventListener('resize', resize);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 w-full h-full pointer-events-none"
            style={{ zIndex: 0, opacity: 1 }}
        />
    );
}
