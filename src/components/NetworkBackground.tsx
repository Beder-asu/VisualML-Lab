import { useEffect, useRef } from 'react';

export function NetworkBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d', { alpha: true });
        if (!ctx) return;

        let animationFrameId: number;
        let width = window.innerWidth;
        let height = window.innerHeight;

        canvas.width = width;
        canvas.height = height;

        const handleResize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
        };
        window.addEventListener('resize', handleResize);

        const mouse = { x: -1000, y: -1000 };
        const handleMouseMove = (e: MouseEvent) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        };
        window.addEventListener('mousemove', handleMouseMove);

        const interactionRadius = 180; // How far the mouse "activates" the network

        class Particle {
            x: number;
            y: number;
            vx: number;
            vy: number;
            baseRadius: number;
            
            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.vx = (Math.random() - 0.5) * 0.8;
                this.vy = (Math.random() - 0.5) * 0.8;
                this.baseRadius = Math.random() * 2 + 1;
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;

                // Bounce off edges
                if (this.x < 0 || this.x > width) this.vx *= -1;
                if (this.y < 0 || this.y > height) this.vy *= -1;
            }

            draw() {
                if (!ctx) return;
                const distToMouse = Math.hypot(this.x - mouse.x, this.y - mouse.y);
                const isHovered = distToMouse < interactionRadius;
                const activationIntensity = Math.max(0, 1 - distToMouse / interactionRadius);
                
                const currentRadius = isHovered ? this.baseRadius + (activationIntensity * 3) : this.baseRadius;
                
                // Draw inner core
                ctx.beginPath();
                ctx.arc(this.x, this.y, currentRadius, 0, Math.PI * 2);
                
                if (isHovered) {
                    ctx.fillStyle = `rgba(79, 70, 229, ${0.6 + (activationIntensity * 0.4)})`;
                    ctx.shadowBlur = 20;
                    ctx.shadowColor = `rgba(99, 102, 241, ${activationIntensity})`;
                } else {
                    // Resting state: faint indigo glowing core
                    ctx.fillStyle = 'rgba(99, 102, 241, 0.15)';
                    ctx.shadowBlur = 4;
                    ctx.shadowColor = 'rgba(99, 102, 241, 0.1)';
                }
                ctx.fill();
                
                // Draw delicate outer membrane to look like a cell/neuron
                ctx.beginPath();
                ctx.arc(this.x, this.y, currentRadius + 2, 0, Math.PI * 2);
                ctx.strokeStyle = isHovered 
                    ? `rgba(79, 70, 229, ${0.4 + (activationIntensity * 0.4)})` 
                    : 'rgba(99, 102, 241, 0.12)';
                ctx.lineWidth = 0.8;
                ctx.stroke();
            }
        }

        // Density scale: 1 particle per 12,000 pixels (smooth but populated)
        const particleCount = Math.floor((width * height) / 12000); 
        const particles = Array.from({ length: particleCount }, () => new Particle());

        const animate = () => {
            ctx.clearRect(0, 0, width, height);
            
            // Draw connections
            particles.forEach((p, i) => {
                p.update();
                p.draw();

                // Draw lines to nearby particles
                for (let j = i + 1; j < particles.length; j++) {
                    const p2 = particles[j];
                    const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
                    
                    if (dist < 120) {
                        const distToMouseP1 = Math.hypot(p.x - mouse.x, p.y - mouse.y);
                        const distToMouseP2 = Math.hypot(p2.x - mouse.x, p2.y - mouse.y);
                        
                        // If either line node is near mouse, make the edge glow powerfully ("activation propagation")
                        const nearMouse = distToMouseP1 < interactionRadius || distToMouseP2 < interactionRadius;
                        const lineOpacity = 1 - (dist / 120);

                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        
                        if (nearMouse) {
                            const maxActivation = Math.max(
                                0, 1 - distToMouseP1 / interactionRadius, 
                                0, 1 - distToMouseP2 / interactionRadius
                            );
                            // Vibrant Indigo stroke
                            ctx.strokeStyle = `rgba(79, 70, 229, ${Math.min(0.8, lineOpacity * maxActivation * 1.5)})`;
                            ctx.lineWidth = 1.0 + (maxActivation * 1.5);
                            ctx.shadowBlur = 10;
                            ctx.shadowColor = `rgba(99, 102, 241, ${maxActivation})`;
                        } else {
                            // Faint indigo resting connections
                            ctx.strokeStyle = `rgba(99, 102, 241, ${lineOpacity * 0.15})`;
                            ctx.lineWidth = 0.6;
                            ctx.shadowBlur = 0;
                        }
                        
                        ctx.stroke();
                    }
                }
            });

            animationFrameId = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas 
            ref={canvasRef}
            className="fixed top-0 left-0 w-full h-full pointer-events-none z-0"
        />
    );
}
