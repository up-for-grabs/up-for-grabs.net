""" This file obtains the fork count on the website by using BeautifulSoup """
import requests
from bs4 import BeautifulSoup

def scraping(url):
    """ This file obtains the fork count on the repository's website """
    try:
        page = requests.get(url, timeout=20)
        soup = BeautifulSoup(page.content, 'html.parser')
        span = soup.find(id="repo-network-counter")
        return span.text
    except:
        return "-1"
