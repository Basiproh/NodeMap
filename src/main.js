import * as THREE from 'three';
import ForceGraph3D from '3d-force-graph';

// Configuración inicial
const graphContainer = document.getElementById('3d-graph');
if (!graphContainer) console.error('No se encontró el contenedor.');

const Graph = ForceGraph3D()(graphContainer);

let nodes = [];
let links = [];
let selectedNode = null;

// Configurar el espacio 3D
Graph.graphData({ nodes, links });

// Función para agregar nodos dinámicamente
function addNode(id, text, audio, image) {
  const audioURL = audio ? URL.createObjectURL(audio) : null;
  const imageURL = image ? URL.createObjectURL(image) : null;

  const newNode = {
    id,
    content: { text, audio: audioURL, image: imageURL }
  };

  nodes.push(newNode);

  // Crear el nodo visual en el espacio 3D
  Graph.graphData({ nodes, links });

  console.log("Nodo creado:", newNode);
}

// Funcionalidad para mostrar contenido al hacer clic en un nodo
Graph.onNodeClick(node => {
  console.log('Nodo clickeado:', node);
  showNodeContent(node);
});

// Mostrar el contenido del nodo en un contenedor
function showNodeContent(node) {
  const contentContainer = document.getElementById('node-content');
  if (!contentContainer) return;
  contentContainer.innerHTML = `
    <h3>${node.id}</h3>
    <p>${node.content.text || 'Sin texto disponible'}</p>
    ${node.content.image ? `<img src="${node.content.image}" alt="Imagen"/>` : ''}
    ${node.content.audio ? `<p>Audio disponible.</p>` : ''}
  `;
}

// Conexión dinámica entre nodos
function connectNodes(sourceNode, targetNode) {
  links.push({ source: sourceNode.id, target: targetNode.id });
  Graph.graphData({ nodes, links });
}

// Función para abrir/cerrar el formulario
function toggleForm() {
  const form = document.getElementById('add-node-form');
  if (form) {
    form.classList.toggle('open');
  } else {
    console.error('No se encontró el formulario con el ID "add-node-form".');
  }
}

// Exponer la función al contexto global
window.toggleForm = toggleForm;

// Configuración para pruebas u otros ajustes iniciales
console.log("JavaScript cargado correctamente");


// Configuración para pruebas u otros ajustes iniciales
console.log("JavaScript cargado correctamente");

// Lógica para agregar nodos desde el formulario
document.getElementById('add-node-form').onsubmit = function (event) {
  event.preventDefault();
  const id = event.target.elements['node-id'].value;
  const text = event.target.elements['node-text'].value;
  const audio = event.target.elements['node-audio'].files[0];
  const image = event.target.elements['node-image'].files[0];

  addNode(id, text, audio, image);
};
