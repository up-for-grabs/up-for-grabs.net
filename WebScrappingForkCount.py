import requests
from bs4 import BeautifulSoup

def scraping(url): 
    try: 
        page = requests.get(url)
    except:
        return " "
    else:
        soup = BeautifulSoup(page.content, 'html.parser')
        span = soup.find(id="repo-network-counter")
        # print("here: ", span.text) 
        return span.text

# print(scraping('https://github.com/alex-barrios/up-for-grabs.net'))
