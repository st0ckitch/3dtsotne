import * as THREE from 'three';
import Cell from '../components/Cell.js';
import { BOARD_CONFIG } from '../utils/constants.js';

export default class Board {
    constructor(scene) {
        this.scene = scene;
        this.cells = [];
        this.pathCells = [];
        this.createBoard();
    }

    createBoard() {
        // Create a large hexagonal grid
        const gridRadius = 6; // Radius of the grid in cells
        const cellSize = 2.5; // Size of each cell
        const cells = this.generateHexGrid(gridRadius, cellSize);
        
        // Create all cells first
        cells.forEach((position, index) => {
            const cell = new Cell(position.x, 0, position.z, index, true);
            this.cells.push(cell);
            this.scene.add(cell.mesh);
        });

        // Generate the game path through the cells
        this.generatePath();
        
        // Add goblins to path cells
        this.addGoblins();
        
        // Create connecting paths between cells
        this.createPaths();
    }

    generateHexGrid(radius, size) {
        const positions = [];
        const sqrt3 = Math.sqrt(3);

        for (let q = -radius; q <= radius; q++) {
            const r1 = Math.max(-radius, -q - radius);
            const r2 = Math.min(radius, -q + radius);
            
            for (let r = r1; r <= r2; r++) {
                const x = size * (3/2 * q);
                const z = size * (sqrt3/2 * q + sqrt3 * r);
                positions.push({ x, z });
            }
        }

        return positions;
    }

    generatePath() {
        // Select cells for the game path
        const pathLength = BOARD_CONFIG.TOTAL_CELLS;
        let currentCell = this.cells[Math.floor(this.cells.length / 2)]; // Start from center
        
        this.pathCells.push(currentCell);
        currentCell.setAsPath(0);

        for (let i = 1; i < pathLength; i++) {
            // Find nearest unassigned cell
            const nextCell = this.findNearestUnassignedCell(currentCell);
            if (!nextCell) break;
            
            this.pathCells.push(nextCell);
            nextCell.setAsPath(i);
            currentCell = nextCell;
        }
    }

    findNearestUnassignedCell(currentCell) {
        return this.cells.find(cell => 
            !this.pathCells.includes(cell) &&
            this.isWithinRange(currentCell, cell, 2)
        );
    }

    isWithinRange(cell1, cell2, maxDistance) {
        const dx = cell1.mesh.position.x - cell2.mesh.position.x;
        const dz = cell1.mesh.position.z - cell2.mesh.position.z;
        const distance = Math.sqrt(dx * dx + dz * dz);
        return distance <= maxDistance * BOARD_CONFIG.CELL_SIZE;
    }

    createPaths() {
        for (let i = 0; i < this.pathCells.length - 1; i++) {
            const start = this.pathCells[i].mesh.position;
            const end = this.pathCells[i + 1].mesh.position;
            
            const pathGeometry = new THREE.TubeGeometry(
                new THREE.LineCurve3(
                    new THREE.Vector3(start.x, 0.1, start.z),
                    new THREE.Vector3(end.x, 0.1, end.z)
                ),
                1,
                0.3,
                8,
                false
            );
            
            const pathMaterial = new THREE.MeshStandardMaterial({
                color: 0x4a3821,
                roughness: 0.8,
                metalness: 0.2
            });
            
            const pathMesh = new THREE.Mesh(pathGeometry, pathMaterial);
            pathMesh.receiveShadow = true;
            this.scene.add(pathMesh);
        }
    }

    addGoblins() {
        // Get available path cells (excluding start and end)
        const availableCells = this.pathCells.slice(1, -1);
        const goblinPositions = [];
        
        // Add goblins to random positions
        for (let i = 0; i < BOARD_CONFIG.GOBLIN_COUNT; i++) {
            const randomIndex = Math.floor(Math.random() * availableCells.length);
            const cell = availableCells[randomIndex];
            
            cell.addGoblin();
            goblinPositions.push(cell.index);
            
            availableCells.splice(randomIndex, 1);
        }
        
        console.log('Goblin positions:', goblinPositions);
    }

    getCellAt(index) {
        return this.pathCells[index];
    }

    highlightPossibleMoves(currentPosition, diceRoll) {
        this.pathCells.forEach(cell => cell.highlight(false));
        
        const targetIndex = Math.min(
            currentPosition + diceRoll, 
            BOARD_CONFIG.TOTAL_CELLS - 1
        );
        
        if (targetIndex < this.pathCells.length) {
            this.pathCells[targetIndex].highlight(true);
        }
    }
}
