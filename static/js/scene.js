// render.js
import { createRoundedTexture } from './utils.js';

// init function
export async function init() {
    const OrbitControls = (await import("https://unpkg.com/three@0.112/examples/jsm/controls/OrbitControls.js")).OrbitControls;
    const jsonData = await loadJSONData();
    create3DScene(jsonData, OrbitControls);
}

export function create3DScene(THREE, imagesData, OrbitControls) {
    // Set up the scene
    const scene = new THREE.Scene();

    // Set up the renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Set up the camera
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 10;

    // Create OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // Enable smooth damping (optional)
    controls.dampingFactor = 0.1; // Adjust the damping factor (optional)
    controls.autoRotate = false; // Enable auto-rotation (optional)

    // Add ambient light
    const light = new THREE.AmbientLight(0xffffff);
    scene.add(light);

    // Load images and add them to the scene
    imagesData.forEach((data) => {
        const imgPath = data.path;
        const position = data.vector;
        const mult = .85;

        const textureLoader = new THREE.TextureLoader();
        textureLoader.load(imgPath, (texture) => {
            const roundedTexture = createRoundedTexture(texture, 30);
            const material = new THREE.SpriteMaterial({ map: roundedTexture });
            const sprite = new THREE.Sprite(material);

            sprite.scale.set(1, 1, 1); // set the size of the sprite
            sprite.position.set(position[0] * mult, position[1] * mult, position[2] * mult);
            scene.add(sprite);

            renderer.render(scene, camera); // Add this line to re-render the scene
        });
    });

    function animate() {
        requestAnimationFrame(animate);

        // Update the controls in the animation loop
        controls.update();

        renderer.render(scene, camera);
    }

    animate();
}
