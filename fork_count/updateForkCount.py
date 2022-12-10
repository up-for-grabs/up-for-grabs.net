import WebScrappingForkCount
import yaml
import os

def updateForkCount(directory):
    # Get a list of files in the directory
    files = os.listdir(directory)
    # Loop through the files
    for file in files:
        # Open the file and do something with its contents
        with open(os.path.join(directory, file), "r") as f:
            data = yaml.load(f, Loader=yaml.FullLoader)
        # Try to update fork count if it exists
        try:
            num = WebScrappingForkCount.scraping(data['upforgrabs']['link'])
            data['stats']['fork-count'] = num
        # Otherwise try the next file
        except:
            continue
        # Update the data file with the new fork count
        with open(os.path.join(directory, file), "w") as file:
            yaml.dump(data, file, sort_keys=False)

updateForkCount("../_data/projects")

