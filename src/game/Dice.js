import * as THREE from 'three';
import { gsap } from 'gsap';

export default class Dice {
    constructor(scene) {
        this.scene = scene;
        this.isRolling = false;
        this.createDice();
    }

    createDice() {
        // Create a 3D dice model
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshPhongMaterial({
            color: 0xeeeeee,
            metalness: 0.3,
            roughness: 0.7
        });
        
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.castShadow = true;
        this.mesh.position.set(5, 2, 5); // Position dice off to the side
        this.scene.add(this.mesh);

        // Add pip geometries for numbers
        this.createPips();
    }

    createPips() {
        // Create black dots for each face
        const pipGeometry = new THREE.CircleGeometry(0.1, 32);
        const pipMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });

        this.pips = [];
        
        // Create pips for each face (1-6)
        for (let i = 1; i <= 6; i++) {
            const face = new THREE.Group();
            
            // Position pips based on dice number
            switch(i) {
                case 1:
                    this.addPip(face, 0, 0, pipGeometry, pipMaterial);
                    break;
                case 2:
                    this.addPip(face, -0.2, -0.2, pipGeometry, pipMaterial);
                    this.addPip(face, 0.2, 0.2, pipGeometry, pipMaterial);
                    break;
                // Add cases 3-6 with appropriate pip positions
                // ...
            }
            
            this.pips.push(face);
            this.mesh.add(face);
        }
    }

    addPip(face, x, y, geometry, material) {
        const pip = new THREE.Mesh(geometry, material);
        pip.position.set(x, y, 0.51); // Slightly above face
        face.add(pip);
    }

    async roll() {
        if (this.isRolling) return;
        this.isRolling = true;

        // Random rotations
        const rotations = {
            x: Math.random() * Math.PI * 4,
            y: Math.random() * Math.PI * 4,
            z: Math.random() * Math.PI * 4
        };

        return new Promise((resolve) => {
            gsap.to(this.mesh.rotation, {
                x: rotations.x,
                y: rotations.y,
                z: rotations.z,
                duration: 1,
                ease: "power2.inOut",
                onComplete: () => {
                    this.isRolling = false;
                    // Calculate result based on final rotation
                    const result = this.calculateResult();
                    resolve(result);
                }
            });
        });
    }

    calculateResult() {
        // Simple random for now - in a full implementation, 
        // would calculate based on actual dice rotation
        return Math.floor(Math.random() * 6) + 1;
    }
}
