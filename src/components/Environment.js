import * as THREE from 'three';

export default class Environment {
    constructor(scene) {
        this.scene = scene;
        this.obstacles = new THREE.Group();
        this.scene.add(this.obstacles);
        
        this.createEnvironment();
        this.createFog();
        this.createTorches();
    }

    createEnvironment() {
        // Create floor
        const floorGeometry = new THREE.PlaneGeometry(100, 100);
        const floorTexture = new THREE.TextureLoader().load('/textures/dungeon-floor.jpg');
        floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
        floorTexture.repeat.set(20, 20);
        
        const floorMaterial = new THREE.MeshStandardMaterial({
            map: floorTexture,
            roughness: 0.8,
            metalness: 0.2
        });
        
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        this.scene.add(floor);

        // Add random obstacles
        this.addRocks();
        this.addTrees();
        this.addPillars();
    }

    createFog() {
        this.scene.fog = new THREE.FogExp2(0x000000, 0.02);
    }

    addRocks() {
        const rockGeometry = new THREE.DodecahedronGeometry(1, 0);
        const rockMaterial = new THREE.MeshStandardMaterial({
            color: 0x666666,
            roughness: 0.9,
            metalness: 0.1
        });

        for (let i = 0; i < 20; i++) {
            const rock = new THREE.Mesh(rockGeometry, rockMaterial);
            rock.scale.set(
                Math.random() * 0.5 + 0.5,
                Math.random() * 0.5 + 0.5,
                Math.random() * 0.5 + 0.5
            );
            
            rock.position.set(
                Math.random() * 80 - 40,
                0,
                Math.random() * 80 - 40
            );
            
            rock.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );
            
            rock.castShadow = true;
            this.obstacles.add(rock);
        }
    }

    addTrees() {
        // Dead trees for dark atmosphere
        const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.3, 4, 6);
        const trunkMaterial = new THREE.MeshStandardMaterial({
            color: 0x4a3525,
            roughness: 1,
            metalness: 0
        });

        const branchGeometry = new THREE.CylinderGeometry(0.1, 0.1, 2, 4);
        const branchMaterial = trunkMaterial.clone();

        for (let i = 0; i < 15; i++) {
            const tree = new THREE.Group();
            
            // Trunk
            const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
            trunk.castShadow = true;
            tree.add(trunk);

            // Add random branches
            for (let j = 0; j < 5; j++) {
                const branch = new THREE.Mesh(branchGeometry, branchMaterial);
                branch.position.y = Math.random() * 2;
                branch.rotation.set(
                    Math.random() * Math.PI / 2,
                    Math.random() * Math.PI * 2,
                    Math.random() * Math.PI / 4
                );
                tree.add(branch);
            }

            tree.position.set(
                Math.random() * 80 - 40,
                0,
                Math.random() * 80 - 40
            );
            
            tree.rotation.y = Math.random() * Math.PI * 2;
            this.obstacles.add(tree);
        }
    }
  
addPillars() {
        const pillarGeometry = new THREE.CylinderGeometry(0.8, 1, 8, 6);
        const pillarMaterial = new THREE.MeshStandardMaterial({
            color: 0x777777,
            roughness: 0.7,
            metalness: 0.3
        });

        for (let i = 0; i < 10; i++) {
            const pillar = new THREE.Mesh(pillarGeometry, pillarMaterial);
            pillar.position.set(
                Math.random() * 80 - 40,
                4,
                Math.random() * 80 - 40
            );
            
            // Add decay and damage to pillars
            const deformGeometry = pillar.geometry.clone();
            const positions = deformGeometry.attributes.position.array;
            
            for (let j = 0; j < positions.length; j += 3) {
                positions[j] += (Math.random() - 0.5) * 0.2;
                positions[j + 1] += (Math.random() - 0.5) * 0.2;
                positions[j + 2] += (Math.random() - 0.5) * 0.2;
            }
            
            pillar.geometry = deformGeometry;
            pillar.castShadow = true;
            pillar.receiveShadow = true;
            this.obstacles.add(pillar);
        }
    }

    createTorches() {
        for (let i = 0; i < 8; i++) {
            const torch = this.createTorch();
            torch.position.set(
                Math.random() * 60 - 30,
                3,
                Math.random() * 60 - 30
            );
            this.obstacles.add(torch);
        }
    }

    createTorch() {
        const torch = new THREE.Group();

        // Torch handle
        const handleGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.5, 8);
        const handleMaterial = new THREE.MeshStandardMaterial({
            color: 0x4a3525,
            roughness: 1
        });
        const handle = new THREE.Mesh(handleGeometry, handleMaterial);
        torch.add(handle);

        // Torch head
        const headGeometry = new THREE.CylinderGeometry(0.2, 0.15, 0.3, 8);
        const headMaterial = new THREE.MeshStandardMaterial({
            color: 0x333333,
            roughness: 1
        });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 0.4;
        torch.add(head);

        // Fire light
        const light = new THREE.PointLight(0xff6600, 1, 10);
        light.position.y = 0.5;
        light.castShadow = true;
        
        // Animate torch light
        this.animateTorchLight(light);
        
        torch.add(light);
        return torch;
    }

    animateTorchLight(light) {
        const flicker = () => {
            const intensity = 1 + Math.random() * 0.2;
            light.intensity = intensity;
            
            const distance = 8 + Math.random() * 2;
            light.distance = distance;
            
            setTimeout(flicker, Math.random() * 100 + 50);
        };
        
        flicker();
    }

    update() {
        // Update any dynamic environment elements
        this.obstacles.children.forEach(obstacle => {
            if (obstacle.isFlickering) {
                obstacle.children.forEach(child => {
                    if (child.isLight) {
                        child.intensity = 1 + Math.random() * 0.2;
                    }
                });
            }
        });
    }
}
