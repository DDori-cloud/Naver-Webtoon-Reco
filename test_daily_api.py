import requests
import json

def test_daily_plus():
    url = "https://comic.naver.com/api/webtoon/titlelist/dailyPlus"
    try:
        response = requests.get(url, headers={'User-Agent': 'Mozilla/5.0'})
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print("Keys in response:", data.keys())
            if 'titleListMap' in data:
                print("Days in titleListMap:", data['titleListMap'].keys())
                for day, day_list in data['titleListMap'].items():
                    print(f"Example item from {day}:", day_list[0] if day_list else "Empty")
                    break
            else:
                print("titleListMap not found in response")
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Exception: {e}")

if __name__ == "__main__":
    test_daily_plus()
