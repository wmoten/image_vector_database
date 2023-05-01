// render.js
import { createRoundedTexture, fetchSimilarImages, updateSpriteTexture } from './utils.js';


// init function
export async function init() {
    const OrbitControls = (await import("https://unpkg.com/three@0.112/examples/jsm/controls/OrbitControls.js")).OrbitControls;
    const jsonData = await loadJSONData();
    create3DScene(jsonData, OrbitControls);
}

let selectedSprite = null;
let similarSprites = [];
export function create3DScene(THREE, imagesData, OrbitControls) {
    // Set up the scene
    const scene = new THREE.Scene();

    const selectedSpriteOutlineColor = 'white';
    const similarSpriteOutlineColor = 'green';

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
        const mult = .75;

        const textureLoader = new THREE.TextureLoader();
        textureLoader.load(imgPath, (texture) => {
            const roundedTexture = createRoundedTexture(texture, 30);
            const material = new THREE.SpriteMaterial({ map: roundedTexture });
            const sprite = new THREE.Sprite(material);
        
            sprite.scale.set(1, 1, 1); // set the size of the sprite
            sprite.position.set(position[0] * mult, position[1] * mult, position[2] * mult);
            sprite.userData = { path: imgPath }; // Add this line to set the userData object
            scene.add(sprite);
        
            renderer.render(scene, camera); // Add this line to re-render the scene
        });
    });

    // Add the click event listener inside the create3DScene function
    window.addEventListener('click', async (event) => {
        event.preventDefault();
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();
    
        // Get the normalized device coordinates
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
        raycaster.setFromCamera(mouse, camera);
    
        // Find the intersected sprites
        const intersects = raycaster.intersectObjects(scene.children, true);

        if (intersects.length > 0) {
            // Deselect previously selected sprite

            console.log(selectedSprite)
            if (selectedSprite) {
                console.log('Deselecting previous sprite:', selectedSprite);
                const oldTexture = selectedSprite.material.map;
                const newTexture = createRoundedTexture(oldTexture, 30, null, true);
                updateSpriteTexture(selectedSprite, newTexture);
                renderer.render(scene, camera);
            
                similarSprites.forEach((sprite) => {
                    const oldTexture = sprite.material.map;
                    const newTexture = createRoundedTexture(oldTexture, 30, null, true);
                    updateSpriteTexture(sprite, newTexture);
                    renderer.render(scene, camera);
                });
            
                similarSprites = [];
            }
            

            // Select the current sprite
            selectedSprite = intersects[0].object;
            console.log('Selecting current sprite:', selectedSprite);
            const selectedTexture = selectedSprite.material.map;
            const outlinedSelectedTexture = createRoundedTexture(selectedTexture, 30, selectedSpriteOutlineColor);
            selectedSprite.material.map = outlinedSelectedTexture;
    
            // Fetch similar images
            const similarImages = await fetchSimilarImages(selectedSprite.userData.path);

            // Update outline color of the similar images
            scene.traverse((child) => {
                if (child.isSprite && similarImages.find(img => img.image_path === child.userData.path) && child !== selectedSprite) {
                    // Add the outline for similar images
                    console.log('Updating outline of similar sprite:', child);
                    const oldTexture = child.material.map;
                    const newTexture = createRoundedTexture(oldTexture, 30, similarSpriteOutlineColor);
                    updateSpriteTexture(child, newTexture);
                    child.material.needsUpdate = true;

                    // Add the similar sprites to the similarSprites array
                    similarSprites.push(child);
                }
            
                renderer.render(scene, camera);
            });

        }
    }, false);
        
    function animate() {
        requestAnimationFrame(animate);

        // Update the controls in the animation loop
        controls.update();

        renderer.render(scene, camera);
    }

    animate();
}
