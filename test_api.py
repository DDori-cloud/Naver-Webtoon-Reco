import requests
try:
    url = "https://comic.naver.com/api/webtoon/titlelist/dailyPlus"
    r = requests.get(url, headers={'User-Agent': 'Mozilla/5.0'})
    print(f"Status: {r.status_code}")
    if r.status_code == 200:
        print("Success!")
        print(r.text[:500])
    else:
        print(f"Failed with status {r.status_code}")
except Exception as e:
    print(f"Error: {e}")
