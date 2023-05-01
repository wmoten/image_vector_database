import os
import json
import constants
import glob

def get_files_sorted_by_date(folder_path="static/images"):
    files = glob.glob(f"{folder_path}/*.jpg")
    files.sort(key=os.path.getctime, reverse=True)
    return files

def compare_cache_and_files(file_list=get_files_sorted_by_date(), 
                            cache_file_path=constants.CACHE_PATH,):
    with open(cache_file_path, 'r') as cache_file:
        cache_data = json.load(cache_file)

    cache_keys = set(item["path"] for item in cache_data)
    file_set = set(file_list)

    found_in_cache = list(file_set.intersection(cache_keys))
    not_found_in_cache = list(file_set.difference(cache_keys))
    return remove_static_from_path(found_in_cache), remove_static_from_path(not_found_in_cache)

def remove_static_from_path(files):
    # Remove the "static" folder from the path
    files.sort(key=os.path.getctime, reverse=True)
    return [file.replace("static/", "") for file in files]

def delete_image(image_path, cache_file_path=constants.CACHE_PATH,):
    # Remove the image file
    if os.path.exists(image_path):
        os.remove(image_path)
    else:
        print(f"The file {image_path} does not exist.")

    # Load cache data
    with open(cache_file_path, 'r') as cache_file:
        cache_data = json.load(cache_file)

    # Find the index of the item with the matching path
    index_to_remove = -1
    for i, item in enumerate(cache_data):
        if item["path"] == image_path:
            index_to_remove = i
            break

    # Remove the item from the cache data
    if index_to_remove >= 0:
        cache_data.pop(index_to_remove)

        # Save the updated cache data
        with open(cache_file_path, 'w') as cache_file:
            json.dump(cache_data, cache_file)
    else:
        print(f"The file {image_path} is not present in the cache.")
