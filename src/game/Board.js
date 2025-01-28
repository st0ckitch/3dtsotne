import * as THREE from 'three';

export default class Board {
    constructor(scene) {
        this.scene = scene;
        this.cells = [];
        this.pathCells = [];
        this.cellSize = 4; // Increased cell size for better spacing
        this.gridRadius = 12; // Increased radius for more cells
        this.visibleRadius = 20; // Visibility radius for fog of war
        
        // Initialize board
        this.createBoard();
        this.createFogOfWar();
    }

    createBoard() {
        // Generate hex grid positions
        const positions = this.generateHexGrid();
        
        // Create cells
        positions.forEach((pos, index) => {
            const cell = this.createCell(pos.x, pos.y, pos.z, index);
            this.cells.push(cell);
            this.scene.add(cell);
            cell.visible = false; // Initially hide all cells
        });

        // Generate game path
        this.generatePath();
    }

    generateHexGrid() {
        const positions = [];
        const sqrt3 = Math.sqrt(3);

        // Create hexagonal grid
        for (let q = -this.gridRadius; q <= this.gridRadius; q++) {
            for (let r = -this.gridRadius; r <= this.gridRadius; r++) {
                // Skip positions outside hexagonal shape
                if (Math.abs(q + r) > this.gridRadius) continue;
                
                // Convert hex coordinates to world coordinates
                const x = this.cellSize * (3/2 * q);
                const z = this.cellSize * (sqrt3/2 * q + sqrt3 * r);
                
                positions.push({ x, y: 0, z });
            }
        }

        return positions;
    }

    createCell(x, y, z, index) {
        // Create hexagonal cell geometry
        const geometry = new THREE.CylinderGeometry(this.cellSize/2, this.cellSize/2, 0.2, 6);
        const material = new THREE.MeshStandardMaterial({
            color: 0x808080,
            roughness: 0.7,
            metalness: 0.3,
            transparent: true,
            opacity: 0.9
        });

        const cell = new THREE.Mesh(geometry, material);
        cell.position.set(x, y, z);
        cell.receiveShadow = true;
        cell.castShadow = true;
        cell.userData.index = index;
        cell.userData.isPath = false;

        return cell;
    }

    generatePath() {
        const startCell = this.getRandomEdgeCell();
        const endCell = this.getRandomEdgeCell(startCell);
        
        this.pathCells = this.findPath(startCell, endCell);
        
        // Mark path cells
        this.pathCells.forEach((cell, index) => {
            cell.userData.isPath = true;
            cell.userData.pathIndex = index;
            
            if (index === 0) {
                cell.material.color.setHex(0x00ff00); // Start cell
            } else if (index === this.pathCells.length - 1) {
                cell.material.color.setHex(0xff0000); // End cell
            } else {
                cell.material.color.setHex(0x808080); // Path cell
            }
        });

        // Add goblins
        this.addGoblins();
    }

    getRandomEdgeCell(excludeCell = null) {
        const edgeCells = this.cells.filter(cell => {
            if (cell === excludeCell) return false;
            const distance = Math.sqrt(
                cell.position.x * cell.position.x + 
                cell.position.z * cell.position.z
            );
            return distance > this.gridRadius * this.cellSize * 0.7;
        });
        return edgeCells[Math.floor(Math.random() * edgeCells.length)];
    }

    findPath(startCell, endCell) {
        // A* pathfinding implementation
        const openSet = [startCell];
        const closedSet = new Set();
        const cameFrom = new Map();
        const gScore = new Map();
        const fScore = new Map();

        gScore.set(startCell, 0);
        fScore.set(startCell, this.heuristic(startCell, endCell));

        while (openSet.length > 0) {
            const current = this.getLowestFScore(openSet, fScore);
            if (current === endCell) {
                return this.reconstructPath(cameFrom, current);
            }

            openSet.splice(openSet.indexOf(current), 1);
            closedSet.add(current);

            const neighbors = this.getNeighbors(current);
            for (const neighbor of neighbors) {
                if (closedSet.has(neighbor)) continue;

                const tentativeGScore = gScore.get(current) + 1;
                if (!openSet.includes(neighbor)) {
                    openSet.push(neighbor);
                } else if (tentativeGScore >= gScore.get(neighbor)) {
                    continue;
                }

                cameFrom.set(neighbor, current);
                gScore.set(neighbor, tentativeGScore);
                fScore.set(neighbor, gScore.get(neighbor) + this.heuristic(neighbor, endCell));
            }
        }

        return [];
    }

    heuristic(cell1, cell2) {
        return Math.sqrt(
            Math.pow(cell1.position.x - cell2.position.x, 2) +
            Math.pow(cell1.position.z - cell2.position.z, 2)
        );
    }

    getLowestFScore(openSet, fScore) {
        let lowest = openSet[0];
        for (const cell of openSet) {
            if (fScore.get(cell) < fScore.get(lowest)) {
                lowest = cell;
            }
        }
        return lowest;
    }

    getNeighbors(cell) {
        return this.cells.filter(other => {
            if (other === cell) return false;
            const distance = this.heuristic(cell, other);
            return distance <= this.cellSize * 2;
        });
    }

    reconstructPath(cameFrom, current) {
        const path = [current];
        while (cameFrom.has(current)) {
            current = cameFrom.get(current);
            path.unshift(current);
        }
        return path;
    }

    addGoblins() {
        // Add goblins to random path cells (excluding start and end)
        const availableCells = this.pathCells.slice(1, -1);
        for (let i = 0; i < 7; i++) {
            const randomIndex = Math.floor(Math.random() * availableCells.length);
            const cell = availableCells[randomIndex];
            cell.hasGoblin = true;
            
            // Add visual indicator for goblin
            const indicator = this.createGoblinIndicator();
            indicator.position.copy(cell.position);
            indicator.position.y += 0.5;
            this.scene.add(indicator);
            
            availableCells.splice(randomIndex, 1);
        }
    }

    createGoblinIndicator() {
        const geometry = new THREE.SphereGeometry(0.3, 8, 8);
        const material = new THREE.MeshStandardMaterial({
            color: 0xff0000,
            emissive: 0xff0000,
            emissiveIntensity: 0.5
        });
        const indicator = new THREE.Mesh(geometry, material);
        indicator.castShadow = true;
        return indicator;
    }

    createFogOfWar() {
        // Create fog of war shader material
        const fogMaterial = new THREE.ShaderMaterial({
            uniforms: {
                playerPos: { value: new THREE.Vector3() },
                visibleRadius: { value: this.visibleRadius },
                fogColor: { value: new THREE.Color(0x000000) }
            },
            vertexShader: `
                varying vec2 vUv;
                varying vec3 vPosition;
                
                void main() {
                    vUv = uv;
                    vPosition = position;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 playerPos;
                uniform float visibleRadius;
                uniform vec3 fogColor;
                varying vec2 vUv;
                varying vec3 vPosition;
                
                void main() {
                    float dist = length(vPosition.xz - playerPos.xz);
                    float alpha = smoothstep(visibleRadius - 5.0, visibleRadius + 5.0, dist);
                    gl_FragColor = vec4(fogColor, alpha);
                }
            `,
            transparent: true,
            side: THREE.DoubleSide
        });

        // Create fog plane
        const fogGeometry = new THREE.PlaneGeometry(200, 200, 100, 100);
        this.fogOfWar = new THREE.Mesh(fogGeometry, fogMaterial);
        this.fogOfWar.rotation.x = -Math.PI / 2;
        this.fogOfWar.position.y = 0.1;
        this.scene.add(this.fogOfWar);
    }

    updateFogOfWar(playerPosition) {
        // Update fog of war position
        if (this.fogOfWar && this.fogOfWar.material.uniforms) {
            this.fogOfWar.material.uniforms.playerPos.value.copy(playerPosition);
        }

        // Update cell visibility based on distance from player
        this.cells.forEach(cell => {
            const distance = playerPosition.distanceTo(cell.position);
            cell.visible = distance <= this.visibleRadius;
            
            if (cell.visible) {
                // Fade in cells as they become visible
                cell.material.opacity = Math.max(0, Math.min(1, 
                    1 - (distance / this.visibleRadius)
                ));
            }
        });
    }

    highlightPath(fromIndex, toIndex) {
        this.pathCells.forEach((cell, index) => {
            if (index >= fromIndex && index <= toIndex) {
                gsap.to(cell.material, {
                    emissive: new THREE.Color(0x666666),
                    emissiveIntensity: 0.5,
                    duration: 0.5
                });
            } else {
                gsap.to(cell.material, {
                    emissive: new THREE.Color(0x000000),
                    emissiveIntensity: 0,
                    duration: 0.5
                });
            }
        });
    }

    getCellAt(index) {
        return this.pathCells[index] || null;
    }
}
