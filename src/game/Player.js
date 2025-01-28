import * as THREE from 'three';
import { gsap } from 'gsap';

export default class Player {
    constructor(scene, isBot = false) {
        this.scene = scene;
        this.isBot = isBot;
        this.position = 0;
        this.hp = 15;
        this.createModel();
    }

    createModel() {
        // Create a group for the player model
        this.model = new THREE.Group();

        // Create hovering platform
        const baseGeometry = new THREE.CylinderGeometry(0.8, 1, 0.2, 6);
        const baseMaterial = new THREE.MeshStandardMaterial({
            color: this.isBot ? 0xff4444 : 0x4444ff,
            metalness: 0.7,
            roughness: 0.3,
            emissive: this.isBot ? 0xff0000 : 0x0000ff,
            emissiveIntensity: 0.2
        });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        this.model.add(base);

        // Create character body
        const bodyGeometry = new THREE.ConeGeometry(0.5, 1.5, 6);
        const bodyMaterial = new THREE.MeshStandardMaterial({
            color: this.isBot ? 0xff8888 : 0x8888ff,
            metalness: 0.5,
            roughness: 0.5
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 1;
        this.model.add(body);

        // Add glow effect
        const glowGeometry = new THREE.ConeGeometry(0.6, 1.7, 6);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: this.isBot ? 0xff0000 : 0x0000ff,
            transparent: true,
            opacity: 0.3,
            side: THREE.BackSide
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        glow.position.copy(body.position);
        this.model.add(glow);

        // Add particle trail
        this.addParticleTrail();

        // Initial position
        this.model.position.y = 1;
        this.scene.add(this.model);

        // Add hover animation
        this.addHoverAnimation();
    }

    addParticleTrail() {
        const particleCount = 20;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = 0;
            positions[i * 3 + 1] = 0;
            positions[i * 3 + 2] = 0;

            const color = this.isBot ? new THREE.Color(0xff0000) : new THREE.Color(0x0000ff);
            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
            size: 0.1,
            vertexColors: true,
            transparent: true,
            opacity: 0.5,
            blending: THREE.AdditiveBlending
        });

        this.particles = new THREE.Points(geometry, material);
        this.model.add(this.particles);

        // Animate particles
        this.updateParticles();
    }

    updateParticles() {
        if (!this.particles) return;

        const positions = this.particles.geometry.attributes.position.array;
        const count = positions.length / 3;

        for (let i = 0; i < count; i++) {
            positions[i * 3] += (Math.random() - 0.5) * 0.1;
            positions[i * 3 + 1] -= 0.05;
            positions[i * 3 + 2] += (Math.random() - 0.5) * 0.1;

            // Reset particles that fall too low
            if (positions[i * 3 + 1] < -1) {
                positions[i * 3] = 0;
                positions[i * 3 + 1] = 0;
                positions[i * 3 + 2] = 0;
            }
        }

        this.particles.geometry.attributes.position.needsUpdate = true;
        requestAnimationFrame(() => this.updateParticles());
    }

    addHoverAnimation() {
        gsap.to(this.model.position, {
            y: '+=0.3',
            duration: 1,
            yoyo: true,
            repeat: -1,
            ease: "power1.inOut"
        });

        gsap.to(this.model.rotation, {
            y: Math.PI * 2,
            duration: 5,
            repeat: -1,
            ease: "none"
        });
    }

    async moveTo(targetPosition) {
        return new Promise((resolve) => {
            // Create a path arc
            const startPos = this.model.position.clone();
            const midPoint = new THREE.Vector3(
                (startPos.x + targetPosition.x) / 2,
                startPos.y + 3,
                (startPos.z + targetPosition.z) / 2
            );

            // Animate along the path
            gsap.to(this.model.position, {
                duration: 1,
                x: targetPosition.x,
                y: targetPosition.y + 1,
                z: targetPosition.z,
                ease: "power2.inOut",
                onUpdate: () => {
                    // Update particle system position
                    if (this.particles) {
                        this.particles.position.copy(this.model.position);
                    }
                },
                onComplete: resolve
            });

            // Face movement direction
            const angle = Math.atan2(
                targetPosition.z - this.model.position.z,
                targetPosition.x - this.model.position.x
            );
            gsap.to(this.model.rotation, {
                duration: 1,
                y: angle,
                ease: "power2.inOut"
            });
        });
    }

    async takeDamage(amount) {
        this.hp = Math.max(0, this.hp - amount);
        document.getElementById(this.isBot ? 'bot-hp' : 'player-hp').textContent = this.hp;

        // Visual feedback
        return new Promise((resolve) => {
            // Flash red
            const bodyMaterial = this.model.children[1].material;
            const originalColor = bodyMaterial.color.clone();
            
            gsap.to(bodyMaterial.color, {
                r: 1,
                g: 0,
                b: 0,
                duration: 0.2,
                yoyo: true,
                repeat: 1,
                onComplete: () => {
                    bodyMaterial.color.copy(originalColor);
                    resolve();
                }
            });

            // Shake effect
            const originalPosition = this.model.position.clone();
            gsap.to(this.model.position, {
                x: '+=0.2',
                y: '+=0.2',
                duration: 0.1,
                yoyo: true,
                repeat: 3
            });
        });
    }

    getPosition() {
        return this.position;
    }

    reset() {
        this.position = 0;
        this.hp = 15;
        document.getElementById(this.isBot ? 'bot-hp' : 'player-hp').textContent = this.hp;
        
        gsap.to(this.model.position, {
            x: 0,
            y: 1,
            z: 0,
            duration: 0.5,
            ease: "power2.inOut"
        });
    }
}
