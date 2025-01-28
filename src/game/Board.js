import * as THREE from 'three';

export default class Board {
    constructor(scene) {
        this.scene = scene;
        this.cells = [];
        this.createBoard();
    }

    createBoard() {
        // Create a 7x7 grid of hexagonal cells
        const cellSize = 2;
        const verticalSpacing = cellSize * 1.732; // √3
        const horizontalSpacing = cellSize * 1.5;

        for (let row = -3; row <= 3; row++) {
            const offset = Math.floor(Math.abs(row) / 2);
            for (let col = -3 + offset; col <= 3 - offset; col++) {
                const x = col * horizontalSpacing + (row % 2) * (horizontalSpacing / 2);
                const z = row * verticalSpacing;
                
                this.createCell(x, z, this.cells.length);
            }
        }
    }

    createCell(x, z, index) {
        // Create hexagonal cell
        const geometry = new THREE.CylinderGeometry(1, 1, 0.2, 6);
        const material = new THREE.MeshStandardMaterial({
            color: index === 0 ? 0x00ff00 : index === this.cells.length - 1 ? 0xff0000 : 0x808080,
            metalness: 0.3,
            roughness: 0.7
        });

        const cell = new THREE.Mesh(geometry, material);
        cell.position.set(x, 0, z);
        cell.receiveShadow = true;
        cell.castShadow = true;
        
        // Store reference and add to scene
        this.cells.push(cell);
        this.scene.add(cell);
    }

    getCellAt(index) {
        return this.cells[index];
    }
}
