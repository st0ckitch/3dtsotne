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

        // Base - floating platform
        const baseGeometry = new THREE.CylinderGeometry(0.6, 0.4, 0.2, 6);
        const baseMaterial = new THREE.MeshStandardMaterial({
            color: this.isBot ? 0xff4444 : 0x4444ff,
            metalness: 0.7,
            roughness: 0.3,
            emissive: this.isBot ? 0xff0000 : 0x0000ff,
            emissiveIntensity: 0.2
        });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        this.model.add(base);

        // Character body
        const bodyGeometry = new THREE.ConeGeometry(0.3, 1, 6);
        const bodyMaterial = new THREE.MeshStandardMaterial({
            color: this.isBot ? 0xff8888 : 0x8888ff,
            metalness: 0.5,
            roughness: 0.5
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.7;
        this.model.add(body);

        // Add glow effect
        const glowGeometry = new THREE.ConeGeometry(0.4, 1.2, 6);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: this.isBot ? 0xff0000 : 0x0000ff,
            transparent: true,
            opacity: 0.3,
            side: THREE.BackSide
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        glow.position.copy(body.position);
        this.model.add(glow);

        // Position the model and add to scene
        this.model.position.y = 1;
        this.scene.add(this.model);

        // Add hovering animation
        this.addHoverAnimation();
    }

    addHoverAnimation() {
        gsap.to(this.model.position, {
            y: '+=0.2',
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

    moveTo(targetCell) {
        const targetPos = targetCell.position;
        
        // Create animation
        gsap.to(this.model.position, {
            x: targetPos.x,
            z: targetPos.z,
            duration: 1,
            ease: "power2.inOut",
            onComplete: () => {
                this.position = targetCell.userData.index;
                this.checkForGoblin(targetCell);
            }
        });
    }

    takeDamage(amount) {
        this.hp = Math.max(0, this.hp - amount);
        
        // Update UI
        const element = this.isBot ? 'bot-hp' : 'player-hp';
        document.getElementById(element).textContent = this.hp;

        // Visual feedback
        gsap.to(this.model.scale, {
            x: 0.5,
            y: 0.5,
            z: 0.5,
            duration: 0.1,
            yoyo: true,
            repeat: 1
        });

        // Flash red
        const bodyMaterial = this.model.children[1].material;
        const originalColor = bodyMaterial.color.getHex();
        bodyMaterial.color.setHex(0xff0000);
        
        gsap.delayedCall(0.3, () => {
            bodyMaterial.color.setHex(originalColor);
        });
    }

    checkForGoblin(cell) {
        if (cell.hasGoblin) {
            const damage = Math.floor(Math.random() * 3) + 1;
            this.takeDamage(damage);
        }
    }

    getPosition() {
        return this.position;
    }

    reset() {
        this.position = 0;
        this.hp = 15;
        document.getElementById(this.isBot ? 'bot-hp' : 'player-hp').textContent = this.hp;
        
        // Return to start position
        gsap.to(this.model.position, {
            x: 0,
            z: 0,
            duration: 0.5,
            ease: "power2.inOut"
        });
    }
}
