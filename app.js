const { useState, useEffect } = React;

// --- Constants ---
const GENRE_CATEGORIES = [
    {
        name: "메인 장르",
        genres: ["로맨스", "판타지", "액션", "스릴러", "드라마", "무협/사극", "개그", "일상", "감성", "스포츠"]
    },
    {
        name: "인기 소재",
        genres: ["먼치킨", "학원물", "로판(로맨스판타지)", "게임판타지", "회귀/빙의", "추리", "공포"]
    },
    {
        name: "스토리 특징",
        genres: ["사이다", "두뇌싸움", "힐링물"]
    }
];

const PREFERENCES = [
    { id: 'romance', label: '달달한 연애물 선호' },
    { id: 'action', label: '화끈한 액션/타격감' },
    { id: 'psychological', label: '심리전/두뇌싸움' },
    { id: 'growth', label: '주인공의 성장 서사' },
    { id: 'dark', label: '어둡고 무거운 분위기' }
];

// Mock Data with Correct Links
const MOCK_WEBTOONS = [
    {
        title: "외모지상주의",
        titleId: "641253",
        tags: ["에피소드", "액션", "박태준", "금요웹툰"],
        description: "어느 날 그에게 일어난 기적 같은 일! 뚱뚱하고 못생겨서 괴롭힘당하던 주인공이 잘생긴 몸을 갖게 되며 벌어지는 이야기.",
        thumbnail: "https://image-comic.pstatic.net/webtoon/641253/thumbnail/thumbnail_IMAG21_d894f11f-668a-4046-8692-730a961f7743.jpg",
        genres: ["액션", "학원물", "드라마"]
    },
    {
        title: "화산귀환",
        titleId: "769209",
        tags: ["사이다", "회귀/빙의", "무협"],
        description: "대 화산파 13대 제자 청명이 아이의 몸으로 다시 살아나 무너진 화산파를 다시 일으키는 사이다 무협물.",
        thumbnail: "https://image-comic.pstatic.net/webtoon/769209/thumbnail/thumbnail_IMAG21_3511196346743900380.jpg",
        genres: ["무협/사극", "액션", "먼치킨"]
    },
    {
        title: "세기말 풋사과 보습학원",
        titleId: "761722",
        tags: ["힐링물", "감성", "성장"],
        description: "치열하게 고민하고 사랑하고 성장하는 90년대 중학생들의 이야기. 순수함과 풋풋함이 가득 담긴 청춘 로맨스.",
        thumbnail: "https://image-comic.pstatic.net/webtoon/761722/thumbnail/thumbnail_IMAG21_9381ea64-884c-4712-a8b5-680456184566.jpg",
        genres: ["로맨스", "일상", "학원물"]
    },
    {
        title: "전지적 독자 시점",
        titleId: "747269",
        tags: ["성좌물", "두뇌싸움", "먼치킨"],
        description: "[오직 나만이, 이 세계의 결말을 알고 있다.] 평범한 회사원 김독자의 세상이 소설 속 내용으로 바뀐다.",
        thumbnail: "https://image-comic.pstatic.net/webtoon/747269/thumbnail/thumbnail_IMAG21_28122349fd894f11.jpg",
        genres: ["판타지", "액션", "게임판타지"]
    },
    {
        title: "내 남편과 결혼해줘",
        titleId: "783060",
        tags: ["사이다", "복수", "로코"],
        description: "믿었던 사람들에게 배신당하고 죽음을 맞이한 강지원. 10년 전으로 돌아가 운명을 개척하고 복수하는 통쾌한 이야기.",
        thumbnail: "https://image-comic.pstatic.net/webtoon/783060/thumbnail/thumbnail_IMAG21_684615a4.jpg",
        genres: ["로맨스", "드라마", "회귀/빙의"]
    },
    {
        title: "명품시대",
        titleId: "720121",
        tags: ["미스테리", "범죄", "스릴러"],
        description: "사람은 왜 짝퉁을 좋아하는가? 짝퉁의 세계에 뛰어든 주인공의 치열한 생존기와 명품의 이면을 다룬 이야기.",
        thumbnail: "https://image-comic.pstatic.net/webtoon/720121/thumbnail/thumbnail_IMAG21_730a961f.jpg",
        genres: ["드라마", "범죄", "스릴러"]
    }
];

// --- Components ---

const ProgressBar = ({ step }) => (
    <div className="mb-12">
        <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
            <div
                className="h-full bg-primary transition-all duration-500 ease-out"
                style={{ width: `${(step / 4) * 100}%` }}
            ></div>
        </div>
        <div className="mt-4 flex justify-between items-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            <span>Progress Analysis</span>
            <span className="text-primary">Step {step} of 4</span>
        </div>
    </div>
);

const WebtoonCard = ({ item }) => (
    <div className="bg-white rounded-3xl overflow-hidden shadow-soft hover:shadow-soft-hover transition-all duration-300 transform hover:-translate-y-2 flex flex-col relative group h-full">
        <div className="absolute top-4 right-4 z-10 bg-primary/90 backdrop-blur-sm text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg">
            {item.matchScore}% Match
        </div>
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
            <img
                src={item.thumbnail}
                referrerPolicy="no-referrer"
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                onError={(e) => { e.target.src = "https://via.placeholder.com/400x300?text=이미지+준비+중"; }}
            />
        </div>
        <div className="p-6 flex flex-col flex-grow">
            <div className="flex flex-wrap gap-1.5 mb-3">
                {item.tags.map((tag, idx) => (
                    <span key={idx} className="text-[10px] font-bold text-primary bg-blue-50 px-2.5 py-1 rounded-md">
                        #{tag}
                    </span>
                ))}
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">{item.title}</h3>
            <p className="text-xs text-gray-500 leading-relaxed mb-6 line-clamp-2">
                {item.description}
            </p>
            <a
                href={`https://comic.naver.com/webtoon/list?titleId=${item.titleId}`}
                target="_blank"
                className="mt-auto w-full py-3.5 bg-primary text-white text-center rounded-2xl font-bold hover:bg-blue-600 transition-all shadow-blue-100 shadow-xl text-sm"
            >
                웹툰 보러가기
            </a>
        </div>
    </div>
);

// --- Main App ---
const App = () => {
    const [step, setStep] = useState(1);
    const [selectedGenres, setSelectedGenres] = useState([]);
    const [prefSettings, setPrefSettings] = useState({});
    const [favWebtoon, setFavWebtoon] = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    const toggleGenre = (genre) => {
        setSelectedGenres(prev =>
            prev.includes(genre) ? prev.filter(g => g !== genre) : [...prev, genre]
        );
    };

    const handleAnalyze = async () => {
        setStep(4);
        setLoading(true);
        // Simulate AI analysis
        await new Promise(r => setTimeout(r, 2000));

        const scored = MOCK_WEBTOONS.map(w => {
            let score = 60 + Math.floor(Math.random() * 20);
            const matchCount = w.genres.filter(g => selectedGenres.includes(g)).length;
            score += (matchCount * 5);
            return { ...w, matchScore: Math.min(score, 99) };
        }).sort((a, b) => b.matchScore - a.matchScore);

        setResults(scored);
        setLoading(false);
    };

    const reset = () => {
        setStep(1);
        setSelectedGenres([]);
        setPrefSettings({});
        setFavWebtoon("");
    };

    return (
        <div className="min-h-screen pb-20 selection:bg-blue-100">
            {/* Nav */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
                <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={reset}>
                        <span className="text-xl">🚀</span>
                        <h1 className="text-lg font-bold tracking-tight">Webtoon<span className="text-primary">AI</span></h1>
                    </div>
                    <button onClick={reset} className="text-xs font-bold text-gray-400 hover:text-primary transition-colors uppercase tracking-widest">
                        Restart
                    </button>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-6 pt-10">
                <ProgressBar step={step} />

                {/* Step 1: Genre Selection */}
                {step === 1 && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <div className="mb-10 text-center">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">좋아하는 장르를 선택해주세요</h2>
                            <p className="text-gray-500 text-sm">취향에 맞는 웹툰을 찾기 위한 첫 단계입니다. (다중 선택 가능)</p>
                        </div>
                        <div className="space-y-8">
                            {GENRE_CATEGORIES.map(cat => (
                                <div key={cat.name} className="space-y-4">
                                    <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2 px-1">
                                        <span className="w-1 h-4 bg-primary rounded-full"></span>
                                        {cat.name}
                                    </h3>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                                        {cat.genres.map(genre => (
                                            <button
                                                key={genre}
                                                onClick={() => toggleGenre(genre)}
                                                className={`py-3 px-4 rounded-2xl text-xs font-semibold transition-all border ${selectedGenres.includes(genre)
                                                    ? "bg-primary text-white border-primary shadow-lg shadow-blue-100 scale-[0.98]"
                                                    : "bg-white text-gray-600 border-gray-100 hover:border-primary/30 hover:bg-blue-50/50"
                                                    }`}
                                            >
                                                #{genre}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-12 flex justify-center">
                            <button
                                disabled={selectedGenres.length === 0}
                                onClick={() => setStep(2)}
                                className="px-12 py-4 bg-primary text-white font-bold rounded-2xl shadow-xl shadow-blue-100 disabled:opacity-30 disabled:shadow-none hover:scale-105 active:scale-95 transition-all"
                            >
                                다음 단계로
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 2: Preferences */}
                {step === 2 && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <div className="mb-10 text-center">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">선호하는 관계 테마</h2>
                            <p className="text-gray-500 text-sm">보고 싶은 이야기의 핵심 모티브를 알려주세요.</p>
                        </div>
                        <div className="max-w-md mx-auto space-y-3">
                            {PREFERENCES.map(p => (
                                <div key={p.id} className="bg-white p-5 rounded-3xl border border-gray-100 flex items-center justify-between shadow-soft">
                                    <span className="text-sm font-bold text-gray-700">{p.label}</span>
                                    <button
                                        onClick={() => setPrefSettings(prev => ({ ...prev, [p.id]: !prev[p.id] }))}
                                        className={`w-12 h-6 rounded-full transition-colors relative ${prefSettings[p.id] ? 'bg-primary' : 'bg-gray-200'}`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${prefSettings[p.id] ? 'left-7' : 'left-1'}`}></div>
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div className="mt-12 flex justify-center gap-4">
                            <button onClick={() => setStep(1)} className="px-8 py-4 bg-gray-100 text-gray-500 font-bold rounded-2xl">이전</button>
                            <button onClick={() => setStep(3)} className="px-12 py-4 bg-primary text-white font-bold rounded-2xl shadow-xl shadow-blue-100">다음 단계로</button>
                        </div>
                    </div>
                )}

                {/* Step 3: Input */}
                {step === 3 && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <div className="mb-10 text-center">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">인생 웹툰을 알려주세요</h2>
                            <p className="text-gray-500 text-sm">가장 재미있게 본 제목 하나만 알려주시면 정교하게 분석합니다.</p>
                        </div>
                        <div className="max-w-md mx-auto">
                            <input
                                type="text"
                                value={favWebtoon}
                                onChange={(e) => setFavWebtoon(e.target.value)}
                                placeholder="예: 화산귀환, 유미의 세포들..."
                                className="w-full p-5 rounded-3xl border-2 border-gray-100 focus:border-primary focus:ring-4 focus:ring-blue-50 outline-none transition-all text-sm font-semibold"
                            />
                        </div>
                        <div className="mt-12 flex justify-center gap-4">
                            <button onClick={() => setStep(2)} className="px-8 py-4 bg-gray-100 text-gray-500 font-bold rounded-2xl">이전</button>
                            <button
                                onClick={handleAnalyze}
                                className="px-12 py-4 bg-primary text-white font-bold rounded-2xl shadow-xl shadow-blue-100"
                            >
                                AI 강제 분석 시작
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 4: Results */}
                {step === 4 && (
                    <div className="animate-in fade-in zoom-in-95 duration-700">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 space-y-6">
                                <div className="w-12 h-12 border-4 border-blue-50 border-t-primary rounded-full animate-spin"></div>
                                <p className="text-gray-500 font-bold animate-pulse">AI가 취향 임베딩을 분석 중입니다...</p>
                            </div>
                        ) : (
                            <div>
                                <div className="text-center mb-12">
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">분석 완료! 이런 웹툰은 어떠세요?</h2>
                                    <p className="text-gray-500 text-sm">사용자의 취향과 줄거리 유사도가 가장 높은 순서입니다.</p>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {results.map((item, idx) => (
                                        <WebtoonCard key={idx} item={item} />
                                    ))}
                                </div>
                                <div className="mt-16 flex justify-center">
                                    <button
                                        onClick={reset}
                                        className="px-10 py-4 bg-white border-2 border-primary text-primary font-bold rounded-2xl hover:bg-blue-50 transition-all shadow-lg"
                                    >
                                        테스트 다시하기
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

// Rendering
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
