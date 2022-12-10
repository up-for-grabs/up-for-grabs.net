import requests
from bs4 import BeautifulSoup

def scraping(url): 
    try: 
        page = requests.get(url)
        soup = BeautifulSoup(page.content, 'html.parser')
        span = soup.find(id="repo-network-counter")
        return span.text
    except:
        return "-1"

