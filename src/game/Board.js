import * as THREE from 'three';
import PathManager from './PathManager.js';

export default class Board {
    constructor(scene) {
        this.scene = scene;
        this.cells = [];
        this.pathCells = [];
        this.pathManager = new PathManager(scene);
        
        this.createBoard();
        this.generatePath();
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
            color: 0x808080,
            metalness: 0.3,
            roughness: 0.7
        });

        const cell = new THREE.Mesh(geometry, material);
        cell.position.set(x, 0, z);
        cell.receiveShadow = true;
        cell.castShadow = true;
        cell.userData.index = index;
        
        this.cells.push(cell);
        this.scene.add(cell);
    }

    generatePath() {
        // Select cells for the path
        const startCell = this.cells[0];
        startCell.material.color.setHex(0x00ff00);
        this.pathCells.push(startCell);

        let currentCell = startCell;
        const targetCellCount = 10; // Adjust this number for longer/shorter paths

        while (this.pathCells.length < targetCellCount) {
            const neighbors = this.getNeighborCells(currentCell);
            const availableNeighbors = neighbors.filter(cell => 
                !this.pathCells.includes(cell)
            );

            if (availableNeighbors.length === 0) break;

            // Choose random neighbor
            const nextCell = availableNeighbors[
                Math.floor(Math.random() * availableNeighbors.length)
            ];

            this.pathCells.push(nextCell);
            currentCell = nextCell;
        }

        // Mark end cell
        const endCell = this.pathCells[this.pathCells.length - 1];
        endCell.material.color.setHex(0xff0000);

        // Create visual path
        this.pathManager.createPath(this.pathCells);
    }

    getNeighborCells(cell) {
        const neighbors = [];
        const maxDistance = 3; // Adjust this for path spacing

        this.cells.forEach(otherCell => {
            if (cell === otherCell) return;

            const dx = otherCell.position.x - cell.position.x;
            const dz = otherCell.position.z - cell.position.z;
            const distance = Math.sqrt(dx * dx + dz * dz);

            if (distance < maxDistance) {
                neighbors.push(otherCell);
            }
        });

        return neighbors;
    }

    getCellAt(index) {
        return this.pathCells[index];
    }

    highlightCell(cell, highlight = true) {
        if (highlight) {
            cell.material.emissive.setHex(0x666666);
            cell.material.emissiveIntensity = 0.5;
        } else {
            cell.material.emissive.setHex(0x000000);
            cell.material.emissiveIntensity = 0;
        }
    }
}
