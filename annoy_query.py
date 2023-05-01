import os
import glob
import json
import numpy as np
from PIL import Image
import constants
import torch
from torchvision import transforms
from efficientnet_pytorch import EfficientNet
from annoy import AnnoyIndex
from sklearn.decomposition import PCA

from sklearn.manifold import TSNE

def reduce_features_tSNE(feature_vectors, n_components=3):
    tsne = TSNE(n_components=n_components, perplexity=30, n_iter=1000)
    reduced_vectors = tsne.fit_transform(feature_vectors)
    return reduced_vectors

def process_existing_features(method='tSNE', n_components=3):
    # Load cached image features
    with open(constants.CACHE_PATH, 'r') as f:
        image_features = json.load(f)

    # Extract feature vectors from the loaded data
    feature_vectors = [item["vector"] for item in image_features]

    # Perform dimensionality reduction of the feature vectors
    if method == 'PCA':
        reducer = PCA(n_components=n_components)
    elif method == 'tSNE':
        reducer = TSNE(n_components=n_components, perplexity=30, n_iter=1000)
    else:
        raise ValueError("Invalid method. Choose between 'PCA', 'tSNE', or 'UMAP'.")

    reduced_vectors = reducer.fit_transform(feature_vectors)

    # Create a list of dictionaries with image paths and reduced vectors
    reduced_vectors_list = []
    for i, item in enumerate(image_features):
        reduced_vectors_list.append({"path": item["path"], "vector": reduced_vectors[i].tolist()})

    # Save the reduced vectors to a JSON file
    with open(constants.VECTOR_CACHE_PATH, 'w') as f:
        json.dump(reduced_vectors_list, f)


def process_images(image_folder="static/images", use_cache=True):
    """
    Process images and extract their feature vectors.

    Args:
        image_folder (str): Path to the folder containing images.
        use_cache (bool): Use cached image features if available.

    Returns:
        dict: A dictionary with image paths as keys and feature vectors as values.
    """
    if not use_cache:
        # Load pre-trained EfficientNet model
        model = EfficientNet.from_pretrained('efficientnet-b2').eval()

        # Define image transformation
        transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
        ])

        # Get all image paths
        image_paths = glob.glob(os.path.join(image_folder, "*.jpg"))

        # Extract feature vectors for each image
        image_features = []
        for img_path in image_paths:
            img = Image.open(img_path).convert("RGB")
            img_tensor = transform(img).unsqueeze(0)

            with torch.no_grad():
                feature_vector = model(img_tensor).squeeze().tolist()
            image_features.append({"path": img_path, "vector": feature_vector})

        # Save the feature vectors to a JSON file
        with open(constants.CACHE_PATH, 'w') as f:
            json.dump(image_features, f)
        

        process_existing_features()

    else:
        # Load cached image features
        with open(constants.CACHE_PATH, 'r') as f:
            image_features = json.load(f)
    process_existing_features()
    return image_features


def build_annoy_index(image_features, n_trees=50, metric='angular'):
    """
    Build an Annoy index based on the image feature vectors.

    Args:
        image_features (list): A list of dictionaries with image paths and feature vectors.
        n_trees (int): Number of trees for the Annoy index.
        metric (str): Distance metric used by Annoy.

    Returns:
        tuple: An AnnoyIndex instance and a list of image paths.
    """
    dim = len(image_features[0]["vector"])
    index = AnnoyIndex(dim, metric)

    image_paths = [item["path"] for item in image_features]
    for i, item in enumerate(image_features):
        index.add_item(i, item["vector"])

    index.build(n_trees)
    return index, image_paths


def find_similar_images(image_paths, image_features_list, index, all_image_paths, n_results=10):
    """
    Find similar images based on the provided image paths.

    Args:
        image_paths (list): List of image paths to find similar images for.
        image_features_list (list): A list of dictionaries with image paths and feature vectors.
        index (AnnoyIndex): An Annoy index built with the image features.
        all_image_paths (list): A list of all image paths.
        n_results (int): Number of similar images to return.

    Returns:
        list: A list of dictionaries containing the similar image paths and their distances.
    """
    image_features = {item["path"]: item["vector"] for item in image_features_list}
    feature_vectors = []

    for image_path in image_paths:
        if image_path not in image_features:
            print(f"Image not found in the feature database: {image_path}")
            continue
        feature_vectors.append(image_features[image_path])

    if not feature_vectors:
        print("No valid image paths provided.")
        return []  # Ensure an empty list is returned when there are no valid image paths

    # Calculate the average feature vector
    avg_feature_vector = np.mean(feature_vectors, axis=0)

    # Find similar images based on the average feature vector
    nearest_indices, distances = index.get_nns_by_vector(avg_feature_vector, n_results, include_distances=True)

    similar_image_paths = [all_image_paths[i] for i in nearest_indices]

    # Create a list of dictionaries with image paths and distances
    result_list = [{'image_path': path, 'distance': distance} for path, distance in zip(similar_image_paths, distances)]

    # Sort the list by distance
    result_list.sort(key=lambda x: x['distance'])

    return result_list
