import json
import re

def extract_tags_from_description(description):
    if not description:
        return []
    
    # 1. 태그로 키워드 추출 (유니코드로 지정하여 인코딩 문제 방지)
    keywords = [
        "회귀", "빙의", "환생", "먼치킨", "사이다", "복수", "성장", "힐링", 
        "학원", "학교", "오피스", "회사", "아이돌", "연예계", "게임", "시스템",
        "무협", "판타지", "로맨스", "스릴러", "추리", "미스터리", "공포",
        "일상", "개그", "코믹", "감동", "스포츠", "이세계", "빙의물", "회귀물",
        "조직", "느와르", "범죄", "정치", "역사", "시대극", "서스펜스", "두뇌"
    ]
    
    found_tags = []
    
    # 2. 키워드 매칭
    for kw in keywords:
        if kw in description:
            found_tags.append(kw)
    
    # 3. "~물" 패턴 추출
    suffix_matches = re.findall(r'([가-힣]+물)', description)
    for match in suffix_matches:
        if len(match) > 1 and match not in found_tags:
            found_tags.append(match)
            
    return found_tags

def process_and_convert():
    input_file = 'webtoons.json'
    output_file = 'data.js'
    
    print("Reading webtoons.json...")
    try:
        with open(input_file, 'r', encoding='utf-8') as f:
            webtoons = json.load(f)
        
        print(f"Analyzing descriptions for {len(webtoons)} webtoons...")
        
        for w in webtoons:
            desc = w.get('description', "")
            extracted = extract_tags_from_description(desc)
            
            original_tags = w.get('tags', [])
            # 기존 태그 문구 정제 (숫자나 특수문자만 있는 경우 등 제외 가능)
            combined_tags = list(set(original_tags + extracted))
            
            w['tags'] = combined_tags
            
        js_content = f"window.WEBTOON_DATA = {json.dumps(webtoons, ensure_ascii=False, indent=2)};"
        
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(js_content)
            
        print(f"Successfully converted and saved to {output_file}")
        
    except FileNotFoundError:
        print("Error: webtoons.json not found.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    process_and_convert()
