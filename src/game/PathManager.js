import * as THREE from 'three';

export default class PathManager {
    constructor(scene) {
        this.scene = scene;
        this.pathMeshes = [];
    }

    createPath(cells) {
        // Clear any existing path
        this.clearPath();

        // Create connections between adjacent cells
        for (let i = 0; i < cells.length - 1; i++) {
            const startPos = cells[i].position;
            const endPos = cells[i + 1].position;
            
            // Create a curved path between cells
            const curve = new THREE.CatmullRomCurve3([
                new THREE.Vector3(startPos.x, 0.1, startPos.z),
                new THREE.Vector3(endPos.x, 0.1, endPos.z)
            ]);

            const geometry = new THREE.TubeGeometry(curve, 8, 0.2, 8, false);
            const material = new THREE.MeshStandardMaterial({
                color: 0xbb9b65,
                metalness: 0.3,
                roughness: 0.7,
                emissive: 0x331100,
                emissiveIntensity: 0.2
            });

            const pathMesh = new THREE.Mesh(geometry, material);
            pathMesh.receiveShadow = true;
            pathMesh.castShadow = true;

            this.pathMeshes.push(pathMesh);
            this.scene.add(pathMesh);
        }
    }

    clearPath() {
        this.pathMeshes.forEach(mesh => {
            this.scene.remove(mesh);
            mesh.geometry.dispose();
            mesh.material.dispose();
        });
        this.pathMeshes = [];
    }
}
