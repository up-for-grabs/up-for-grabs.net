import yaml
import os
# Set the directory path


def createForkCount(directory):
    # Get a list of files in the directory
    files = os.listdir(directory)
    # Loop through the files
    for file in files:
        # Open the file and do something with its contents
        with open(os.path.join(directory, file), "r") as f:
            data = yaml.load(f, Loader=yaml.FullLoader)
            # Add a new row to the field
        try:
            data['stats']['fork-count'] = 0
        except:
            continue
        with open(os.path.join(directory, file), "w") as file:
            yaml.dump(data, file, sort_keys=False)
  

createForkCount("_data/projects")
