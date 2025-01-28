import * as THREE from 'three';
import { gsap } from 'gsap';
import { BOARD_CONFIG } from '../utils/constants.js';

export default class Player {
    constructor(scene) {
        this.scene = scene;
        this.position = 0; // Start position
        this.hp = BOARD_CONFIG.STARTING_HP;
        this.createModel();
        this.updateHPDisplay();
    }

    createModel() {
        // Create player character model
        const geometry = new THREE.ConeGeometry(0.5, 1.5, 4);
        const material = new THREE.MeshPhongMaterial({
            color: 0x4444ff,
            metalness: 0.7,
            roughness: 0.3
        });
        
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.castShadow = true;
        this.mesh.position.y = 1;
        this.scene.add(this.mesh);
    }

    move(steps) {
        const newPosition = Math.min(this.position + steps, BOARD_CONFIG.TOTAL_CELLS - 1);
        const targetCell = this.scene.getObjectByName(`cell-${newPosition}`);
        
        if (targetCell) {
            gsap.to(this.mesh.position, {
                x: targetCell.position.x,
                z: targetCell.position.z,
                duration: 1,
                ease: "power2.inOut"
            });
            
            this.position = newPosition;
        }
    }

    takeDamage(amount) {
        this.hp = Math.max(0, this.hp - amount);
        this.updateHPDisplay();
        
        // Visual feedback
        gsap.to(this.mesh.material.color, {
            r: 1,
            g: 0,
            b: 0,
            duration: 0.2,
            yoyo: true,
            repeat: 1,
            onComplete: () => {
                this.mesh.material.color.setHex(0x4444ff);
            }
        });
    }

    updateHPDisplay() {
        document.getElementById('player-hp').textContent = this.hp;
    }

    reset() {
        this.position = 0;
        this.hp = BOARD_CONFIG.STARTING_HP;
        this.updateHPDisplay();
        
        const startCell = this.scene.getObjectByName('cell-0');
        if (startCell) {
            this.mesh.position.x = startCell.position.x;
            this.mesh.position.z = startCell.position.z;
        }
    }
}
