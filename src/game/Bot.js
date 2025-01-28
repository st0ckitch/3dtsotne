import * as THREE from 'three';
import { gsap } from 'gsap';
import { BOARD_CONFIG } from '../utils/constants.js';

export default class Bot {
    constructor(scene) {
        this.scene = scene;
        this.position = 0;
        this.hp = BOARD_CONFIG.STARTING_HP;
        this.createModel();
        this.updateHPDisplay();
    }

    createModel() {
        // Create bot character model - different shape from player
        const geometry = new THREE.OctahedronGeometry(0.6);
        const material = new THREE.MeshPhongMaterial({
            color: 0xff4444,
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
            g: 1,
            b: 0,
            duration: 0.2,
            yoyo: true,
            repeat: 1,
            onComplete: () => {
                this.mesh.material.color.setHex(0xff4444);
            }
        });
    }

    updateHPDisplay() {
        document.getElementById('bot-hp').textContent = this.hp;
    }

    calculateBestMove(diceRoll) {
        // Simple AI: Avoid goblins if possible
        const possiblePosition = this.position + diceRoll;
        const targetCell = this.scene.getObjectByName(`cell-${possiblePosition}`);
        
        if (targetCell && targetCell.hasGoblin && this.hp <= 3) {
            // Try to move fewer steps if low on health and goblin ahead
            return Math.floor(diceRoll / 2);
        }
        
        return diceRoll;
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
