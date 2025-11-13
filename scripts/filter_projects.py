import requests
import yaml
import os

# Criteria
MIN_STARS = 10
MAX_YEARS_IDLE = 2

def get_repo_metadata(repo_url):
    if "github.com/" not in repo_url:
        return None
    api_url = repo_url.replace('https://github.com/', 'https://api.github.com/repos/')
    r = requests.get(api_url)
    if r.status_code != 200:
        return None
    data = r.json()
    return {
        'stars': data.get('stargazers_count', 0),
        'last_pushed': data.get('pushed_at', '')
    }

def is_active(last_pushed):
    from datetime import datetime, timedelta
    if not last_pushed:
        return False
    pushed = datetime.strptime(last_pushed, "%Y-%m-%dT%H:%M:%SZ")
    cutoff = datetime.utcnow() - timedelta(days=MAX_YEARS_IDLE*365)
    return pushed > cutoff

def filter_projects(projects_dir):
    results = []
    for filename in os.listdir(projects_dir):
        if not filename.endswith('.yml'):
            continue
        path = os.path.join(projects_dir, filename)
        with open(path) as f:
            project = yaml.safe_load(f)
        repo_url = project.get('github_url') or project.get('repository')
        meta = get_repo_metadata(repo_url)
        if not meta:
            continue
        if meta['stars'] < MIN_STARS or not is_active(meta['last_pushed']):
            print(f"SKIP: {repo_url} - {meta['stars']} stars, last updated {meta['last_pushed']}")
            continue
        results.append(project)
    return results

if __name__ == '__main__':
    filtered = filter_projects('_data/projects')
    print(f"{len(filtered)} projects left after filtering")

    # To write results to a new file:
    with open('_data/filtered_projects.yml', 'w') as out:
        yaml.dump(filtered, out)
