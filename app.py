from flask import Flask, jsonify, render_template, request
import annoy_query
import app_utils as utils
import os
from generate_textures import generate_texture

app = Flask(__name__)

@app.route('/img-graph')
def img_graph():
    return render_template('render.html')

@app.route('/', methods=['GET', 'POST'])
def index():
    # Process images and extract features
    image_features = annoy_query.process_images(image_folder="static/images")

    # Build Annoy index
    annoy_index, image_paths = annoy_query.build_annoy_index(image_features)

    if request.method == 'POST':
        if 'selected_image' in request.form:

            selected_images = request.form.getlist('selected_image')
            selected_images = [f"static/{img}" for img in selected_images]

            found_in_cache, not_found_in_cache = utils.compare_cache_and_files(selected_images)
            # Call your find_similar_images function here and get the results

            # we generated new files and selected them. We need to recache.
            if not_found_in_cache:
                image_features = annoy_query.process_images(image_folder="static/images", use_cache=False)
                annoy_index, image_paths = annoy_query.build_annoy_index(image_features)

            results = annoy_query.find_similar_images(selected_images, image_features, annoy_index, image_paths)
            return render_template('results.html', results=results)

        elif 'texture' in request.form:
            texture = request.form['texture']
            slider_value = request.form['iterations']
            art_style = request.form['art_style']
            generate_texture(texture, iterations=slider_value, style=art_style)

    found_in_cache, not_found_in_cache = utils.compare_cache_and_files(utils.get_files_sorted_by_date())
    return render_template('index.html', image_files=found_in_cache, not_cached_images=not_found_in_cache)


@app.route('/delete_image', methods=['DELETE'])
def delete_image_route():
    image_paths = request.form.getlist('image_paths[]')
    image_paths = [f"static/images/{img}" for img in image_paths]

    for image_path in image_paths:
        utils.delete_image(image_path)

    return '', 204  # Return 204 No Content status code for a successful DELETE request

@app.route('/find_similar_images', methods=['POST'])
def find_similar_images_route():
    selected_image = request.form['selected_image']

    image_features = annoy_query.process_images(image_folder="static/images")
    annoy_index, image_paths = annoy_query.build_annoy_index(image_features)

    results = annoy_query.find_similar_images([f"{selected_image}"], image_features, annoy_index, image_paths)
    print((results))
    return jsonify(results)

if __name__ == '__main__':
    
    found_in_cache, not_found_in_cache = utils.compare_cache_and_files()
    # check if we need to invoke the model again
    if not_found_in_cache:
        annoy_query.process_images(image_folder="static/images", use_cache=False)
        os.system('afplay /System/Library/Sounds/Glass.aiff')
    app.run(debug=True)
