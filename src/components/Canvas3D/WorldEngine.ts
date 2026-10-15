import * as THREE from 'three';
import type { Destination, GameControls, CyclistState } from '../../types/game';
import { portfolioData } from '../../data/portfolio';
import { sounds } from '../../audio/soundEffects';

export interface WorldEngineCallbacks {
  onSpeedUpdate: (speedKmH: number) => void;
  onDestinationEnter: (destination: Destination) => void;
  onDestinationLeave: () => void;
  onProgressUpdate: (discoveredIds: string[], currentRoadT: number) => void;
  onNitroChange?: (isNitro: boolean) => void;
}

export class WorldEngine {
  private container: HTMLElement;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private animationFrameId: number | null = null;
  private clock: THREE.Clock;

  // Road Curve
  public roadCurve: THREE.CatmullRomCurve3;

  // 3D Objects
  private cyclistGroup: THREE.Group;
  private frontWheelGroup: THREE.Group;
  private rearWheelGroup: THREE.Group;
  private handlebarGroup: THREE.Group;
  private crankGroup: THREE.Group;
  private leftLeg: THREE.Group;
  private rightLeg: THREE.Group;

  // Scenery & Dynamic Animated Props
  private clouds: THREE.Group[] = [];
  private checkpointMeshes: { id: string; group: THREE.Group; ring: THREE.Mesh; beacon: THREE.Mesh }[] = [];
  private windTurbines: { group: THREE.Group; blades: THREE.Group }[] = [];
  private flyingDrone: THREE.Group | null = null;
  private droneRotors: THREE.Mesh[] = [];
  private billboardMesh: THREE.Mesh | null = null;

  // Particles
  private dustGeo!: THREE.BufferGeometry;
  private nitroGeo!: THREE.BufferGeometry;

  // Game state
  private controls: GameControls = {
    forward: false,
    backward: false,
    left: false,
    right: false,
    interact: false,
    brake: false,
    nitro: false
  };

  private cyclistState: CyclistState = {
    x: 0,
    y: 0.5,
    z: 0,
    speed: 0,
    maxSpeed: 0.42,
    rotationY: 0,
    steerAngle: 0,
    pedalRotation: 0,
    wheelRotation: 0,
    isMoving: false,
    isNitro: false,
    distanceTraveled: 0,
    currentRoadT: 0.05
  };

  private callbacks: WorldEngineCallbacks;
  private discoveredSet: Set<string> = new Set(['about']);
  private activeNearbyDestination: Destination | null = null;
  private isPaused: boolean = false;
  private isDestroyed: boolean = false;

  constructor(container: HTMLElement, callbacks: WorldEngineCallbacks) {
    this.container = container;
    this.callbacks = callbacks;
    this.clock = new THREE.Clock();

    // 1. Scene setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#F0F7FF');
    this.scene.fog = new THREE.FogExp2('#E0F0FE', 0.0065);

    // 2. Camera setup
    const aspect = container.clientWidth / (container.clientHeight || 1);
    this.camera = new THREE.PerspectiveCamera(55, aspect, 0.1, 850);
    this.camera.position.set(0, 5, -8);

    // 3. Renderer setup
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(this.renderer.domElement);

    // 4. Lighting
    this.setupLighting();

    // 5. Road curve spline (Scenic Island City Loop)
    this.roadCurve = this.createRoadCurve();

    // 6. Build World Geometry & Environment
    this.buildTerrain();
    this.buildRoadMesh();
    this.buildCityscape();
    this.buildCheckpoints();
    this.buildNatureScenery();
    this.buildWindTurbines();
    this.buildFlyingDrone();
    this.buildClouds();
    this.createDustParticles();
    this.createNitroParticles();

    // 7. Build Red & Black Racing Cyclist
    const cyclistParts = this.buildCyclist();
    this.cyclistGroup = cyclistParts.group;
    this.frontWheelGroup = cyclistParts.frontWheel;
    this.rearWheelGroup = cyclistParts.rearWheel;
    this.handlebarGroup = cyclistParts.handlebar;
    this.crankGroup = cyclistParts.crank;
    this.leftLeg = cyclistParts.leftLeg;
    this.rightLeg = cyclistParts.rightLeg;
    this.scene.add(this.cyclistGroup);

    // Initialize position at starting village
    this.resetToStart();

    // 8. Event listeners
    window.addEventListener('resize', this.onResize);

    // 9. Start render loop
    this.animate();
  }

  private setupLighting() {
    // Ambient soft blue
    const ambientLight = new THREE.AmbientLight('#EAF5FF', 0.9);
    this.scene.add(ambientLight);

    // Hemisphere light for natural sky/ground bounce
    const hemiLight = new THREE.HemisphereLight('#7CCBFF', '#CBD5E1', 0.65);
    this.scene.add(hemiLight);

    // Main directional sunlight
    const sunLight = new THREE.DirectionalLight('#FFFFFF', 1.25);
    sunLight.position.set(70, 110, 60);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 10;
    sunLight.shadow.camera.far = 320;
    const shadowDist = 140;
    sunLight.shadow.camera.left = -shadowDist;
    sunLight.shadow.camera.right = shadowDist;
    sunLight.shadow.camera.top = shadowDist;
    sunLight.shadow.camera.bottom = -shadowDist;
    sunLight.shadow.bias = -0.0004;
    this.scene.add(sunLight);

    // Neon red accent accent light near City / Project Island
    const redAccent = new THREE.PointLight('#EF4444', 1.8, 45);
    redAccent.position.set(-50, 6, 70);
    this.scene.add(redAccent);
  }

  private createRoadCurve(): THREE.CatmullRomCurve3 {
    // Smooth connected loop connecting the 5 destinations through city streets
    const points = [
      new THREE.Vector3(0, 0.4, 0),       // Dest 1: My Home Village
      new THREE.Vector3(22, 0.5, 25),
      new THREE.Vector3(45, 1.2, 55),     // Dest 2: Skill Station
      new THREE.Vector3(18, 0.9, 78),     // City Central Avenue
      new THREE.Vector3(-22, 0.8, 86),
      new THREE.Vector3(-55, 1.0, 75),    // Dest 3: Project Island / Tech City
      new THREE.Vector3(-76, 1.8, 35),
      new THREE.Vector3(-72, 3.2, -15),
      new THREE.Vector3(-50, 4.0, -45),   // Dest 4: Experience Mountain Summit
      new THREE.Vector3(-12, 2.8, -62),
      new THREE.Vector3(18, 2.0, -65),
      new THREE.Vector3(35, 1.5, -50),    // Dest 5: The Finish Line
      new THREE.Vector3(26, 0.8, -24),
      new THREE.Vector3(12, 0.5, -8),
    ];
    return new THREE.CatmullRomCurve3(points, true, 'centripetal', 0.22);
  }

  private buildTerrain() {
    // Main stylized island
    const islandGeo = new THREE.CylinderGeometry(150, 175, 15, 64, 8);
    islandGeo.translate(0, -7.5, 0);

    const pos = islandGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = pos.getZ(i);

      if (y >= -0.5) {
        // Mountain on northwest
        const distToMountain = Math.hypot(x - (-50), z - (-45));
        const mountainElevation = Math.max(0, 8.2 - distToMountain * 0.17);

        // Rolling city hills
        const hillElevation =
          Math.sin(x * 0.045) * Math.cos(z * 0.045) * 1.6 +
          Math.sin(x * 0.11 + z * 0.07) * 0.7;

        pos.setY(i, y + Math.max(-0.2, hillElevation + mountainElevation));
      }
    }
    islandGeo.computeVertexNormals();

    const islandMat = new THREE.MeshStandardMaterial({
      color: '#B2D9F2', // Crisp cool meadow
      roughness: 0.85,
      metalness: 0.05,
      flatShading: true,
    });

    const island = new THREE.Mesh(islandGeo, islandMat);
    island.receiveShadow = true;
    this.scene.add(island);

    // Ocean around island
    const seaGeo = new THREE.CylinderGeometry(380, 380, 4, 48);
    seaGeo.translate(0, -6.5, 0);
    const seaMat = new THREE.MeshStandardMaterial({
      color: '#38BDF8',
      roughness: 0.18,
      metalness: 0.4,
      transparent: true,
      opacity: 0.85,
    });
    const sea = new THREE.Mesh(seaGeo, seaMat);
    sea.receiveShadow = true;
    this.scene.add(sea);

    // Scenic inner city lake
    const lakeGeo = new THREE.CircleGeometry(24, 32);
    lakeGeo.rotateX(-Math.PI / 2);
    const lakeMat = new THREE.MeshStandardMaterial({
      color: '#0284C7',
      roughness: 0.1,
      metalness: 0.7,
      transparent: true,
      opacity: 0.85,
    });
    const lake = new THREE.Mesh(lakeGeo, lakeMat);
    lake.position.set(-15, 0.46, 22);
    lake.receiveShadow = true;
    this.scene.add(lake);
  }

  private buildRoadMesh() {
    const roadWidth = 3.4;
    const segments = 320;
    const roadPoints = this.roadCurve.getSpacedPoints(segments);

    const roadGeo = new THREE.BufferGeometry();
    const vertices: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];

    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const pt = roadPoints[i % segments];
      const tangent = this.roadCurve.getTangent(t).normalize();
      const normal = new THREE.Vector3(0, 1, 0);
      const binormal = new THREE.Vector3().crossVectors(tangent, normal).normalize();

      const leftPt = new THREE.Vector3().copy(pt).addScaledVector(binormal, roadWidth * 0.5);
      const rightPt = new THREE.Vector3().copy(pt).addScaledVector(binormal, -roadWidth * 0.5);

      leftPt.y += 0.09;
      rightPt.y += 0.09;

      vertices.push(leftPt.x, leftPt.y, leftPt.z);
      vertices.push(rightPt.x, rightPt.y, rightPt.z);

      uvs.push(0, t * 45);
      uvs.push(1, t * 45);

      if (i < segments) {
        const base = i * 2;
        indices.push(base, base + 1, base + 2);
        indices.push(base + 1, base + 3, base + 2);
      }
    }

    roadGeo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    roadGeo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    roadGeo.setIndex(indices);
    roadGeo.computeVertexNormals();

    // Carbon black tarmac with subtle metallic sheen
    const roadMat = new THREE.MeshStandardMaterial({
      color: '#111827',
      roughness: 0.65,
      metalness: 0.2,
    });

    const roadMesh = new THREE.Mesh(roadGeo, roadMat);
    roadMesh.receiveShadow = true;
    this.scene.add(roadMesh);

    // Glowing Red and White Road Lane Stripes
    const dashCount = 140;
    const dashGeo = new THREE.BoxGeometry(0.22, 0.02, 0.85);
    const dashMat = new THREE.MeshBasicMaterial({ color: '#EF4444' }); // Red racing stripes
    const instancedDashes = new THREE.InstancedMesh(dashGeo, dashMat, dashCount);

    const dummy = new THREE.Object3D();
    for (let i = 0; i < dashCount; i++) {
      const t = i / dashCount;
      const pt = this.roadCurve.getPoint(t);
      const tangent = this.roadCurve.getTangent(t);
      dummy.position.set(pt.x, pt.y + 0.12, pt.z);
      dummy.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), tangent);
      dummy.updateMatrix();
      instancedDashes.setMatrixAt(i, dummy.matrix);
    }
    instancedDashes.instanceMatrix.needsUpdate = true;
    this.scene.add(instancedDashes);
  }

  // Build City Skyscrapers, Houses, Streetlights, and Architecture
  private buildCityscape() {
    const cityGroup = new THREE.Group();

    // 1. Skyscraper Cluster near Central Island / Project Island
    const buildingColors = ['#1E293B', '#0F172A', '#1E3A8A', '#334155'];
    const towerCoords = [
      { x: -30, z: 60, w: 7, h: 22, d: 7 },
      { x: -40, z: 52, w: 8, h: 28, d: 8 },
      { x: -20, z: 65, w: 6, h: 18, d: 6 },
      { x: -32, z: 75, w: 9, h: 25, d: 7 },
      { x: -18, z: 50, w: 7, h: 16, d: 8 },
      { x: 30, z: 35, w: 6, h: 15, d: 6 },
      { x: 36, z: 42, w: 7, h: 20, d: 7 },
    ];

    towerCoords.forEach((t, idx) => {
      const bGeo = new THREE.BoxGeometry(t.w, t.h, t.d);
      const bMat = new THREE.MeshStandardMaterial({
        color: buildingColors[idx % buildingColors.length],
        roughness: 0.3,
        metalness: 0.7,
      });
      const building = new THREE.Mesh(bGeo, bMat);
      building.position.set(t.x, t.h / 2 + 0.5, t.z);
      building.castShadow = true;
      building.receiveShadow = true;
      cityGroup.add(building);

      // Glowing window bands (Red and Cyan)
      const windowRows = Math.floor(t.h / 3);
      for (let r = 1; r < windowRows; r++) {
        const winBand = new THREE.Mesh(
          new THREE.BoxGeometry(t.w + 0.1, 0.4, t.d + 0.1),
          new THREE.MeshBasicMaterial({ color: r % 2 === 0 ? '#38BDF8' : '#EF4444' })
        );
        winBand.position.set(t.x, r * 3, t.z);
        cityGroup.add(winBand);
      }

      // Rooftop antenna tower with red beacon
      const antenna = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.15, 4, 8),
        new THREE.MeshStandardMaterial({ color: '#E2E8F0', metalness: 0.9 })
      );
      antenna.position.set(t.x, t.h + 2.5, t.z);
      cityGroup.add(antenna);

      const beaconLight = new THREE.Mesh(
        new THREE.SphereGeometry(0.2, 8, 8),
        new THREE.MeshBasicMaterial({ color: '#EF4444' })
      );
      beaconLight.position.set(t.x, t.h + 4.5, t.z);
      cityGroup.add(beaconLight);
    });

    // 2. Residential Houses & Townhouses (With red roofs, porches, and chimneys)
    const houseCoords = [
      { x: -8, z: 12, rot: 0.2 },
      { x: 8, z: 14, rot: -0.3 },
      { x: -14, z: -8, rot: 0.5 },
      { x: 16, z: -12, rot: -0.4 },
      { x: -28, z: 20, rot: 0.8 },
      { x: 28, z: 12, rot: -0.6 },
      { x: 38, z: 22, rot: -0.2 },
      { x: -62, z: 45, rot: 0.4 },
      { x: -48, z: 90, rot: -0.7 },
      { x: 8, z: 88, rot: 0.1 },
    ];

    houseCoords.forEach((h, idx) => {
      const house = this.createDetailedHouse(idx % 2 === 0 ? '#EF4444' : '#1E293B');
      house.position.set(h.x, 0.5, h.z);
      house.rotation.y = h.rot;
      cityGroup.add(house);
    });

    // 3. Street Lamps with Glowing Red/Warm Bulbs along the roadway
    const lampGeo = new THREE.CylinderGeometry(0.08, 0.1, 3.2, 8);
    const lampMat = new THREE.MeshStandardMaterial({ color: '#1F2937', metalness: 0.8 });
    const bulbGeo = new THREE.SphereGeometry(0.22, 10, 10);
    const bulbMat = new THREE.MeshBasicMaterial({ color: '#FEF08A' });

    for (let t = 0; t <= 1; t += 0.05) {
      const roadPt = this.roadCurve.getPoint(t);
      const tangent = this.roadCurve.getTangent(t).normalize();
      const binormal = new THREE.Vector3().crossVectors(tangent, new THREE.Vector3(0, 1, 0)).normalize();

      // Place lamp 2.4 units to the right of road
      const lampPos = new THREE.Vector3().copy(roadPt).addScaledVector(binormal, 2.4);

      const lampPost = new THREE.Mesh(lampGeo, lampMat);
      lampPost.position.set(lampPos.x, lampPos.y + 1.6, lampPos.z);
      lampPost.castShadow = true;
      cityGroup.add(lampPost);

      const bulb = new THREE.Mesh(bulbGeo, bulbMat);
      bulb.position.set(lampPos.x, lampPos.y + 3.2, lampPos.z);
      cityGroup.add(bulb);
    }

    // 4. City Holographic Billboard ("LALIT CHAUHAN • FULL STACK DEV")
    const billboard = this.createHolographicBillboard();
    billboard.position.set(-35, 12, 40);
    cityGroup.add(billboard);
    this.billboardMesh = billboard as unknown as THREE.Mesh;

    this.scene.add(cityGroup);
  }

  private createDetailedHouse(roofColor: string): THREE.Group {
    const house = new THREE.Group();

    // White / pale wall body
    const wallGeo = new THREE.BoxGeometry(4.2, 3.0, 3.6);
    const wallMat = new THREE.MeshStandardMaterial({ color: '#FFFFFF', roughness: 0.5 });
    const wall = new THREE.Mesh(wallGeo, wallMat);
    wall.position.y = 1.5;
    wall.castShadow = true;
    wall.receiveShadow = true;
    house.add(wall);

    // Pitch roof (Red or Navy)
    const roofGeo = new THREE.ConeGeometry(3.6, 2.2, 4);
    roofGeo.rotateY(Math.PI / 4);
    const roofMat = new THREE.MeshStandardMaterial({ color: roofColor, roughness: 0.35 });
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.y = 4.0;
    roof.scale.set(1.15, 1, 1.15);
    roof.castShadow = true;
    house.add(roof);

    // Front door
    const door = new THREE.Mesh(
      new THREE.BoxGeometry(0.9, 1.6, 0.1),
      new THREE.MeshStandardMaterial({ color: '#0F172A' })
    );
    door.position.set(0, 0.8, 1.81);
    house.add(door);

    // Chimney
    const chimney = new THREE.Mesh(
      new THREE.BoxGeometry(0.6, 1.8, 0.6),
      new THREE.MeshStandardMaterial({ color: '#B91C1C' })
    );
    chimney.position.set(1.2, 4.4, -0.6);
    chimney.castShadow = true;
    house.add(chimney);

    // Windows
    const winMat = new THREE.MeshBasicMaterial({ color: '#7CCBFF' });
    const winLeft = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 0.08), winMat);
    winLeft.position.set(-1.2, 1.6, 1.81);
    house.add(winLeft);

    const winRight = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 0.08), winMat);
    winRight.position.set(1.2, 1.6, 1.81);
    house.add(winRight);

    return house;
  }

  private createHolographicBillboard(): THREE.Group {
    const group = new THREE.Group();

    // Twin support pylons
    const pylonMat = new THREE.MeshStandardMaterial({ color: '#1E293B', metalness: 0.8 });
    const p1 = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 9, 8), pylonMat);
    p1.position.set(-4, 4.5, 0);
    group.add(p1);

    const p2 = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 9, 8), pylonMat);
    p2.position.set(4, 4.5, 0);
    group.add(p2);

    // Glowing Neon Billboard Screen
    const screenGeo = new THREE.BoxGeometry(10, 4.5, 0.3);
    const screenMat = new THREE.MeshStandardMaterial({
      color: '#0F172A',
      emissive: '#EF4444',
      emissiveIntensity: 0.45,
      roughness: 0.2,
      metalness: 0.9,
    });
    const screen = new THREE.Mesh(screenGeo, screenMat);
    screen.position.set(0, 9, 0);
    screen.castShadow = true;
    group.add(screen);

    // Red neon border frame
    const frameGeo = new THREE.BoxGeometry(10.4, 4.9, 0.35);
    const frameMat = new THREE.MeshBasicMaterial({ color: '#EF4444' });
    const frame = new THREE.Mesh(frameGeo, frameMat);
    frame.position.set(0, 9, -0.05);
    group.add(frame);

    return group;
  }

  // Animated Wind Turbines on the mountain
  private buildWindTurbines() {
    const turbineCoords = [
      { x: -65, y: 5.5, z: -55 },
      { x: -45, y: 7.2, z: -70 },
      { x: -30, y: 6.0, z: -55 },
    ];

    const towerMat = new THREE.MeshStandardMaterial({ color: '#FFFFFF', metalness: 0.3 });
    const bladeMat = new THREE.MeshStandardMaterial({ color: '#EF4444', roughness: 0.4 }); // Red racing blades

    turbineCoords.forEach((coord) => {
      const turbineGroup = new THREE.Group();
      turbineGroup.position.set(coord.x, coord.y, coord.z);

      // Tower
      const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.5, 12, 12), towerMat);
      tower.position.y = 6;
      tower.castShadow = true;
      turbineGroup.add(tower);

      // Nacelle (generator housing)
      const nacelle = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 1.8), bladeMat);
      nacelle.position.set(0, 12, 0);
      nacelle.castShadow = true;
      turbineGroup.add(nacelle);

      // Rotor Blades
      const bladesGroup = new THREE.Group();
      bladesGroup.position.set(0, 12, 1.0);

      for (let b = 0; b < 3; b++) {
        const blade = new THREE.Mesh(new THREE.BoxGeometry(0.2, 5.0, 0.08), bladeMat);
        blade.position.y = 2.5;
        const bladePivot = new THREE.Group();
        bladePivot.rotation.z = (b / 3) * Math.PI * 2;
        bladePivot.add(blade);
        bladesGroup.add(bladePivot);
      }
      turbineGroup.add(bladesGroup);

      this.scene.add(turbineGroup);
      this.windTurbines.push({ group: turbineGroup, blades: bladesGroup });
    });
  }

  // Autonomous Flying Camera Drone
  private buildFlyingDrone() {
    const drone = new THREE.Group();
    const bodyMat = new THREE.MeshStandardMaterial({ color: '#0F172A', metalness: 0.8 });
    const rotorMat = new THREE.MeshBasicMaterial({ color: '#38BDF8', transparent: true, opacity: 0.7 });

    // Main body
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.4, 1.6), bodyMat);
    drone.add(body);

    // Red LED light on top
    const led = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 8), new THREE.MeshBasicMaterial({ color: '#EF4444' }));
    led.position.y = 0.35;
    drone.add(led);

    // 4 Rotors
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([rx, rz]) => {
      const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.2), bodyMat);
      arm.rotation.z = Math.PI / 2;
      arm.position.set(rx * 0.6, 0, rz * 0.6);
      drone.add(arm);

      const rotor = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.04, 16), rotorMat);
      rotor.position.set(rx * 1.1, 0.2, rz * 1.1);
      drone.add(rotor);
      this.droneRotors.push(rotor);
    });

    drone.position.set(0, 24, 0);
    this.flyingDrone = drone;
    this.scene.add(drone);
  }

  private buildCheckpoints() {
    portfolioData.destinations.forEach((dest) => {
      const group = new THREE.Group();
      group.position.set(dest.position[0], dest.position[1], dest.position[2]);

      // Glowing pulsing base ring with Red/Blue accent
      const ringGeo = new THREE.RingGeometry(3.8, 4.6, 32);
      ringGeo.rotateX(-Math.PI / 2);
      const ringMat = new THREE.MeshBasicMaterial({
        color: dest.color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.85,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.y = 0.16;
      group.add(ring);

      // Inner disc
      const innerDiscGeo = new THREE.CircleGeometry(3.7, 32);
      innerDiscGeo.rotateX(-Math.PI / 2);
      const innerDiscMat = new THREE.MeshBasicMaterial({
        color: '#FFFFFF',
        transparent: true,
        opacity: 0.25,
        side: THREE.DoubleSide
      });
      const innerDisc = new THREE.Mesh(innerDiscGeo, innerDiscMat);
      innerDisc.position.y = 0.13;
      group.add(innerDisc);

      // Rotating 3D Beacon Diamond/Octahedron
      const beaconGeo = new THREE.OctahedronGeometry(1.2, 0);
      const beaconMat = new THREE.MeshStandardMaterial({
        color: dest.color,
        roughness: 0.15,
        metalness: 0.9,
        emissive: dest.color,
        emissiveIntensity: 0.5,
      });
      const beacon = new THREE.Mesh(beaconGeo, beaconMat);
      beacon.position.y = 4.4;
      beacon.castShadow = true;
      group.add(beacon);

      // Destination Specific Environmental Structures
      if (dest.id === 'about') {
        const house = this.createDetailedHouse('#EF4444');
        house.position.set(-6, 0, 4);
        house.rotation.y = 0.4;
        group.add(house);

        const house2 = this.createDetailedHouse('#123B72');
        house2.position.set(6.5, 0, 3.5);
        house2.rotation.y = -0.5;
        group.add(house2);

        const arch = this.createWelcomeArch();
        arch.position.set(0, 0, -3.8);
        group.add(arch);
      } else if (dest.id === 'skills') {
        const canopy = this.createWorkshopCanopy();
        group.add(canopy);
      } else if (dest.id === 'projects') {
        const gallery = this.createProjectGallery();
        group.add(gallery);
      } else if (dest.id === 'experience') {
        const summit = this.createMountainSummit();
        group.add(summit);
      } else if (dest.id === 'contact') {
        const finishArch = this.createFinishArch();
        group.add(finishArch);
      }

      this.scene.add(group);
      this.checkpointMeshes.push({ id: dest.id, group, ring, beacon });
    });
  }

  private createWelcomeArch(): THREE.Group {
    const arch = new THREE.Group();
    const pillarMat = new THREE.MeshStandardMaterial({ color: '#1E293B', roughness: 0.3 });
    const crossMat = new THREE.MeshStandardMaterial({ color: '#EF4444', roughness: 0.2 });

    const p1 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 4.2, 0.5), pillarMat);
    p1.position.set(-3.0, 2.1, 0);
    p1.castShadow = true;
    arch.add(p1);

    const p2 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 4.2, 0.5), pillarMat);
    p2.position.set(3.0, 2.1, 0);
    p2.castShadow = true;
    arch.add(p2);

    const beam = new THREE.Mesh(new THREE.BoxGeometry(6.8, 0.9, 0.7), crossMat);
    beam.position.set(0, 4.0, 0);
    beam.castShadow = true;
    arch.add(beam);

    return arch;
  }

  private createWorkshopCanopy(): THREE.Group {
    const group = new THREE.Group();
    const glassMat = new THREE.MeshStandardMaterial({
      color: '#38BDF8',
      roughness: 0.1,
      metalness: 0.9,
      transparent: true,
      opacity: 0.8,
    });
    const frameMat = new THREE.MeshStandardMaterial({ color: '#0F172A', roughness: 0.3 });

    [[-3.2, -3.2], [3.2, -3.2], [-3.2, 3.2], [3.2, 3.2]].forEach(([x, z]) => {
      const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 4.5, 8), frameMat);
      pillar.position.set(x, 2.25, z);
      pillar.castShadow = true;
      group.add(pillar);
    });

    const roof = new THREE.Mesh(new THREE.BoxGeometry(7.6, 0.35, 7.6), glassMat);
    roof.position.y = 4.5;
    roof.castShadow = true;
    group.add(roof);

    [-2.2, 0, 2.2].forEach((x) => {
      const terminal = new THREE.Mesh(
        new THREE.BoxGeometry(0.9, 2.4, 0.9),
        new THREE.MeshStandardMaterial({ color: '#111827', roughness: 0.2 })
      );
      terminal.position.set(x, 1.2, -2.4);
      terminal.castShadow = true;
      group.add(terminal);

      const redBar = new THREE.Mesh(
        new THREE.BoxGeometry(0.7, 0.18, 0.92),
        new THREE.MeshBasicMaterial({ color: '#EF4444' })
      );
      redBar.position.set(x, 1.7, -2.4);
      group.add(redBar);
    });

    return group;
  }

  private createProjectGallery(): THREE.Group {
    const group = new THREE.Group();
    const angles = [-0.65, 0, 0.65];
    angles.forEach((angle, i) => {
      const pedGroup = new THREE.Group();
      pedGroup.position.set((i - 1) * 3.8, 0, 4.8);
      pedGroup.rotation.y = -angle;

      const base = new THREE.Mesh(
        new THREE.CylinderGeometry(1.3, 1.5, 0.9, 16),
        new THREE.MeshStandardMaterial({ color: '#0F172A', roughness: 0.3 })
      );
      base.position.y = 0.45;
      base.castShadow = true;
      pedGroup.add(base);

      // Glowing Red Frame Display
      const screen = new THREE.Mesh(
        new THREE.BoxGeometry(2.2, 1.4, 0.16),
        new THREE.MeshStandardMaterial({ color: '#1E293B', emissive: '#EF4444', emissiveIntensity: 0.35 })
      );
      screen.position.y = 2.1;
      screen.castShadow = true;
      pedGroup.add(screen);

      group.add(pedGroup);
    });
    return group;
  }

  private createMountainSummit(): THREE.Group {
    const group = new THREE.Group();
    const stoneMat = new THREE.MeshStandardMaterial({ color: '#64748B', roughness: 0.9, flatShading: true });
    for (let i = 0; i < 4; i++) {
      const r = 2.4 - i * 0.45;
      const stone = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.8, r, 0.95, 7), stoneMat);
      stone.position.set(0, 0.48 + i * 0.9, 0);
      stone.rotation.y = i * 0.85;
      stone.castShadow = true;
      group.add(stone);
    }

    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.08, 4.0),
      new THREE.MeshStandardMaterial({ color: '#E2E8F0', metalness: 0.8 })
    );
    pole.position.set(0, 5.2, 0);
    pole.castShadow = true;
    group.add(pole);

    const flag = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 0.9, 0.05),
      new THREE.MeshStandardMaterial({ color: '#EF4444' }) // Red Summit Flag
    );
    flag.position.set(0.8, 6.6, 0);
    group.add(flag);

    return group;
  }

  private createFinishArch(): THREE.Group {
    const group = new THREE.Group();
    const archMat = new THREE.MeshStandardMaterial({ color: '#0F172A', roughness: 0.3 });
    const bannerMat = new THREE.MeshStandardMaterial({ color: '#FFFFFF', roughness: 0.2 });

    const p1 = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 5.2, 12), archMat);
    p1.position.set(-3.5, 2.6, 0);
    p1.castShadow = true;
    group.add(p1);

    const p2 = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 5.2, 12), archMat);
    p2.position.set(3.5, 2.6, 0);
    p2.castShadow = true;
    group.add(p2);

    const banner = new THREE.Mesh(new THREE.BoxGeometry(7.4, 1.3, 0.45), bannerMat);
    banner.position.set(0, 4.7, 0);
    banner.castShadow = true;
    group.add(banner);

    // Red racing finish stripe
    const stripe = new THREE.Mesh(
      new THREE.BoxGeometry(7.42, 0.45, 0.47),
      new THREE.MeshBasicMaterial({ color: '#EF4444' })
    );
    stripe.position.set(0, 4.7, 0);
    group.add(stripe);

    return group;
  }

  private buildNatureScenery() {
    const treeCount = 95;
    const trunkGeo = new THREE.CylinderGeometry(0.22, 0.32, 1.8, 6);
    trunkGeo.translate(0, 0.9, 0);
    const trunkMat = new THREE.MeshStandardMaterial({ color: '#475569', roughness: 0.9 });
    const foliageGeo = new THREE.ConeGeometry(1.8, 3.4, 6);
    foliageGeo.translate(0, 3.2, 0);
    const foliageMat = new THREE.MeshStandardMaterial({
      color: '#0284C7',
      roughness: 0.8,
      flatShading: true,
    });

    const trunkMesh = new THREE.InstancedMesh(trunkGeo, trunkMat, treeCount);
    const foliageMesh = new THREE.InstancedMesh(foliageGeo, foliageMat, treeCount);
    trunkMesh.castShadow = true;
    foliageMesh.castShadow = true;

    const dummy = new THREE.Object3D();
    let placed = 0;
    let attempts = 0;

    while (placed < treeCount && attempts < 500) {
      attempts++;
      const radius = 22 + Math.random() * 105;
      const angle = Math.random() * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;

      let tooCloseToRoad = false;
      for (let t = 0; t <= 1; t += 0.03) {
        const roadPt = this.roadCurve.getPoint(t);
        if (Math.hypot(roadPt.x - x, roadPt.z - z) < 5.4) {
          tooCloseToRoad = true;
          break;
        }
      }

      if (!tooCloseToRoad) {
        const scale = 0.8 + Math.random() * 0.55;
        dummy.position.set(x, 0.2, z);
        dummy.scale.set(scale, scale, scale);
        dummy.rotation.y = Math.random() * Math.PI * 2;
        dummy.updateMatrix();

        trunkMesh.setMatrixAt(placed, dummy.matrix);
        foliageMesh.setMatrixAt(placed, dummy.matrix);
        placed++;
      }
    }

    trunkMesh.instanceMatrix.needsUpdate = true;
    foliageMesh.instanceMatrix.needsUpdate = true;
    this.scene.add(trunkMesh);
    this.scene.add(foliageMesh);
  }

  private buildClouds() {
    const cloudCount = 14;
    const cloudMat = new THREE.MeshStandardMaterial({
      color: '#FFFFFF',
      roughness: 0.3,
      transparent: true,
      opacity: 0.9,
      flatShading: true,
    });

    for (let i = 0; i < cloudCount; i++) {
      const cloudGroup = new THREE.Group();
      const puffCount = 4 + Math.floor(Math.random() * 3);

      for (let p = 0; p < puffCount; p++) {
        const radius = 3.2 + Math.random() * 2.8;
        const puff = new THREE.Mesh(new THREE.DodecahedronGeometry(radius, 1), cloudMat);
        puff.position.set((p - puffCount / 2) * 3.6, Math.random() * 1.2, Math.random() * 2);
        cloudGroup.add(puff);
      }

      const dist = 65 + Math.random() * 110;
      const angle = (i / cloudCount) * Math.PI * 2 + Math.random() * 0.5;
      cloudGroup.position.set(Math.cos(angle) * dist, 34 + Math.random() * 16, Math.sin(angle) * dist);
      this.clouds.push(cloudGroup);
      this.scene.add(cloudGroup);
    }
  }

  private createDustParticles(): void {
    const particleCount = 40;
    this.dustGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i++) {
      positions[i] = 0;
    }
    this.dustGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const dustMat = new THREE.PointsMaterial({
      color: '#EF4444', // Red drift sparks
      size: 0.28,
      transparent: true,
      opacity: 0.7,
    });

    const particles = new THREE.Points(this.dustGeo, dustMat);
    this.scene.add(particles);
  }

  private createNitroParticles(): void {
    const nitroCount = 50;
    this.nitroGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(nitroCount * 3);

    for (let i = 0; i < nitroCount * 3; i++) {
      positions[i] = 0;
    }
    this.nitroGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const nitroMat = new THREE.PointsMaterial({
      color: '#FF2E51', // Blazing fiery neon red/pink
      size: 0.45,
      transparent: true,
      opacity: 0.9,
    });

    const particles = new THREE.Points(this.nitroGeo, nitroMat);
    this.scene.add(particles);
  }

  // Build Sleek Carbon Black & Crimson Red Racing Bicycle + Rider
  private buildCyclist() {
    const group = new THREE.Group();

    // Materials: Carbon Black & Crimson Red
    const carbonMat = new THREE.MeshStandardMaterial({
      color: '#0F172A', // Carbon Black
      roughness: 0.35,
      metalness: 0.7,
    });
    const redRacingMat = new THREE.MeshStandardMaterial({
      color: '#EF4444', // Fiery Red
      roughness: 0.2,
      metalness: 0.8,
      emissive: '#B91C1C',
      emissiveIntensity: 0.2,
    });
    const metalMat = new THREE.MeshStandardMaterial({
      color: '#E2E8F0',
      roughness: 0.2,
      metalness: 0.9,
    });
    const blackMat = new THREE.MeshStandardMaterial({
      color: '#090D16',
      roughness: 0.6,
    });

    // Top tube with red racing stripe
    const topTube = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 1.15), carbonMat);
    topTube.rotation.z = Math.PI / 2.2;
    topTube.position.set(0, 0.72, 0);
    topTube.castShadow = true;
    group.add(topTube);

    const stripe = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.048, 0.45), redRacingMat);
    stripe.rotation.z = Math.PI / 2.2;
    stripe.position.set(0.1, 0.74, 0);
    group.add(stripe);

    const downTube = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.25), redRacingMat);
    downTube.rotation.z = -Math.PI / 3.4;
    downTube.position.set(-0.05, 0.48, 0);
    downTube.castShadow = true;
    group.add(downTube);

    const seatTube = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 1.05), carbonMat);
    seatTube.rotation.z = -0.3;
    seatTube.position.set(-0.45, 0.65, 0);
    seatTube.castShadow = true;
    group.add(seatTube);

    const saddle = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.08, 0.22), blackMat);
    saddle.position.set(-0.55, 1.06, 0);
    saddle.castShadow = true;
    group.add(saddle);

    // Wheels with Red LED Ring accents
    const createWheel = () => {
      const wheelGroup = new THREE.Group();
      const tire = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.065, 12, 24), blackMat);
      tire.castShadow = true;
      wheelGroup.add(tire);

      // Red LED Rim Ring
      const rim = new THREE.Mesh(new THREE.TorusGeometry(0.38, 0.025, 8, 24), redRacingMat);
      wheelGroup.add(rim);

      const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.16, 8), metalMat);
      hub.rotation.x = Math.PI / 2;
      wheelGroup.add(hub);

      for (let s = 0; s < 4; s++) {
        const spoke = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.76), metalMat);
        spoke.rotation.z = (s / 4) * Math.PI;
        wheelGroup.add(spoke);
      }
      return wheelGroup;
    };

    const rearWheel = createWheel();
    rearWheel.position.set(-0.85, 0.42, 0);
    group.add(rearWheel);

    const frontWheel = createWheel();
    frontWheel.position.set(0.85, 0.42, 0);

    const handlebarGroup = new THREE.Group();
    handlebarGroup.position.set(0.55, 0.75, 0);

    const forkLeft = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.85), redRacingMat);
    forkLeft.position.set(0.2, -0.35, 0.08);
    forkLeft.rotation.z = -0.28;
    handlebarGroup.add(forkLeft);

    const forkRight = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.85), redRacingMat);
    forkRight.position.set(0.2, -0.35, -0.08);
    forkRight.rotation.z = -0.28;
    handlebarGroup.add(forkRight);

    const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.72), metalMat);
    bar.rotation.x = Math.PI / 2;
    bar.position.set(0, 0.35, 0);
    handlebarGroup.add(bar);

    const gripLeft = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.038, 0.16), redRacingMat);
    gripLeft.rotation.x = Math.PI / 2;
    gripLeft.position.set(0, 0.35, 0.3);
    handlebarGroup.add(gripLeft);

    const gripRight = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.038, 0.16), redRacingMat);
    gripRight.rotation.x = Math.PI / 2;
    gripRight.position.set(0, 0.35, -0.3);
    handlebarGroup.add(gripRight);

    handlebarGroup.add(frontWheel);
    group.add(handlebarGroup);

    // Crank
    const crankGroup = new THREE.Group();
    crankGroup.position.set(-0.35, 0.32, 0);
    const chainring = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.02, 16), metalMat);
    chainring.rotation.x = Math.PI / 2;
    crankGroup.add(chainring);
    group.add(crankGroup);

    // Rider in Sleek Black & Crimson Racing Suit
    const skinMat = new THREE.MeshStandardMaterial({ color: '#FBCFE8', roughness: 0.6 });
    const suitMat = new THREE.MeshStandardMaterial({ color: '#111827', roughness: 0.4 }); // Dark suit
    const suitRedMat = new THREE.MeshStandardMaterial({ color: '#EF4444', roughness: 0.3 }); // Red racing accents
    const helmetMat = new THREE.MeshStandardMaterial({ color: '#DC2626', roughness: 0.2, metalness: 0.4 });

    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.52, 0.32), suitMat);
    torso.position.set(-0.3, 1.35, 0);
    torso.rotation.z = 0.45;
    torso.castShadow = true;
    group.add(torso);

    const chestStripe = new THREE.Mesh(new THREE.BoxGeometry(0.37, 0.16, 0.33), suitRedMat);
    chestStripe.position.set(-0.29, 1.35, 0);
    chestStripe.rotation.z = 0.45;
    group.add(chestStripe);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 12), skinMat);
    head.position.set(-0.15, 1.7, 0);
    group.add(head);

    const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.19, 12, 12), helmetMat);
    helmet.position.set(-0.16, 1.75, 0);
    helmet.scale.set(1.15, 0.85, 1.05);
    group.add(helmet);

    const visor = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.06, 0.24), blackMat);
    visor.position.set(-0.06, 1.7, 0);
    group.add(visor);

    const armLeft = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.6), suitMat);
    armLeft.position.set(0.08, 1.3, 0.22);
    armLeft.rotation.z = -0.7;
    group.add(armLeft);

    const armRight = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.6), suitMat);
    armRight.position.set(0.08, 1.3, -0.22);
    armRight.rotation.z = -0.7;
    group.add(armRight);

    const createLeg = () => {
      const legGroup = new THREE.Group();
      const thigh = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.44, 0.13), suitRedMat);
      thigh.position.y = -0.22;
      legGroup.add(thigh);

      const calf = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.38, 0.11), suitMat);
      calf.position.set(0, -0.56, 0);
      legGroup.add(calf);

      const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.09, 0.13), blackMat);
      shoe.position.set(0.06, -0.76, 0);
      legGroup.add(shoe);

      return legGroup;
    };

    const leftLeg = createLeg();
    leftLeg.position.set(-0.45, 1.15, 0.17);
    group.add(leftLeg);

    const rightLeg = createLeg();
    rightLeg.position.set(-0.45, 1.15, -0.17);
    group.add(rightLeg);

    return {
      group,
      frontWheel,
      rearWheel,
      handlebar: handlebarGroup,
      crank: crankGroup,
      leftLeg,
      rightLeg,
    };
  }

  public updateControls(newControls: Partial<GameControls>) {
    this.controls = { ...this.controls, ...newControls };
  }

  public setPaused(paused: boolean) {
    this.isPaused = paused;
  }

  public resetToStart() {
    this.teleportToDestination('about');
  }

  public teleportToDestination(destId: string) {
    const dest = portfolioData.destinations.find((d) => d.id === destId);
    if (!dest) return;

    this.cyclistState.currentRoadT = dest.roadDistance;
    this.cyclistState.speed = 0;

    const pt = this.roadCurve.getPoint(dest.roadDistance);
    const tangent = this.roadCurve.getTangent(dest.roadDistance);

    this.cyclistState.x = pt.x;
    this.cyclistState.y = pt.y + 0.1;
    this.cyclistState.z = pt.z;
    this.cyclistState.rotationY = Math.atan2(tangent.x, tangent.z) + Math.PI / 2;

    this.cyclistGroup.position.set(this.cyclistState.x, this.cyclistState.y, this.cyclistState.z);
    this.cyclistGroup.rotation.y = this.cyclistState.rotationY;

    if (!this.discoveredSet.has(dest.id)) {
      this.discoveredSet.add(dest.id);
      sounds.playCheckpointChime();
    }
    this.callbacks.onProgressUpdate(Array.from(this.discoveredSet), this.cyclistState.currentRoadT);
    this.callbacks.onSpeedUpdate(0);
  }

  private animate = () => {
    if (this.isDestroyed) return;
    this.animationFrameId = requestAnimationFrame(this.animate);

    const delta = Math.min(this.clock.getDelta(), 0.1);

    if (!this.isPaused) {
      this.updatePhysics(delta);
      this.updateAnimations(delta);
      this.checkDestinationProximity();
    }

    this.updateCamera(delta);
    this.renderer.render(this.scene, this.camera);
  };

  private updatePhysics(delta: number) {
    const state = this.cyclistState;
    const isNitro = Boolean(this.controls.nitro);
    state.isNitro = isNitro;

    if (this.callbacks.onNitroChange) {
      this.callbacks.onNitroChange(isNitro);
    }

    // Nitro speed multiplier
    const speedLimit = isNitro ? state.maxSpeed * 1.65 : state.maxSpeed;
    const accel = (isNitro ? 0.95 : 0.6) * delta;
    const brakeForce = 1.35 * delta;
    const friction = 0.965;

    if (this.controls.forward) {
      state.speed = Math.min(speedLimit, state.speed + accel);
    } else if (this.controls.backward || this.controls.brake) {
      state.speed = Math.max(-0.14, state.speed - brakeForce);
    } else {
      state.speed *= friction;
      if (Math.abs(state.speed) < 0.002) state.speed = 0;
    }

    const steerSpeed = 2.5 * delta;
    if (this.controls.left) {
      state.steerAngle = Math.min(0.55, state.steerAngle + steerSpeed);
      state.rotationY += state.speed * 2.8 * delta;
    } else if (this.controls.right) {
      state.steerAngle = Math.max(-0.55, state.steerAngle - steerSpeed);
      state.rotationY -= state.speed * 2.8 * delta;
    } else {
      state.steerAngle *= 0.85;
    }

    const splineLength = this.roadCurve.getLength();
    const dt = (state.speed * delta * 24) / splineLength;
    state.currentRoadT = (state.currentRoadT + dt + 1.0) % 1.0;

    const roadPt = this.roadCurve.getPoint(state.currentRoadT);
    const roadTangent = this.roadCurve.getTangent(state.currentRoadT);
    const targetHeading = Math.atan2(roadTangent.x, roadTangent.z) + Math.PI / 2;

    state.x = THREE.MathUtils.lerp(state.x, roadPt.x, 0.16);
    state.y = roadPt.y + 0.09;
    state.z = THREE.MathUtils.lerp(state.z, roadPt.z, 0.16);
    state.rotationY = THREE.MathUtils.lerp(state.rotationY, targetHeading, 0.08);

    state.isMoving = Math.abs(state.speed) > 0.01;
    if (state.isMoving) {
      state.distanceTraveled += Math.abs(state.speed);
      sounds.playPedalTick(Math.abs(state.speed) / state.maxSpeed);
    }

    this.cyclistGroup.position.set(state.x, state.y, state.z);
    this.cyclistGroup.rotation.y = state.rotationY;

    // Lean cyclist into turns
    const rollAngle = -state.steerAngle * 0.48 * (state.speed / state.maxSpeed);
    this.cyclistGroup.rotation.z = rollAngle;
    this.handlebarGroup.rotation.y = state.steerAngle;

    const speedKmH = Math.round(Math.abs(state.speed) * 62);
    this.callbacks.onSpeedUpdate(speedKmH);
    this.callbacks.onProgressUpdate(Array.from(this.discoveredSet), state.currentRoadT);
  }

  private updateAnimations(delta: number) {
    const state = this.cyclistState;
    const time = this.clock.getElapsedTime();

    // Wheel and Crank rotation
    const rotSpeed = state.speed * 28 * delta;
    state.wheelRotation += rotSpeed;
    state.pedalRotation += rotSpeed * 0.7;

    this.frontWheelGroup.rotation.z = state.wheelRotation;
    this.rearWheelGroup.rotation.z = state.wheelRotation;
    this.crankGroup.rotation.z = state.pedalRotation;

    // Pedaling Motion
    const pedSin = Math.sin(state.pedalRotation);
    this.leftLeg.rotation.x = pedSin * 0.45;
    this.rightLeg.rotation.x = -pedSin * 0.45;

    // Wind Turbines spin
    this.windTurbines.forEach((wt, i) => {
      wt.blades.rotation.z += delta * (1.2 + i * 0.3);
    });

    // Flying Drone Patrol Orbit
    if (this.flyingDrone) {
      const droneAngle = time * 0.35;
      this.flyingDrone.position.set(Math.cos(droneAngle) * 45, 22 + Math.sin(time * 1.5) * 1.5, Math.sin(droneAngle) * 45);
      this.flyingDrone.rotation.y = -droneAngle + Math.PI / 2;
      this.droneRotors.forEach((rotor) => {
        rotor.rotation.y += delta * 35;
      });
    }

    // Holographic Billboard Pulse
    if (this.billboardMesh) {
      this.billboardMesh.rotation.y = Math.sin(time * 0.5) * 0.15;
    }

    // Drifting clouds
    this.clouds.forEach((cloud) => {
      cloud.position.x += delta * 1.5;
      if (cloud.position.x > 180) cloud.position.x = -180;
    });

    // Checkpoint glowing rings & rotating beacon
    this.checkpointMeshes.forEach((cp) => {
      cp.beacon.rotation.y += delta * 1.4;
      cp.beacon.position.y = 4.4 + Math.sin(time * 2.8) * 0.28;
      const pulse = 1.0 + Math.sin(time * 3.2) * 0.09;
      cp.ring.scale.set(pulse, pulse, 1);
    });

    // Nitro Fiery Red Particles
    if (state.isNitro && state.isMoving) {
      const nitroPos = this.nitroGeo.attributes.position as THREE.BufferAttribute;
      const count = nitroPos.count;
      for (let i = 0; i < count; i++) {
        let py = nitroPos.getY(i) + delta * 1.8;
        if (py > 1.2 || nitroPos.getX(i) === 0) {
          nitroPos.setXYZ(
            i,
            state.x - Math.cos(state.rotationY) * 1.0 + (Math.random() - 0.5) * 0.3,
            state.y + 0.3 + (Math.random() - 0.5) * 0.2,
            state.z + Math.sin(state.rotationY) * 1.0 + (Math.random() - 0.5) * 0.3
          );
        } else {
          nitroPos.setY(i, py);
        }
      }
      nitroPos.needsUpdate = true;
    }

    // Drift dust particles
    if (state.isMoving && Math.abs(state.speed) > 0.15) {
      const posAttr = this.dustGeo.attributes.position as THREE.BufferAttribute;
      const count = posAttr.count;
      for (let i = 0; i < count; i++) {
        let py = posAttr.getY(i) + delta * 0.8;
        if (py > 0.8 || posAttr.getX(i) === 0) {
          posAttr.setXYZ(
            i,
            state.x - Math.cos(state.rotationY) * 0.8 + (Math.random() - 0.5) * 0.3,
            state.y + 0.1,
            state.z + Math.sin(state.rotationY) * 0.8 + (Math.random() - 0.5) * 0.3
          );
        } else {
          posAttr.setY(i, py);
        }
      }
      posAttr.needsUpdate = true;
    }
  }

  private checkDestinationProximity() {
    const playerPos = this.cyclistGroup.position;
    let foundNearby: Destination | null = null;

    for (const dest of portfolioData.destinations) {
      const dist = Math.hypot(dest.position[0] - playerPos.x, dest.position[2] - playerPos.z);
      // Trigger radius: 9 units
      if (dist < 9.0) {
        foundNearby = dest;
        if (!this.discoveredSet.has(dest.id)) {
          this.discoveredSet.add(dest.id);
          sounds.playCheckpointChime();
          this.callbacks.onProgressUpdate(Array.from(this.discoveredSet), this.cyclistState.currentRoadT);
        }
        break;
      }
    }

    if (foundNearby !== this.activeNearbyDestination) {
      this.activeNearbyDestination = foundNearby;
      if (foundNearby) {
        this.callbacks.onDestinationEnter(foundNearby);
      } else {
        this.callbacks.onDestinationLeave();
      }
    }
  }

  private updateCamera(delta: number) {
    const state = this.cyclistState;
    const cameraDist = state.isNitro ? 7.6 : 6.8;
    const cameraHeight = state.isNitro ? 3.9 : 3.6;

    // Dynamic FOV speed warp
    const targetFov = state.isNitro ? 65 : 55;
    this.camera.fov = THREE.MathUtils.lerp(this.camera.fov, targetFov, 4.0 * delta);
    this.camera.updateProjectionMatrix();

    const angle = state.rotationY - Math.PI / 2;
    const targetCamX = state.x - Math.cos(angle) * cameraDist;
    const targetCamZ = state.z - Math.sin(angle) * cameraDist;
    const targetCamY = state.y + cameraHeight;

    this.camera.position.x = THREE.MathUtils.lerp(this.camera.position.x, targetCamX, 6.2 * delta);
    this.camera.position.y = THREE.MathUtils.lerp(this.camera.position.y, targetCamY, 6.2 * delta);
    this.camera.position.z = THREE.MathUtils.lerp(this.camera.position.z, targetCamZ, 6.2 * delta);

    const lookTarget = new THREE.Vector3(
      state.x + Math.cos(angle) * 3.0,
      state.y + 1.2,
      state.z + Math.sin(angle) * 3.0
    );
    this.camera.lookAt(lookTarget);
  }

  private onResize = () => {
    if (!this.container || this.isDestroyed) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight || 1;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  public destroy() {
    this.isDestroyed = true;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    window.removeEventListener('resize', this.onResize);
    this.renderer.dispose();
    if (this.container && this.renderer.domElement.parentElement === this.container) {
      this.container.removeChild(this.renderer.domElement);
    }
  }

  public getCyclistState(): CyclistState {
    return { ...this.cyclistState };
  }
}
