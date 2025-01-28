import * as THREE from 'three';

export default class PathManager {
    constructor(scene) {
        this.scene = scene;
        this.pathMeshes = [];
        console.log('PathManager initialized');
    }

    createPath(cells) {
        console.log(`Creating path with cells: ${cells.length}`);
        this.clearPath();

        // Create connections between adjacent cells
        for (let i = 0; i < cells.length - 1; i++) {
            console.log(`Creating path segment ${i}`);
            const startPos = cells[i].position;
            const endPos = cells[i + 1].position;
            
            // Create main path tube
            const points = [];
            points.push(new THREE.Vector3(startPos.x, 0.5, startPos.z));
            points.push(new THREE.Vector3(endPos.x, 0.5, endPos.z));

            const curve = new THREE.CatmullRomCurve3(points);
            const geometry = new THREE.TubeGeometry(curve, 8, 0.4, 8, false);
            const material = new THREE.MeshStandardMaterial({
                color: 0xffd700,  // Brighter gold color
                metalness: 0.8,
                roughness: 0.2,
                emissive: 0xffd700,
                emissiveIntensity: 0.5
            });

            const pathMesh = new THREE.Mesh(geometry, material);
            pathMesh.castShadow = true;
            pathMesh.receiveShadow = true;

            // Add glow effect
            const glowGeometry = new THREE.TubeGeometry(curve, 8, 0.6, 8, false);
            const glowMaterial = new THREE.MeshBasicMaterial({
                color: 0xffd700,
                transparent: true,
                opacity: 0.3,
                side: THREE.DoubleSide
            });

            const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);

            this.pathMeshes.push(pathMesh);
            this.pathMeshes.push(glowMesh);
            this.scene.add(pathMesh);
            this.scene.add(glowMesh);

            // Add connecting dots at intersections
            const sphereGeometry = new THREE.SphereGeometry(0.3, 16, 16);
            const sphereMaterial = new THREE.MeshStandardMaterial({
                color: 0xffd700,
                metalness: 0.8,
                roughness: 0.2,
                emissive: 0xffd700,
                emissiveIntensity: 0.5
            });

            const startSphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
            startSphere.position.copy(new THREE.Vector3(startPos.x, 0.5, startPos.z));
            this.pathMeshes.push(startSphere);
            this.scene.add(startSphere);

            if (i === cells.length - 2) {
                const endSphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
                endSphere.position.copy(new THREE.Vector3(endPos.x, 0.5, endPos.z));
                this.pathMeshes.push(endSphere);
                this.scene.add(endSphere);
            }
        }
    }

    clearPath() {
        console.log('Clearing existing path');
        this.pathMeshes.forEach(mesh => {
            this.scene.remove(mesh);
            if (mesh.geometry) mesh.geometry.dispose();
            if (mesh.material) mesh.material.dispose();
        });
        this.pathMeshes = [];
    }
}
