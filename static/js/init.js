// init.js
import { create3DScene } from './scene.js';

export async function init(THREE) {
  const OrbitControls = (
    await import('https://unpkg.com/three@0.112/examples/jsm/controls/OrbitControls.js')
  ).OrbitControls;
  const jsonData = await loadJSONData();
  create3DScene(THREE, jsonData, OrbitControls);
}

export async function loadJSONData() {
  const response = await fetch('/static/json/reduced_vectors.json');
  const jsonData = await response.json();
  return jsonData;
}
