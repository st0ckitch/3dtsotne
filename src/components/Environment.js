import * as THREE from 'three';

export default class Environment {
    constructor(scene) {
        this.scene = scene;
        this.obstacles = new THREE.Group();
        this.scene.add(this.obstacles);
        
        this.createEnvironment();
        this.setupLighting();
    }

    createEnvironment() {
        // Create floor
        const floorGeometry = new THREE.PlaneGeometry(100, 100);
        const floorMaterial = new THREE.MeshStandardMaterial({
            color: 0x2a1810,
            roughness: 0.8,
            metalness: 0.2
        });
        
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        this.scene.add(floor);

        this.addRocks();
        this.addPillars();
    }

    setupLighting() {
        // Main ambient light - increased intensity
        const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
        this.scene.add(ambientLight);

        // Main directional light - increased intensity
        const mainLight = new THREE.DirectionalLight(0xffffff, 1.2);
        mainLight.position.set(20, 30, 20);
        mainLight.castShadow = true;
        mainLight.shadow.mapSize.width = 2048;
        mainLight.shadow.mapSize.height = 2048;
        mainLight.shadow.camera.near = 0.5;
        mainLight.shadow.camera.far = 100;
        mainLight.shadow.camera.left = -30;
        mainLight.shadow.camera.right = 30;
        mainLight.shadow.camera.top = 30;
        mainLight.shadow.camera.bottom = -30;
        
        this.scene.add(mainLight);

        // Additional fill light for better visibility
        const fillLight = new THREE.DirectionalLight(0xffffff, 0.8);
        fillLight.position.set(-20, 20, -20);
        this.scene.add(fillLight);

        // Add torches for atmospheric lighting
        this.addTorches();
    }

    addRocks() {
        const rockGeometry = new THREE.DodecahedronGeometry(1, 1);
        const rockMaterial = new THREE.MeshStandardMaterial({
            color: 0x555555,
            roughness: 0.8,
            metalness: 0.2
        });

        for (let i = 0; i < 15; i++) {
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
            rock.receiveShadow = true;
            this.obstacles.add(rock);
        }
    }

    addPillars() {
        const pillarGeometry = new THREE.CylinderGeometry(1, 1.2, 8, 8);
        const pillarMaterial = new THREE.MeshStandardMaterial({
            color: 0x444444,
            roughness: 0.7,
            metalness: 0.3
        });

        for (let i = 0; i < 8; i++) {
            const pillar = new THREE.Mesh(pillarGeometry, pillarMaterial);
            pillar.position.set(
                Math.random() * 60 - 30,
                4,
                Math.random() * 60 - 30
            );
            
            pillar.castShadow = true;
            pillar.receiveShadow = true;
            this.obstacles.add(pillar);
        }
    }

    addTorches() {
        const positions = [
            { x: 10, z: 10 },
            { x: -10, z: 10 },
            { x: 10, z: -10 },
            { x: -10, z: -10 },
            { x: 0, z: 15 },   // Additional torches
            { x: 0, z: -15 },
            { x: 15, z: 0 },
            { x: -15, z: 0 }
        ];

        positions.forEach(pos => {
            // Torch base
            const torchGeometry = new THREE.CylinderGeometry(0.1, 0.1, 2, 8);
            const torchMaterial = new THREE.MeshStandardMaterial({
                color: 0x4a3525,
                roughness: 0.8,
                metalness: 0.2
            });
            
            const torch = new THREE.Mesh(torchGeometry, torchMaterial);
            torch.position.set(pos.x, 3, pos.z);
            
            // Torch light - increased intensity and range
            const light = new THREE.PointLight(0xff6600, 2, 20);
            light.position.y = 1.5;
            torch.add(light);

            // Flame effect
            const flameGeometry = new THREE.SphereGeometry(0.2, 8, 8);
            const flameMaterial = new THREE.MeshBasicMaterial({
                color: 0xff3300,
                transparent: true,
                opacity: 0.8
            });
            
            const flame = new THREE.Mesh(flameGeometry, flameMaterial);
            flame.position.y = 1.5;
            torch.add(flame);

            this.animateFlame(flame, light);
            this.obstacles.add(torch);
        });
    }

    animateFlame(flame, light) {
        const animate = () => {
            flame.scale.x = 1 + Math.sin(Date.now() * 0.01) * 0.1;
            flame.scale.y = 1 + Math.cos(Date.now() * 0.01) * 0.1;
            light.intensity = 1.5 + Math.sin(Date.now() * 0.01) * 0.5;
            requestAnimationFrame(animate);
        };
        animate();
    }
}
