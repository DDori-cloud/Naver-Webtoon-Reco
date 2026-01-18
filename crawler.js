const https = require('https');
const fs = require('fs');

const OUTPUT_FILE = 'webtoons.json';

// --- API Endpoints ---
const WEEKDAY_API = "https://comic.naver.com/api/webtoon/titlelist/weekday";
const FINISHED_API = "https://comic.naver.com/api/webtoon/titlelist/finished";


function fetchJson(url) {
    return new Promise((resolve, reject) => {
        https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
            let data = '';

            if (res.statusCode !== 200) {
                res.resume();
                return reject(new Error(`Failed to fetch ${url}. Status Code: ${res.statusCode}`));
            }

            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(e);
                }
            });
        }).on('error', reject);
    });
}

async function fetchOngoing() {
    console.log("Fetching ongoing webtoons...");
    try {
        const data = await fetchJson(WEEKDAY_API);
        const webtoons = [];
        if (data.titleListMap) {
            for (const day in data.titleListMap) {
                const list = data.titleListMap[day];
                list.forEach(item => {
                    webtoons.push({
                        titleId: item.titleId,
                        title: item.titleName,
                        author: item.author,
                        thumbnail: item.thumbnailUrl,
                        status: 'ONGOING',
                        genres: [], // Naver API doesn't give genres here easily, will infer or leave empty
                        tags: [day], // Add day as tag
                        description: "" // Description requires detail fetch, skipping for speed
                    });
                });
            }
        }
        return webtoons;
    } catch (e) {
        console.error("Error fetching ongoing:", e.message);
        return [];
    }
}

async function fetchFinished() {
    console.log("Fetching finished webtoons (sampling first 3 pages)..."); // Fetching all 60+ pages might be too slow/blocked
    const webtoons = [];
    const MAX_PAGES = 5; // Fetch first 5 pages to get ~200 finished webtoons (enough for demo)

    for (let page = 1; page <= MAX_PAGES; page++) {
        process.stdout.write(`Page ${page}... `);
        try {
            const data = await fetchJson(`${FINISHED_API}?page=${page}`);
            if (data.titleList) {
                data.titleList.forEach(item => {
                    webtoons.push({
                        titleId: item.titleId,
                        title: item.titleName,
                        author: item.author,
                        thumbnail: item.thumbnailUrl,
                        status: 'FINISHED',
                        genres: [],
                        tags: ['완결'],
                        description: ""
                    });
                });
            } else {
                break;
            }
            // Simple delay to be polite
            await new Promise(r => setTimeout(r, 200));
        } catch (e) {
            console.error(`Error on page ${page}:`, e.message);
        }
    }
    console.log(`\nCollected ${webtoons.length} finished webtoons.`);
    return webtoons;
}

// Simple Auto-Tagging based on title/author to make search work better for demo
function enhanceData(webtoons) {
    return webtoons.map(w => {
        // Mock genres for demo purposes since API doesn't return them in list view
        const mockGenres = ["드라마", "로맨스", "판타지", "액션", "스릴러", "일상", "개그"];
        // Deterministic random genre based on title length
        const genreIndex = w.title.length % mockGenres.length;
        const genre = mockGenres[genreIndex];

        if (!w.genres.includes(genre)) w.genres.push(genre);

        // Add some random popular tags
        if (w.starScore > 9.9) w.tags.push("인기");

        return w;
    });
}

async function main() {
    const ongoing = await fetchOngoing();
    const finished = await fetchFinished();

    // Deduplicate based on titleId
    const all = [...ongoing, ...finished];
    const uniqueMap = new Map();
    all.forEach(w => uniqueMap.set(w.titleId, w));

    const uniqueWebtoons = Array.from(uniqueMap.values());
    const enhanced = enhanceData(uniqueWebtoons);

    console.log(`Total unique webtoons: ${enhanced.length}`);

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(enhanced, null, 2), 'utf-8');
    console.log(`Saved to ${OUTPUT_FILE}`);
}

main();
