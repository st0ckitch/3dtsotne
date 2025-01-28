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
        const floorMaterial = new THREE.MeshPhongMaterial({
            color: 0x2a1810,
            specular: 0x222222,
            shininess: 10
        });
        
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        this.scene.add(floor);

        // Add some ambient objects for atmosphere
        this.addRocks();
        this.addPillars();
    }

    setupLighting() {
        // Main ambient light
        const ambientLight = new THREE.AmbientLight(0xcccccc, 0.6);
        this.scene.add(ambientLight);

        // Main directional light (like sunlight)
        const mainLight = new THREE.DirectionalLight(0xffffff, 0.8);
        mainLight.position.set(20, 30, 20);
        mainLight.castShadow = true;
        
        // Improve shadow quality
        mainLight.shadow.mapSize.width = 2048;
        mainLight.shadow.mapSize.height = 2048;
        mainLight.shadow.camera.near = 0.5;
        mainLight.shadow.camera.far = 100;
        mainLight.shadow.camera.left = -30;
        mainLight.shadow.camera.right = 30;
        mainLight.shadow.camera.top = 30;
        mainLight.shadow.camera.bottom = -30;
        
        this.scene.add(mainLight);

        // Add torches around the scene
        this.addTorches();
    }

    addRocks() {
        const rockGeometry = new THREE.DodecahedronGeometry(1, 1);
        const rockMaterial = new THREE.MeshPhongMaterial({
            color: 0x555555,
            specular: 0x333333,
            shininess: 15
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
        const pillarMaterial = new THREE.MeshPhongMaterial({
            color: 0x444444,
            specular: 0x222222,
            shininess: 20
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
            { x: -10, z: -10 }
        ];

        positions.forEach(pos => {
            // Torch base
            const torchGeometry = new THREE.CylinderGeometry(0.1, 0.1, 2, 8);
            const torchMaterial = new THREE.MeshPhongMaterial({
                color: 0x4a3525,
                specular: 0x222222,
                shininess: 10
            });
            
            const torch = new THREE.Mesh(torchGeometry, torchMaterial);
            torch.position.set(pos.x, 3, pos.z);
            
            // Torch light
            const light = new THREE.PointLight(0xff6600, 1, 15);
            light.position.y = 1.5;
            torch.add(light);

            // Add flame effect
            const flameGeometry = new THREE.SphereGeometry(0.2, 8, 8);
            const flameMaterial = new THREE.MeshBasicMaterial({
                color: 0xff3300,
                transparent: true,
                opacity: 0.8
            });
            
            const flame = new THREE.Mesh(flameGeometry, flameMaterial);
            flame.position.y = 1.5;
            torch.add(flame);

            // Animate flame
            this.animateFlame(flame, light);

            this.obstacles.add(torch);
        });
    }

    animateFlame(flame, light) {
        const animate = () => {
            // Random scale fluctuation
            flame.scale.x = 1 + Math.sin(Date.now() * 0.01) * 0.1;
            flame.scale.y = 1 + Math.cos(Date.now() * 0.01) * 0.1;
            
            // Random light intensity
            light.intensity = 1 + Math.sin(Date.now() * 0.01) * 0.2;
            
            requestAnimationFrame(animate);
        };
        
        animate();
    }
}
