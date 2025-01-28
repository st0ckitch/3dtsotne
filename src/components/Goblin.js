import * as THREE from 'three';
import { gsap } from 'gsap';

export default class Goblin {
    constructor(scene, position) {
        this.scene = scene;
        this.position = position;
        this.isAttacking = false;
        this.createModel();
    }

    createModel() {
        // Create goblin body
        const bodyGeometry = new THREE.SphereGeometry(0.3, 8, 8);
        const bodyMaterial = new THREE.MeshPhongMaterial({
            color: 0x2d5a27,
            roughness: 0.8
        });
        this.body = new THREE.Mesh(bodyGeometry, bodyMaterial);

        // Create goblin head
        const headGeometry = new THREE.SphereGeometry(0.2, 8, 8);
        const headMaterial = bodyMaterial.clone();
        this.head = new THREE.Mesh(headGeometry, headMaterial);
        this.head.position.y = 0.4;

        // Create eyes
        const eyeGeometry = new THREE.SphereGeometry(0.05, 8, 8);
        const eyeMaterial = new THREE.MeshPhongMaterial({
            color: 0xff0000,
            emissive: 0xff0000,
            emissiveIntensity: 0.5
        });

        this.leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        this.rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        
        this.leftEye.position.set(-0.1, 0.45, 0.15);
        this.rightEye.position.set(0.1, 0.45, 0.15);

        // Create arms
        const armGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.4);
        const armMaterial = bodyMaterial.clone();
        
        this.leftArm = new THREE.Mesh(armGeometry, armMaterial);
        this.rightArm = new THREE.Mesh(armGeometry, armMaterial);
        
        this.leftArm.position.set(-0.3, 0.1, 0);
        this.rightArm.position.set(0.3, 0.1, 0);
        
        this.leftArm.rotation.z = Math.PI / 4;
        this.rightArm.rotation.z = -Math.PI / 4;

        // Group all parts
        this.model = new THREE.Group();
        this.model.add(this.body);
        this.model.add(this.head);
        this.model.add(this.leftEye);
        this.model.add(this.rightEye);
        this.model.add(this.leftArm);
        this.model.add(this.rightArm);

        // Position and add to scene
        this.model.position.copy(this.position);
        this.model.position.y = 0.5;
        this.scene.add(this.model);

        // Add idle animation
        this.idleAnimation();
    }

    idleAnimation() {
        gsap.to(this.model.position, {
            y: '+=0.1',
            duration: 1,
            yoyo: true,
            repeat: -1,
            ease: "power1.inOut"
        });

        gsap.to([this.leftArm.rotation, this.rightArm.rotation], {
            z: '+=0.2',
            duration: 0.5,
            yoyo: true,
            repeat: -1,
            ease: "power1.inOut"
        });
    }

    attack() {
        if (this.isAttacking) return;
        this.isAttacking = true;

        // Attack animation
        const timeline = gsap.timeline({
            onComplete: () => {
                this.isAttacking = false;
            }
        });

        timeline.to(this.model.position, {
            y: '+=0.5',
            z: '-=0.3',
            duration: 0.2
        })
        .to(this.model.rotation, {
            x: '-=0.2',
            duration: 0.2
        }, 0)
        .to(this.model.position, {
            y: '-=0.5',
            z: '+=0.3',
            duration: 0.2
        })
        .to(this.model.rotation, {
            x: '+=0.2',
            duration: 0.2
        }, '>-0.2');

        // Eyes flash
        gsap.to([this.leftEye.material, this.rightEye.material], {
            emissiveIntensity: 1,
            duration: 0.1,
            yoyo: true,
            repeat: 1
        });
    }

    die() {
        gsap.to(this.model.scale, {
            x: 0,
            y: 0,
            z: 0,
            duration: 0.5,
            ease: "power2.in",
            onComplete: () => {
                this.scene.remove(this.model);
            }
        });
    }
}
