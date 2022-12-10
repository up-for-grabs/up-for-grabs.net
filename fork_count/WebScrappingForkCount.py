import requests
from bs4 import BeautifulSoup

def scraping(url): 
    try: 
        page = requests.get(url)
    except:
        return -1
    else:
        soup = BeautifulSoup(page.content, 'html.parser')
        span = soup.find(id="repo-network-counter")
        return int(span.text)

