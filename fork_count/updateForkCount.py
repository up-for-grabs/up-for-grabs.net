import WebScrapingForkCount
import yaml
import os

def updateForkCount(directory = "_data/projects"):
    # Get a list of files in the directory
    files = os.listdir(directory)
    # Loop through the files
    for file in files:
        # Open the file and do something with its contents
        with open(os.path.join(directory, file), "r") as f:
            data = yaml.load(f, Loader=yaml.FullLoader)
        # Try to update fork count if it exists
        try:
            num = WebScrapingForkCount.scraping(data['upforgrabs']['link'])
            if (num == "-1"):
                continue
            data['stats']['fork-count'] = num
        # Otherwise try the next file
        except:
            continue
        # Update the data file with the new fork count
        with open(os.path.join(directory, file), "w") as file:
            yaml.dump(data, file, sort_keys=False)

if __name__ == "__main__":
    updateForkCount()
    print("Updated fork count in data files")


