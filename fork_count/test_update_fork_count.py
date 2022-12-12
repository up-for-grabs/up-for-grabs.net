""" This file tests that fork count is updated properly """
import os
import yaml
import update_fork_count
import web_scraping_fork_count

def test_file_fork_count(directory, file):
    """ This function tests that fork count matches the data file """
    # Open the file
    with open(os.path.join(directory, file), "r", encoding="utf-8") as file_name:
        data = yaml.load(file_name, Loader=yaml.FullLoader)
    # Obtain current fork count on site
    web_num = web_scraping_fork_count.scraping(data['upforgrabs']['link'])
    return web_num == data['stats']['fork-count']

def test_fork_count():
    """ This function tests the fork count in each data file in the directory """
    directory = "fork_count/tests_sample_projects"
    # Update fork count on data file using web scrapping
    update_fork_count.update_fork_count(directory)
    files = os.listdir(directory)
    # Loop through the files
    for file in files:
        assert test_file_fork_count(directory, file)

if __name__ == "__main__":
    test_fork_count()
    print("All tests passed")
