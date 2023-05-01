const deleteButton = document.getElementById("delete-button");
const iterationsSlider = document.getElementById("iterations");
const iterationsValue = document.getElementById("iterations-value");
const loadingScreenMinDuration = 300; // Minimum duration of the loading screen in milliseconds

function main() {
    deleteButton.addEventListener("click", handleDeleteButtonClick);
    iterationsSlider.addEventListener("input", handleIterationsSliderInput);
    document.getElementById('img-graph').addEventListener('click', () => {
        window.location.href = '/img-graph';
      });
    document.querySelectorAll("button[type='submit']").forEach((button) => {
        button.addEventListener("click", handleSubmitButtonClick);
    });

    document.addEventListener("DOMContentLoaded", handleDOMContentLoaded);
}

function handleDeleteButtonClick() {
    const selectedImages = getSelectedImages();
    const imagePaths = getImagePaths(selectedImages);

    showLoadingScreen();

    deleteImages(imagePaths)
        .then((response) => {
            if (response.status === 204) {
                removeDeletedImages(selectedImages);
            } else {
                console.error("Failed to delete the images.");
            }
            hideLoadingScreen();
        })
        .catch((error) => {
            console.error("Error:", error);
            hideLoadingScreen();
        });
}

function getSelectedImages() {
    return document.querySelectorAll('input[type="checkbox"]:checked');
}

function getImagePaths(selectedImages) {
    return Array.from(selectedImages).map((imageCheckbox) => {
        const imageSrc = imageCheckbox.nextElementSibling.src;
        return imageSrc.replace(/^.*[\\\/]/, '');
    });
}

function deleteImages(imagePaths) {
    return fetch("/delete_image", {
        method: "DELETE",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams(imagePaths.map((path) => ['image_paths[]', path])),
    });
}

function removeDeletedImages(selectedImages) {
    selectedImages.forEach((imageCheckbox) => {
        imageCheckbox.parentElement.remove();
    });
}

function handleIterationsSliderInput() {
    iterationsValue.textContent = iterationsSlider.value;
}

function showLoadingScreen() {
    const loadingScreen = document.getElementById("loading-screen");
    loadingScreen.style.zIndex = "9999";
    loadingScreen.classList.remove("hidden");
    loadingScreen.style.opacity = "1";
}

function hideLoadingScreen() {
    const loadingScreen = document.getElementById("loading-screen");
    setTimeout(function () {
        loadingScreen.style.opacity = "0";
        setTimeout(function () {
            loadingScreen.classList.add("hidden");
            loadingScreen.style.zIndex = "-1";
        }, 500);
    }, loadingScreenMinDuration);
}

function handleSubmitButtonClick() {
    showLoadingScreen();
    setTimeout(hideImages, 1000);
    setTimeout(hideLoadingScreen, 1300);
}

function hideImages() {
    const images = document.querySelectorAll(".thumbnail");
    images.forEach((image) => {
        image.style.opacity = "0";
    });
}

function handleDOMContentLoaded() {
    const imageAnimations = document.querySelectorAll(".image-animation");

    imageAnimations.forEach((element) => {
        const randomAnimation = Math.floor(Math.random() * 3) + 1;
        element.style.animationName = `fadeIn-${randomAnimation}`;
    });
}

main();
