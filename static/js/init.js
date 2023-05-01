// init.js
import { create3DScene } from './scene.js';

export async function init(THREE) {
  const OrbitControls = (
    await import('https://unpkg.com/three@0.112/examples/jsm/controls/OrbitControls.js')
  ).OrbitControls;
  const jsonData = await loadJSONData();
  create3DScene(THREE, jsonData, OrbitControls);

  addBackButton();
}

export async function loadJSONData() {
  const response = await fetch('/static/json/reduced_vectors.json');
  const jsonData = await response.json();
  return jsonData;
}

function addBackButton() {
  const backButton = document.createElement('button');
  backButton.textContent = 'Back';
  backButton.style.position = 'absolute';
  backButton.style.top = '10px';
  backButton.style.left = '10px';
  backButton.style.zIndex = '10';
  backButton.addEventListener('click', () => {
    window.location.href = '/';
  });

  document.body.appendChild(backButton);
}