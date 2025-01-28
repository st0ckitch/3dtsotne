import Cell from '../components/Cell.js';
import { BOARD_CONFIG } from '../utils/constants.js';

export default class Board {
    constructor(scene) {
        this.scene = scene;
        this.cells = [];
        this.createBoard();
    }

    createBoard() {
        const pathPoints = this.generatePath();
        pathPoints.forEach((point, index) => {
            const cell = new Cell(point.x, point.y, point.z, index);
            this.cells.push(cell);
            this.scene.add(cell.mesh);
        });

        // Add goblins to random cells (excluding start and end)
        this.addGoblins();
    }

    generatePath() {
        // Generate a chaotic path of 50 hexagonal cells
        const points = [];
        let currentPos = new THREE.Vector3(0, 0, 0);
        
        for (let i = 0; i < 50; i++) {
            points.push(currentPos.clone());
            
            // Random direction for next cell
            const angle = Math.random() * Math.PI * 2;
            const distance = 2; // Distance between cells
            currentPos.x += Math.cos(angle) * distance;
            currentPos.z += Math.sin(angle) * distance;
        }
        
        return points;
    }

    addGoblins() {
        const availableCells = this.cells.slice(1, -1);
        for (let i = 0; i < 7; i++) {
            const randomIndex = Math.floor(Math.random() * availableCells.length);
            const cell = availableCells[randomIndex];
            cell.addGoblin();
            availableCells.splice(randomIndex, 1);
        }
    }

    getCellAt(index) {
        return this.cells[index];
    }
}
