import WebScrappingForkCount
import yaml
import os
# Set the directory path


def uodateForkCount(directory):
    # Get a list of files in the directory
    files = os.listdir(directory)
    # Loop through the files
    for file in files:
        # Open the file and do something with its contents
        with open(os.path.join(directory, file), "r") as f:
            data = yaml.load(f, Loader=yaml.FullLoader)
            # Add a new row to the field
        try:
            num = WebScrappingForkCount.scraping(data['upforgrabs']['link'])
            print("try adding: ", num)
            data['stats']['fork-count'] = num
        except:
            continue
        with open(os.path.join(directory, file), "w") as file:
            yaml.dump(data, file)
  

uodateForkCount("_data/projects")

