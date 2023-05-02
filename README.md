# Click Gif to watch Video Demo
[![Video Thumbnail](./static/screenshot.gif)](https://www.youtube.com/watch?v=agl0IDa27D8)


## Annoy and Pre-trained Model Usage

This project leverages Annoy (Approximate Nearest Neighbors Oh Yeah) and a pre-trained EfficientNet-B2 model to calculate image similarity efficiently. The pre-trained model is used for feature extraction, converting the images into feature vectors that represent their high-level visual characteristics. These feature vectors serve as input for Annoy, which then builds an approximate nearest neighbors index to enable efficient similarity-based searches.

### Caching Mechanism and Reduced Vectors

A caching mechanism is implemented to store the feature vectors of images and avoid unnecessary repeated computations. This cache is stored as a file, and the project checks whether the cache is up-to-date before performing any calculations. If new images are added, a re-cache is triggered, updating the cache with the new feature vectors. This mechanism significantly reduces the computation time and makes the image similarity search more responsive.

For visualization purposes, the high-dimensional feature vectors are reduced to three-dimensional vectors using dimensionality reduction techniques like t-SNE or UMAP. These 3D vectors are then used to create an interactive 3D visualization, allowing users to explore and understand the relationships between images intuitively.

### Model Trade-offs and EfficientNet-B2 Choice

There are various pre-trained models available for feature extraction, each with its own trade-offs between accuracy, speed, and memory usage. EfficientNet-B2 is chosen for this project due to its balance between performance and efficiency. This model provides a good level of accuracy while requiring relatively less computation time and memory compared to other models, making it a suitable choice for the task at hand.

Alternative models for feature extraction include:
- ResNet family (e.g., ResNet-50, ResNet-101)
- VGG family (e.g., VGG-16, VGG-19)
- Inception family (e.g., InceptionV3, InceptionResNetV2)
- MobileNet family (e.g., MobileNetV2, MobileNetV3)

### Generating Textures and User API Key

This project also includes a feature to generate more textures by prompting ChatGPT to write prompts for DALL-E. To use this feature, the user needs to open the `constants.py` file and provide their own OpenAI API key. Note that generating new textures requires a lengthy re-cache before they show up in the image vector search results. However, clicking on any of the newly generated images and selecting "Find Similar Images" will trigger the re-cache.

Alternative vector APIs:
- Google Cloud Vision API
- Amazon Rekognition
- Microsoft Azure Computer Vision API

Alternative prompt to image APIs:
- VQGAN+CLIP
- DALL-E 2

### Work in Progress and Collaboration

This project is a work in progress, and there may be some rough edges(especially in my web app). Collaboration is welcome, and contributions from the community can help improve and expand the project's capabilities. Feel free to join and contribute to the development of this 3D Image Similarity Visualization tool.


## Getting Started

To get started with the project, follow these steps:

### Prerequisites

- Python 3.x (preferably 3.7 or higher)
- pip (Python package manager)

### Installing Dependencies

1. Navigate to the project's root directory.
2. Run the dependency installation script for your platform:
   - For Unix-based systems (Linux or MacOS): `bash install_deps/install_dependencies.sh`
   - For Windows: `install_deps\install_dependencies.bat`

### Running the Application

1. Activate the virtual environment:
   - For Unix-based systems: `source venv/bin/activate`
   - For Windows: `.\venv\Scripts\activate`
2. Run the application: `python3 app.py`
3. Open your web browser and navigate to `http://127.0.0.1:5000/` to view the application.
