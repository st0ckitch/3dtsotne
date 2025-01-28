import * as THREE from 'three';
import Cell from '../components/Cell.js';
import { BOARD_CONFIG } from '../utils/constants.js';
import { generateDungeonPath } from '../utils/helpers.js';

export default class Board {
    constructor(scene) {
        this.scene = scene;
        this.cells = [];
    }

    createBoard() {
        // Generate path points
        const pathPoints = generateDungeonPath(BOARD_CONFIG.TOTAL_CELLS);
        
        // Create cells along the path
        pathPoints.forEach((point, index) => {
            const cell = new Cell(point.x, 0, point.z, index);
            this.cells.push(cell);
            this.scene.add(cell.mesh);
        });
        
        // Add connecting paths between cells
        this.createPaths();
        
        // Add goblins to random cells (excluding start and end)
        this.addGoblins();
    }

    createPaths() {
        for (let i = 0; i < this.cells.length - 1; i++) {
            const start = this.cells[i].mesh.position;
            const end = this.cells[i + 1].mesh.position;
            
            const pathGeometry = new THREE.TubeGeometry(
                new THREE.LineCurve3(
                    new THREE.Vector3(start.x, 0.1, start.z),
                    new THREE.Vector3(end.x, 0.1, end.z)
                ),
                1,
                0.2,
                8,
                false
            );
            
            const pathMaterial = new THREE.MeshPhongMaterial({
                color: 0x4a3821,
                metalness: 0.3,
                roughness: 0.7
            });
            
            const pathMesh = new THREE.Mesh(pathGeometry, pathMaterial);
            pathMesh.receiveShadow = true;
            this.scene.add(pathMesh);
        }
    }

    addGoblins() {
        // Get available cells (excluding start and end)
        const availableCells = this.cells.slice(1, -1);
        const goblinPositions = [];
        
        // Add goblins to random positions
        for (let i = 0; i < BOARD_CONFIG.GOBLIN_COUNT; i++) {
            const randomIndex = Math.floor(Math.random() * availableCells.length);
            const cell = availableCells[randomIndex];
            
            cell.addGoblin();
            goblinPositions.push(cell.index);
            
            // Remove used cell from available cells
            availableCells.splice(randomIndex, 1);
        }
        
        console.log('Goblin positions:', goblinPositions);
    }
}
