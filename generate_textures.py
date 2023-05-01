import openai
import requests
import os
import constants
from uuid import uuid4
from pprint import pprint

openai.api_key = constants.OPEN_API_KEY

def generate_text_prompt(texture_item, style="realistic"):
    prompt = f"""In need of a touch of artistry for a truly engaging video game, we're seeking DALL-E's assistance in crafting a high-quality texture.
    The texture in question is of '{texture_item}', to be designed in a '{style}' style. 
    It's not just any texture, but one that will be a cornerstone in our '{style}' video game, adding depth and a sense of realism to our virtual world.
    The texture should be rich in detail, carefully considering all the elements that a video game artist would deem vital. 
    It is of the utmost importance that the texture is tile-able, ensuring seamless transitions when applied across surfaces in the game.
    DALL-E, we invite you to breathe life into this texture, weaving it with your innovative charm. 
    Could you provide us with a creative prompt that would spark your imagination to generate such a texture? 
    Let's ensure that the prompt consists of grammatically sound sentences, keeping the communication clear and precise."""


    response = openai.Completion.create(
        engine="text-davinci-002",
        prompt=prompt,
        max_tokens=350,
        n=1,
        stop=None,
        temperature=0.7,
        
    )

    generated_prompt = response.choices[0].text.strip()
    return generated_prompt

def generate_image(prompt):
    response = openai.Image.create(
        prompt=prompt,
        n=1,
        size="256x256",
    )

    return response['data'][0]['url']

def save_image(url, filename):
    response = requests.get(url)
    with open(filename, "wb") as file:
        file.write(response.content)

def generate_texture(texture_item, iterations=1, style="realistic"):
    os.makedirs("static/images", exist_ok=True)
    failures = []
    text_prompt = ""
    for i in range(int(iterations)):
        try:
            text_prompt = ""
            text_prompt = generate_text_prompt(texture_item, style=str(style))
            print(f"prompt: {text_prompt}")
            image_url = generate_image(text_prompt)
            image_filename = f"static/images/{uuid4()}.jpg"

            save_image(image_url, image_filename)
            print(f"Saved image for {texture_item} in {image_filename}")
        except:
            failures.append(f"failed to generate texture item:{texture_item} with prompt:\n{text_prompt}")
    return failures

def main():
    texture_items = [
        "brick_wall",
        "wood_grain",
        "marble",
        "sand",
        "concrete",
        "rusty_metal",
        "cracked_pavement",
        "rocky_surface",
        "carpet",
        "textile_fabric",
        "knitted_cloth",
        "sponge",
        "bamboo",
        "fur",
        "grass",
        "leather",
        "woven_wicker",
        "corrugated_cardboard",
        "ceramic_tiles",
        "stucco",
        "terrazzo",
        "frozen_ice",
        "snow",
        "pebbles",
        "chainmail",
        "asphalt",
        "scales",
        "cobbled_stone",
        "honeycomb",
        "denim",
        "burlap",
        "straw",
        "moss",
        "lava",
        "slate",
        "tree_bark",
        "chipped_paint",
        "feathers",
        "velvet",
        "rattan"
    ]
    failures = []
    for texture_item in texture_items:
        failures.extend(generate_texture(texture_item, iterations=1, style="2d 16bit pixel indie"))
    pprint(failures)
    os.system('afplay /System/Library/Sounds/Glass.aiff')

if __name__ == "__main__":
    main()