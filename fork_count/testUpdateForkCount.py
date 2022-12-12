import yaml, os
import updateForkCount, WebScrapingForkCount

def testFileForkCount(directory, file):
    with open(os.path.join(directory, file), "r") as f:
        data = yaml.load(f, Loader=yaml.FullLoader)
    webNum = WebScrapingForkCount.scraping(data['upforgrabs']['link'])
    return webNum == data['stats']['fork-count']
    
def testForkCount():
    directory = "fork_count/tests_sample_projects"
    updateForkCount.updateForkCount(directory)
    files = os.listdir(directory)
    # Loop through the files
    for file in files:
        assert testFileForkCount(directory, file) == True

if __name__ == "__main__":
    testForkCount()
    print("All tests passed")