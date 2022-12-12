""" This file updates the fork count of the data files"""
import os
import yaml
import web_scraping_fork_count


def update_fork_count(directory = "_data/projects"):
    """ This function updates the fork count of the data files if no other directory is inserted """
    # Get a list of files in the directory
    files = os.listdir(directory)
    # Loop through the files
    for file in files:
        # Open the file 
        with open(os.path.join(directory, file), "r", encoding="utf-8") as file_name:
            data = yaml.load(file_name, Loader=yaml.FullLoader)
        # Try to update fork count if it exists
        try:
            num = web_scraping_fork_count.scraping(data['upforgrabs']['link'])
            if num == "-1":
                continue
            data['stats']['fork-count'] = num
        # Otherwise try the next file
        except:
            continue
        # Update the data file with the new fork count
        with open(os.path.join(directory, file), "w", encoding="utf-8") as file:
            yaml.dump(data, file, sort_keys=False)

if __name__ == "__main__":
    update_fork_count()
    print("Updated fork count in data files")
