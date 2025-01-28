import * as THREE from 'three';

export default class Cell {
    constructor(x, y, z, index) {
        this.index = index;
        this.hasGoblin = false;
        this.createMesh(x, y, z);
    }

    createMesh(x, y, z) {
        // Create hexagonal shape
        const geometry = new THREE.CylinderGeometry(1, 1, 0.2, 6);
        const material = new THREE.MeshPhongMaterial({
            color: this.index === 49 ? 0x00ff00 : 0x666666,
            shininess: 30,
            specular: 0x444444
        });

        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.set(x, y, z);
        this.mesh.receiveShadow = true;
        
        // Set name for easy reference
        this.mesh.name = `cell-${this.index}`;
    }

    addGoblin() {
        this.hasGoblin = true;
        // Visual indicator for goblin presence
        const indicatorGeometry = new THREE.SphereGeometry(0.3);
        const indicatorMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xff0000,
            emissive: 0xff0000,
            emissiveIntensity: 0.2,
            shininess: 30
        });
        
        const indicator = new THREE.Mesh(indicatorGeometry, indicatorMaterial);
        indicator.position.y = 0.5;
        this.mesh.add(indicator);
    }

    highlight(active = true) {
        if (active) {
            this.mesh.material.emissive = new THREE.Color(0x666666);
            this.mesh.material.emissiveIntensity = 0.3;
        } else {
            this.mesh.material.emissive = new THREE.Color(0x000000);
            this.mesh.material.emissiveIntensity = 0;
        }
    }

    getPosition() {
        return this.mesh.position;
    }
}
