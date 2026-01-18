import json

input_file = 'webtoons.json'
output_file = 'data.js'

try:
    with open(input_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    js_content = f"window.WEBTOON_DATA = {json.dumps(data, ensure_ascii=False, indent=2)};"
    
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(js_content)
        
    print(f"Successfully converted {input_file} to {output_file} with UTF-8 encoding.")

except Exception as e:
    print(f"Error: {e}")
