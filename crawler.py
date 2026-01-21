import requests
import json
import time
import os

def fetch_weekday_webtoons():
    """요일별 연재 웹툰 정보를 가져옵니다."""
    url = "https://comic.naver.com/api/webtoon/titlelist/weekday"
    try:
        response = requests.get(url, headers={'User-Agent': 'Mozilla/5.0'})
        response.raise_for_status()
        data = response.json()
        
        webtoons = []
        if 'titleListMap' in data:
            for day, day_list in data['titleListMap'].items():
                for item in day_list:
                    webtoon = {
                        'titleId': item['titleId'],
                        'titleName': item['titleName'],
                        'author': item['author'],
                        'thumbnailUrl': item['thumbnailUrl'],
                        'starScore': item.get('starScore', 0),
                        'viewCount': item.get('viewCount', 0),
                        'status': 'ONGOING',
                        'day': day,
                        'category': 'WEEKDAY'
                    }
                    webtoons.append(webtoon)
        return webtoons
    except Exception as e:
        print(f"Error fetching weekday webtoons: {e}")
        return []

def fetch_daily_plus_webtoons():
    """'매일+'(Daily Plus) 웹툰 정보를 가져옵니다."""
    url = "https://comic.naver.com/api/webtoon/titlelist/weekday?week=dailyPlus&order=user"
    try:
        response = requests.get(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'})
        response.raise_for_status()
        data = response.json()
        
        webtoons = []
        # 매일+는 titleListMap이 아니라 titleList에 바로 배열이 담겨 옵니다.
        if 'titleList' in data:
            for item in data['titleList']:
                webtoon = {
                    'titleId': item['titleId'],
                    'titleName': item['titleName'],
                    'author': item['author'],
                    'thumbnailUrl': item['thumbnailUrl'],
                    'starScore': item.get('starScore', 0),
                    'viewCount': item.get('viewCount', 0),
                    'status': 'ONGOING',
                    'category': 'DAILY_PLUS'
                }
                webtoons.append(webtoon)
        return webtoons
    except Exception as e:
        print(f"Error fetching Daily Plus webtoons: {e}")
        return []

def fetch_finished_webtoons():
    """완결 웹툰 정보를 페이지별로 순회하며 가져옵니다."""
    base_url = "https://comic.naver.com/api/webtoon/titlelist/finished"
    all_finished = []
    page = 1
    
    while True:
        try:
            print(f"완결 웹툰 {page}페이지 수집 중...")
            response = requests.get(f"{base_url}?page={page}", headers={'User-Agent': 'Mozilla/5.0'})
            response.raise_for_status()
            data = response.json()
            
            if 'titleList' not in data: break
                
            page_list = data['titleList']
            if not page_list: break
                
            for item in page_list:
                webtoon = {
                    'titleId': item['titleId'],
                    'titleName': item['titleName'],
                    'author': item['author'],
                    'thumbnailUrl': item['thumbnailUrl'],
                    'starScore': item.get('starScore', 0),
                    'viewCount': item.get('viewCount', 0),
                    'status': 'FINISHED',
                    'category': 'FINISHED'
                }
                all_finished.append(webtoon)
            
            page_info = data.get('pageInfo', {})
            if page >= page_info.get('totalPages', 0): break
                
            page += 1
            time.sleep(0.1)
            
        except Exception as e:
            print(f"Error fetching finished webtoons page {page}: {e}")
            break
            
    return all_finished

def fetch_webtoon_info(title_id):
    """특정 웹툰의 태그와 설명(줄거리)을 가져옵니다."""
    url = f"https://comic.naver.com/api/article/list/info?titleId={title_id}"
    try:
        response = requests.get(url, headers={'User-Agent': 'Mozilla/5.0'})
        response.raise_for_status()
        data = response.json()
        
        tags = [tag['tagName'] for tag in data.get('curationTagList', [])]
        if 'gfpAdCustomParam' in data and 'tags' in data['gfpAdCustomParam']:
             tags.extend(data['gfpAdCustomParam']['tags'])
        
        tags = list(set(tags))
        synopsis = data.get('synopsis', "")
        description = " ".join(synopsis.split())
        
        return {'tags': tags, 'description': description}
    except:
        return {'tags': [], 'description': ""}

def main():
    print("Naver Webtoon Crawler 통합 시작...")
    
    # 1. 각 섹션별 데이터 수집
    ongoing = fetch_weekday_webtoons()
    daily_plus = fetch_daily_plus_webtoons()
    finished = fetch_finished_webtoons()
    
    print(f"일반 연재: {len(ongoing)}개 / 매일+: {len(daily_plus)}개 / 완결: {len(finished)}개")
    
    # 2. 데이터 통합 및 중복 제거 (titleId 기준)
    all_webtoons_map = {}
    
    # 추가하는 순서에 따라 category가 결정됨 (완결 < 매일+ < 요일 연재 순으로 덮어씀)
    # 매일+ 작이 요일 연재에도 있다면 'WEEKDAY'를 우선하도록 설정
    for w in finished:
        all_webtoons_map[w['titleId']] = w
    for w in daily_plus:
        all_webtoons_map[w['titleId']] = w
    for w in ongoing:
        all_webtoons_map[w['titleId']] = w
        
    all_webtoons = list(all_webtoons_map.values())
    total_count = len(all_webtoons)
    print(f"총 중복 제거된 웹툰 수: {total_count}")

    
    # 3. 상세 정보(태그/설명) 추가
    enriched_webtoons = []
    for i, w in enumerate(all_webtoons):
        if i % 50 == 0:
            print(f"진행 상황: [{i}/{total_count}] 데이터 수집 중... ({w['titleName']})")
        
        info = fetch_webtoon_info(w['titleId'])
        w['tags'] = info['tags']
        w['description'] = info['description']
        
        # 태그가 없을 경우 폴백 처리
        if not w['tags']:
             if 'day' in w:
                 w['tags'] = [w['day']]
             else:
                 w['tags'] = ['완결']
             
        enriched_webtoons.append(w)
        time.sleep(0.05)
    
    # 4. JSON 저장
    output_file = 'webtoons.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(enriched_webtoons, f, ensure_ascii=False, indent=2)
        
    print(f"성공! {output_file}에 저장되었습니다.")

if __name__ == "__main__":
    main()
