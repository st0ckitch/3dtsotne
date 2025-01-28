import * as THREE from 'three';
import PathManager from './PathManager.js';

export default class Board {
    constructor(scene) {
        this.scene = scene;
        this.cells = [];
        this.pathCells = [];
        this.pathManager = new PathManager(scene);
        
        this.createBoard();
        this.generateGamePath();
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

        return cell;
    }

    generateGamePath() {
        // Start with a random edge cell for the beginning
        const startCell = this.cells[0];
        startCell.material.color.setHex(0x00ff00);
        this.pathCells.push(startCell);

        let currentCell = startCell;
        const pathLength = 10; // Fixed path length

        // Generate path
        while (this.pathCells.length < pathLength) {
            const neighbors = this.getValidNeighbors(currentCell);
            if (neighbors.length === 0) break;

            // Choose random valid neighbor
            const nextCell = neighbors[Math.floor(Math.random() * neighbors.length)];
            this.pathCells.push(nextCell);
            currentCell = nextCell;
        }

        // Mark the end cell
        if (this.pathCells.length > 1) {
            const endCell = this.pathCells[this.pathCells.length - 1];
            endCell.material.color.setHex(0xff0000);
        }

        // Create the visual path
        console.log('Generating path with cells:', this.pathCells.length);
        this.pathManager.createPath(this.pathCells);
    }

    getValidNeighbors(cell) {
        const neighbors = [];
        const maxDistance = 4; // Maximum distance between connected cells

        for (const otherCell of this.cells) {
            if (cell === otherCell || this.pathCells.includes(otherCell)) continue;

            const dx = otherCell.position.x - cell.position.x;
            const dz = otherCell.position.z - cell.position.z;
            const distance = Math.sqrt(dx * dx + dz * dz);

            if (distance <= maxDistance) {
                neighbors.push(otherCell);
            }
        }

        // Sort by distance to prefer closer cells
        neighbors.sort((a, b) => {
            const distA = Math.sqrt(
                Math.pow(a.position.x - cell.position.x, 2) +
                Math.pow(a.position.z - cell.position.z, 2)
            );
            const distB = Math.sqrt(
                Math.pow(b.position.x - cell.position.x, 2) +
                Math.pow(b.position.z - cell.position.z, 2)
            );
            return distA - distB;
        });

        return neighbors.slice(0, 3); // Limit to closest 3 neighbors
    }

    getCellAt(index) {
        return this.pathCells[index];
    }

    highlightCell(cell, highlight = true) {
        if (!cell) return;
        
        if (highlight) {
            cell.material.emissive.setHex(0x666666);
            cell.material.emissiveIntensity = 0.5;
        } else {
            cell.material.emissive.setHex(0x000000);
            cell.material.emissiveIntensity = 0;
        }
    }
}
