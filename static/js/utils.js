export function createRoundedTexture(texture, cornerRadius, outlineColor = null, removeOutline = false) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = texture.image.width;
    canvas.height = texture.image.height;

    // Draw the original image
    ctx.drawImage(texture.image, 0, 0);

    if (!removeOutline && outlineColor) {
        console.log('Drawing outline with color:', outlineColor);
        // Draw the outline
        ctx.strokeStyle = outlineColor;
        ctx.lineWidth = 20;
        ctx.strokeRect(0, 0, canvas.width, canvas.height);
    }

    // Create a rounded rectangle mask
    ctx.globalCompositeOperation = 'destination-in';
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.moveTo(cornerRadius, 0);
    ctx.lineTo(canvas.width - cornerRadius, 0);
    ctx.quadraticCurveTo(canvas.width, 0, canvas.width, cornerRadius);
    ctx.lineTo(canvas.width, canvas.height - cornerRadius);
    ctx.quadraticCurveTo(canvas.width, canvas.height, canvas.width - cornerRadius, canvas.height);
    ctx.lineTo(cornerRadius, canvas.height);
    ctx.quadraticCurveTo(0, canvas.height, 0, canvas.height - cornerRadius);
    ctx.lineTo(0, cornerRadius);
    ctx.quadraticCurveTo(0, 0, cornerRadius, 0);
    ctx.closePath();
    ctx.fill();

    // Create a new texture from the canvas
    const roundedTexture = new THREE.CanvasTexture(canvas);
    roundedTexture.needsUpdate = true;

    return roundedTexture;
}


export function updateSpriteTexture(sprite, newTexture) {
    sprite.material.dispose(); // Dispose the old material
    const material = new THREE.SpriteMaterial({ map: newTexture });
    sprite.material = material; // Assign the new material
}


export async function fetchSimilarImages(selectedImagePath) {
    const response = await fetch('/find_similar_images', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: `selected_image=${encodeURIComponent(selectedImagePath)}`
    });
    const similarImages = await response.json();
    return similarImages;
  }
  