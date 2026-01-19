import requests
import json
import time
import os

def fetch_weekday_webtoons():
    """Fetches currently running webtoons (weekday)."""
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
                        'day': day
                    }
                    webtoons.append(webtoon)
        return webtoons
    except Exception as e:
        print(f"Error fetching weekday webtoons: {e}")
        return []

def fetch_finished_webtoons():
    """Fetches finished webtoons by iterating through pages."""
    base_url = "https://comic.naver.com/api/webtoon/titlelist/finished"
    all_finished = []
    page = 1
    
    while True:
        print(f"Fetching finished webtoons page {page}...")
        try:
            response = requests.get(f"{base_url}?page={page}", headers={'User-Agent': 'Mozilla/5.0'})
            response.raise_for_status()
            data = response.json()
            
            if 'titleList' not in data:
                break
                
            page_list = data['titleList']
            if not page_list:
                break
                
            for item in page_list:
                webtoon = {
                    'titleId': item['titleId'],
                    'titleName': item['titleName'],
                    'author': item['author'],
                    'thumbnailUrl': item['thumbnailUrl'],
                    'starScore': item.get('starScore', 0),
                    'viewCount': item.get('viewCount', 0),
                    'status': 'FINISHED'
                }
                all_finished.append(webtoon)
            
            page_info = data.get('pageInfo', {})
            total_pages = page_info.get('totalPages', 0)
            
            if page >= total_pages:
                break
                
            page += 1
            time.sleep(0.1) # Be polite to the server
            
        except Exception as e:
            print(f"Error fetching finished webtoons page {page}: {e}")
            break
            
    return all_finished

def fetch_webtoon_info(title_id):
    """Fetches detailed info including tags and description for a specific webtoon."""
    url = f"https://comic.naver.com/api/article/list/info?titleId={title_id}"
    try:
        response = requests.get(url, headers={'User-Agent': 'Mozilla/5.0'})
        response.raise_for_status()
        data = response.json()
        
        # Extract curation tags
        tags = []
        if 'curationTagList' in data:
            for tag in data['curationTagList']:
                tags.append(tag['tagName'])
        
        # Also check gfpAdCustomParam for generic tags
        if 'gfpAdCustomParam' in data and 'tags' in data['gfpAdCustomParam']:
             tags.extend(data['gfpAdCustomParam']['tags'])
             
        # Dedup
        tags = list(set(tags))
        
        # Extract and clean synopsis (description)
        synopsis = data.get('synopsis', "")
        # Remove newlines and extra spaces by splitting and re-joining with a single space
        description = " ".join(synopsis.split())
        
        return {
            'tags': tags,
            'description': description
        }
    except Exception as e:
        # print(f"Error fetching info for {title_id}: {e}")
        return {'tags': [], 'description': ""}

def main():
    print("Starting Naver Webtoon Crawler (with Tags and Descriptions)...")
    
    # Fetch data
    ongoing_webtoons = fetch_weekday_webtoons()
    print(f"Found {len(ongoing_webtoons)} ongoing webtoons.")
    
    finished_webtoons = fetch_finished_webtoons()
    print(f"Found {len(finished_webtoons)} finished webtoons.")
    
    # Combine
    all_webtoons_map = {}
    for w in ongoing_webtoons:
        all_webtoons_map[w['titleId']] = w
    for w in finished_webtoons:
        all_webtoons_map[w['titleId']] = w
        
    all_webtoons = list(all_webtoons_map.values())
    print(f"Total unique webtoons to process: {len(all_webtoons)}")
    
    # Enrich with Tags and Descriptions
    print("Fetching tags and descriptions for all webtoons (this may take a while)...")
    enriched_webtoons = []
    
    for i, w in enumerate(all_webtoons):
        print(f"[{i+1}/{len(all_webtoons)}] Fetching info for {w['titleName']}...")
        info = fetch_webtoon_info(w['titleId'])
        w['tags'] = info['tags']
        w['description'] = info['description']
        
        # Fallback tagging if empty
        if not w['tags']:
             w['tags'] = [w['day']] if 'day' in w else ['완결']
             
        enriched_webtoons.append(w)
        time.sleep(0.05) # Rate limit
    
    # Save to JSON
    output_file = 'webtoons.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(enriched_webtoons, f, ensure_ascii=False, indent=2)
        
    print(f"Data saved to {output_file}")

if __name__ == "__main__":
    main()
