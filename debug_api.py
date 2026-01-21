import requests
import json

def test_daily_plus_debugging():
    # 시도해볼 후보 URL들
    urls = [
        "https://comic.naver.com/api/webtoon/titlelist/dailyPlus",
        "https://comic.naver.com/api/webtoon/titlelist/dailyplus", # 소문자 케이스
        "https://comic.naver.com/api/webtoon/titlelist/weekday?week=dailyPlus" # 쿼리 파라미터 방식
    ]
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://comic.naver.com/webtoon?tab=dailyPlus'
    }

    for url in urls:
        print(f"\nTesting URL: {url}")
        try:
            response = requests.get(url, headers=headers)
            print(f"Status Code: {response.status_code}")
            if response.status_code == 200:
                data = response.json()
                # 구조 파악을 위해 키값 출력
                print(f"Response keys: {list(data.keys())}")
                if 'titleListMap' in data:
                    count = sum(len(v) for v in data['titleListMap'].values())
                    print(f"SUCCESS! Found {count} webtoons in titleListMap")
                    return # 성공하면 종료
                elif 'titleList' in data:
                    print(f"SUCCESS! Found {len(data['titleList'])} webtoons in titleList")
                    return
            else:
                print(f"Failed with status: {response.status_code}")
        except Exception as e:
            print(f"Error testing {url}: {e}")

if __name__ == "__main__":
    test_daily_plus_debugging()
