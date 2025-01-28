import * as THREE from 'three';

export default class PathManager {
    constructor(scene) {
        this.scene = scene;
        this.pathMeshes = [];
        console.log('PathManager initialized');
    }

    createPath(cells) {
        console.log('Creating path with cells:', cells.length);
        
        // Clear any existing path
        this.clearPath();

        // Create connections between adjacent cells
        for (let i = 0; i < cells.length - 1; i++) {
            console.log(`Creating path segment ${i}`);
            const startPos = cells[i].position;
            const endPos = cells[i + 1].position;
            
            // Create a brighter, more visible path
            const curve = new THREE.CatmullRomCurve3([
                new THREE.Vector3(startPos.x, 0.3, startPos.z),  // Raised slightly higher
                new THREE.Vector3(endPos.x, 0.3, endPos.z)
            ]);

            const geometry = new THREE.TubeGeometry(curve, 8, 0.3, 8, false);
            const material = new THREE.MeshStandardMaterial({
                color: 0xd4af37,  // Golden color
                metalness: 0.7,
                roughness: 0.3,
                emissive: 0xd4af37,
                emissiveIntensity: 0.5  // Increased glow
            });

            const pathMesh = new THREE.Mesh(geometry, material);
            pathMesh.receiveShadow = true;
            pathMesh.castShadow = true;

            this.pathMeshes.push(pathMesh);
            this.scene.add(pathMesh);
        }
    }

    clearPath() {
        console.log('Clearing existing path');
        this.pathMeshes.forEach(mesh => {
            this.scene.remove(mesh);
            mesh.geometry.dispose();
            mesh.material.dispose();
        });
        this.pathMeshes = [];
    }
}
