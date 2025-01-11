import * as THREE from 'three'; // Importar Three.js como módulo
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'; // Importar controles de órbita
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';


// Configuración básica de Three.js
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0; // Ajuste de la exposición
document.body.appendChild(renderer.domElement);

// Configurar el compositor de efectos
const composer = new EffectComposer(renderer);

// Agregar un RenderPass para renderizar la escena
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

// Configurar el UnrealBloomPass
const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight), // Resolución
    0.8, // Intensidad del bloom
    0.2, // Radio
    0.6 // Umbral
);
composer.addPass(bloomPass);

// Agregar un OutputPass opcional (para compatibilidad)
composer.addPass(new OutputPass());

// Controles de cámara con el mouse
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Suaviza el movimiento
controls.dampingFactor = 0.1; // Ajusta la resistencia
controls.zoomSpeed = 0.8; // Modifica la sensibilidad del zoom
controls.rotateSpeed = 0.6;
controls.minDistance = 1; // Distancia mínima al objeto
controls.maxDistance = 70; // Distancia máxima al objeto

// Añadir un AudioListener a la cámara
const listener = new THREE.AudioListener();
camera.add(listener); // El listener sigue a la cámara

// Nodos y conexiones
let nodes = [
    { id: 1, position: new THREE.Vector3(-2, 0, -5), audio: "Audio/rola1.mp3", sphere: null, sound: null, color:"#f5ae6c"},
    { id: 2, position: new THREE.Vector3(2, 0, -5), audio: "Audio/rola2.mp3", sphere: null, sound: null, color: "orange" },
    { id: 3, position: new THREE.Vector3(0, 2, -5), audio: "Audio/rola3.mp3", sphere: null, sound: null, color:"pink" },
    { id: 4, position: new THREE.Vector3(-4, 0, -7), audio: "Audio/rola1.mp3", sphere: null, sound: null, color:"#f2cc55"},
    { id: 5, position: new THREE.Vector3(3, 0, -3), audio: "Audio/rola2.mp3", sphere: null, sound: null, color:"#f28455"},
    { id: 6, position: new THREE.Vector3(1, 2, 3), audio: "Audio/rola3.mp3", sphere: null, sound: null, color:"#f2b955" },
];

let connections = []; // Para las conexiones entre nodos
let selectedNode = null; // Nodo seleccionado para conectar
let temporaryLine = null; // Línea temporal mientras se selecciona otro nodo

// Luces para efectos de sombreado
const ambientLight = new THREE.AmbientLight(0xffffff, 0.3); // Luz ambiental tenue
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5); // Luz direccional
directionalLight.position.set(-5, 5, 5); // Posición de la luz
scene.add(directionalLight);

const pointLight = new THREE.PointLight(0xffffff, 1, 100); // Luz puntual
pointLight.position.set(5, 5, 5);
scene.add(pointLight);

// Inicializa nodos con sonido posicional
nodes.forEach(node => {
    // Crear la geometría del nodo
    const geometry = new THREE.SphereGeometry(0.3, 32, 32);
    const material = new THREE.MeshPhongMaterial({ 
        color: node.color, 
        emissive: node.color, // Hacer que el nodo emita luz
        emissiveIntensity: 1, // Controlar la intensidad de la luz emitida
        shininess: 50
    });
    const sphere = new THREE.Mesh(geometry, material);
    sphere.position.copy(node.position);
    scene.add(sphere);
    node.sphere = sphere;
    
    // Crear una luz puntual para el nodo
    const pointLight = new THREE.PointLight(node.color, 1, 10); // Color, intensidad y distancia de la luz
    pointLight.position.copy(node.position);
    scene.add(pointLight);
    node.light = pointLight; // Añadir la luz al nodo

    // Crear sonido posicional
    const sound = new THREE.PositionalAudio(listener);
    const audioLoader = new THREE.AudioLoader();
    audioLoader.load(node.audio, function (buffer) {
        sound.setBuffer(buffer);
        sound.setRefDistance(3); // Qué tan lejos comienza a bajar el volumen
        sound.setLoop(true);
        sound.setVolume(0.5);
        sound.setMaxDistance(20);
    });
    sphere.add(sound); // Añadir el sonido al nodo
    node.sound = sound;
});

// Líneas para las conexiones
const lineMaterial = new THREE.LineBasicMaterial({ color: "gray"});
const lineGeometries = [];

// Cámara inicial
camera.position.set(0, 0, 10)

// Raycaster para detectar clics en los nodos
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Evento para resaltar nodos
window.addEventListener('mousemove', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(nodes.map(n => n.sphere));            

    nodes.forEach(n => n.sphere.material.emissive.setHex(0x000000)); // Restablecer
    if (intersects.length > 0) {
        const hoveredNode = nodes.find(n => n.sphere === intersects[0].object);
        hoveredNode.sphere.material.emissive.setHex(0x444444); // Resaltar
    }
});

// Evento de clic en la pantalla
window.addEventListener('mousedown', (event) => {
    // Convertir coordenadas del mouse a coordenadas de la pantalla
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Usar Raycaster para detectar colisiones con los nodos
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(nodes.map(n => n.sphere));

    if (intersects.length > 0) {
        const clickedNode = nodes.find(n => n.sphere === intersects[0].object);
        handleNodeClick(clickedNode);
    }
});

// Evento de movimiento del mouse (para arrastrar la línea dinámica)
window.addEventListener('mousemove', (event) => {
    if (selectedNode && temporaryLine) {
        const mouseVector = new THREE.Vector3();
        mouseVector.set(
            (event.clientX / window.innerWidth) * 2 - 1,
            -(event.clientY / window.innerHeight) * 2 + 1,
            0.5
        );
        mouseVector.unproject(camera); // Proyectar coordenadas del mouse en 3D

        // Actualizar la geometría de la línea dinámica para que siga el mouse
        temporaryLine.geometry.setFromPoints([selectedNode.position, mouseVector]);
    }
});

// Maneja la lógica de clics en los nodos
function handleNodeClick(node) {
    if (selectedNode === null) {
        // Seleccionar un nodo y crear una línea dinámica
        selectedNode = node;

        // Crear una línea temporal que se actualizará con el mouse
        const geometry = new THREE.BufferGeometry().setFromPoints([node.position, node.position]); // Inicialmente no tiene dirección
        temporaryLine = new THREE.Line(geometry, lineMaterial);
        scene.add(temporaryLine);

        // Establecer el color de la esfera y la luz emisiva del nodo
        node.sphere.material.color.set(node.color); // Cambia el color del nodo
        node.sphere.material.emissive.set(node.color); // La luz emisiva será del mismo color del nodo
        node.sphere.material.emissiveIntensity = 1; // Establece la intensidad de la luz emisiva (alta)

        // Activar la luz puntual asociada al nodo (si deseas que el nodo también tenga una luz puntual)
        node.light.intensity = 1; // Asegura que la luz puntual sea visible
    } else if (selectedNode === node) {
        // Si se hace clic en el mismo nodo, deseleccionarlo
        selectedNode.sphere.material.color.set(selectedNode.color); // Restaurar el color original
        selectedNode.sphere.material.emissiveIntensity = 0; // Apagar la luz emisiva
        selectedNode.light.intensity = 0; // Apagar la luz puntual del nodo
        scene.remove(temporaryLine); // Eliminar la línea temporal
        temporaryLine = null; // Limpiar la referencia de la línea
        selectedNode = null; // Eliminar la selección
    } else {
        // Si se selecciona otro nodo, realizar una acción (conectar o desconectar)
        toggleConnection(selectedNode, node);

        // Restaurar el color original y desactivar las luces del nodo previamente seleccionado
        selectedNode.sphere.material.color.set(selectedNode.color);
        selectedNode.sphere.material.emissiveIntensity = 0; // Apagar la luz emisiva
        selectedNode.light.intensity = 0; // Apagar la luz puntual
        scene.remove(temporaryLine); // Eliminar la línea temporal
        temporaryLine = null; // Limpiar la referencia de la línea
        selectedNode = null; // Eliminar la selección
    }
}

// Alterna entre conectar y desconectar nodos
function toggleConnection(nodeA, nodeB, nodeC = null) {
    const existingConnection = connections.find(conn => {
        if (nodeC) {
            return conn.every(n => [nodeA, nodeB, nodeC].includes(n));
        }
        return (conn[0] === nodeA && conn[1] === nodeB) || (conn[0] === nodeB && conn[1] === nodeA);
    });

    if (existingConnection) {
        removeConnection(nodeA, nodeB, nodeC);
    } else {
        createConnection(nodeA, nodeB, nodeC);
    }
}

// Crea una línea entre nodos
function createConnection(nodeA, nodeB, nodeC = null) {
    if (nodeC) {
        const geometry1 = new THREE.BufferGeometry().setFromPoints([nodeA.position, nodeB.position]);
        const geometry2 = new THREE.BufferGeometry().setFromPoints([nodeB.position, nodeC.position]);
        const geometry3 = new THREE.BufferGeometry().setFromPoints([nodeC.position, nodeA.position]);

        const line1 = new THREE.Line(geometry1, lineMaterial);
        const line2 = new THREE.Line(geometry2, lineMaterial);
        const line3 = new THREE.Line(geometry3, lineMaterial);

        scene.add(line1, line2, line3);
        lineGeometries.push(line1, line2, line3);
        connections.push([nodeA, nodeB, nodeC]);

        playNodeAudio(nodeA);
        playNodeAudio(nodeB);
        playNodeAudio(nodeC);
    } else {
        const geometry = new THREE.BufferGeometry().setFromPoints([nodeA.position, nodeB.position]);
        const line = new THREE.Line(geometry, lineMaterial);
        scene.add(line);
        lineGeometries.push(line);
        connections.push([nodeA, nodeB]);

        playNodeAudio(nodeA);
        playNodeAudio(nodeB);
    }
}

// Elimina una línea entre nodos
function removeConnection(nodeA, nodeB, nodeC = null) {
    const index = connections.findIndex(conn => {
        if (nodeC) {
            return conn.includes(nodeA) && conn.includes(nodeB) && conn.includes(nodeC);
        }
        return (conn[0] === nodeA && conn[1] === nodeB) || (conn[0] === nodeB && conn[1] === nodeA);
    });

    if (index !== -1) {
        if (nodeC) {
            for (let i = 0; i < 3; i++) {
                const line = lineGeometries.pop();
                scene.remove(line);
            }
        } else {
            const line = lineGeometries[index];
            scene.remove(line);
            lineGeometries.splice(index, 1);
        }
        connections.splice(index, 1);

        stopNodeAudio(nodeA);
        stopNodeAudio(nodeB);
        if (nodeC) stopNodeAudio(nodeC);
    }
}

// Reproduce el audio de un nodo
function playNodeAudio(node) {
    if (node.sound && !node.sound.isPlaying) {
        node.sound.play();
    }
}

// Detiene el audio de un nodo
function stopNodeAudio(node) {
    if (node.sound && node.sound.isPlaying) {
        node.sound.stop();
    }
}

// Animación principal
function animate() {
    requestAnimationFrame(animate);

    // Actualizar controles de cámara
    controls.update();

    // Actualizar posiciones de las luces de los nodos
    nodes.forEach(node => {
        if (node.light) {
            node.light.position.copy(node.sphere.position); // Actualiza la posición de la luz con la del nodo
        }
    });

    // Renderizar la escena con el compositor
    composer.render();
}
animate();
