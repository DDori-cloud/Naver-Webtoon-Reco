import json
try:
    with open('webtoons.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
        print(len(data))
except Exception as e:
    print(e)
