import { useState, useEffect, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import TriGrid3D from '../components/TriGrid3D'
import './LanguageGamePage.css'

// ── Character decks ──────────────────────────────────────────────
const HIRAGANA = [
  ['あ', 'a'], ['い', 'i'], ['う', 'u'], ['え', 'e'], ['お', 'o'],
  ['か', 'ka'], ['き', 'ki'], ['く', 'ku'], ['け', 'ke'], ['こ', 'ko'],
  ['さ', 'sa'], ['し', 'shi'], ['す', 'su'], ['せ', 'se'], ['そ', 'so'],
  ['た', 'ta'], ['ち', 'chi'], ['つ', 'tsu'], ['て', 'te'], ['と', 'to'],
  ['な', 'na'], ['に', 'ni'], ['ぬ', 'nu'], ['ね', 'ne'], ['の', 'no'],
  ['は', 'ha'], ['ひ', 'hi'], ['ふ', 'fu'], ['へ', 'he'], ['ほ', 'ho'],
  ['ま', 'ma'], ['み', 'mi'], ['む', 'mu'], ['め', 'me'], ['も', 'mo'],
  ['や', 'ya'], ['ゆ', 'yu'], ['よ', 'yo'],
  ['ら', 'ra'], ['り', 'ri'], ['る', 'ru'], ['れ', 're'], ['ろ', 'ro'],
  ['わ', 'wa'], ['を', 'wo'], ['ん', 'n'],
].map(([char, ans]) => ({ char, ans }))

const CYRILLIC = [
  ['А', 'a'], ['Б', 'b'], ['В', 'v'], ['Г', 'g'], ['Д', 'd'],
  ['Е', 'ye'], ['Ё', 'yo'], ['Ж', 'zh'], ['З', 'z'], ['И', 'i'],
  ['Й', 'y (jot)'], ['К', 'k'], ['Л', 'l'], ['М', 'm'], ['Н', 'n'],
  ['О', 'o'], ['П', 'p'], ['Р', 'r'], ['С', 's'], ['Т', 't'],
  ['У', 'u'], ['Ф', 'f'], ['Х', 'kh'], ['Ц', 'ts'], ['Ч', 'ch'],
  ['Ш', 'sh'], ['Щ', 'shch'], ['Ъ', 'ʺ hard'], ['Ы', 'y (hard)'], ['Ь', 'ʹ soft'],
  ['Э', 'e'], ['Ю', 'yu'], ['Я', 'ya'],
].map(([char, ans]) => ({ char, ans }))

const LANGUAGES = {
  japanese: {
    label: 'Japanese',
    flag: '🇯🇵',
    sub: 'Hiragana',
    sample: 'あ い う え お',
    deck: HIRAGANA,
    color: '255,45,120',
    accent: '#ff2d78',
  },
  russian: {
    label: 'Russian',
    flag: '🇷🇺',
    sub: 'Cyrillic',
    sample: 'А Б В Г Д',
    deck: CYRILLIC,
    color: '0,229,255',
    accent: '#00e5ff',
  },
}

const QUESTION_TIME = 7000 // ms per question
const LIVES = 3
const TICK = 100 // ms

// Build one question: a character + 4 unique romaji options, shuffled.
function makeQuestion(deck) {
  const correct = deck[Math.floor(Math.random() * deck.length)]
  const options = [correct.ans]
  const pool = deck.filter(d => d.ans !== correct.ans)
  while (options.length < 4 && pool.length) {
    const j = Math.floor(Math.random() * pool.length)
    options.push(pool.splice(j, 1)[0].ans)
  }
  for (let k = options.length - 1; k > 0; k--) {
    const m = Math.floor(Math.random() * (k + 1))
    ;[options[k], options[m]] = [options[m], options[k]]
  }
  return { char: correct.char, ans: correct.ans, options }
}

export default function LanguageGamePage() {
  const [phase, setPhase]       = useState('menu') // 'menu' | 'playing' | 'over'
  const [lang, setLang]         = useState('japanese')
  const [score, setScore]       = useState(0)
  const [streak, setStreak]     = useState(0)
  const [lives, setLives]       = useState(LIVES)
  const [question, setQuestion] = useState(null)
  const [picked, setPicked]     = useState(null)  // { option, correct }
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME)
  const [best, setBest]         = useState(() => Number(localStorage.getItem('lg-best') || 0))
  const lockRef                 = useRef(false)

  const conf = LANGUAGES[lang]

  const startGame = useCallback((langKey) => {
    lockRef.current = false
    setLang(langKey)
    setScore(0)
    setStreak(0)
    setLives(LIVES)
    setQuestion(makeQuestion(LANGUAGES[langKey].deck))
    setPicked(null)
    setTimeLeft(QUESTION_TIME)
    setPhase('playing')
  }, [])

  // Handle an answer (option === null means the timer ran out).
  const resolve = useCallback((option) => {
    if (lockRef.current || !question) return
    lockRef.current = true

    const correct = option != null && option === question.ans
    setPicked({ option, correct })

    if (correct) {
      setScore(s => s + 10 + streak * 5)
      setStreak(s => s + 1)
    } else {
      setStreak(0)
      setLives(l => l - 1)
    }

    const livesAfter = correct ? lives : lives - 1
    setTimeout(() => {
      if (livesAfter <= 0) {
        setPhase('over')
      } else {
        setQuestion(makeQuestion(conf.deck))
        setPicked(null)
        setTimeLeft(QUESTION_TIME)
        lockRef.current = false
      }
    }, 900)
  }, [question, streak, lives, conf])

  // Countdown timer.
  useEffect(() => {
    if (phase !== 'playing' || picked) return
    if (timeLeft <= 0) { resolve(null); return }
    const id = setTimeout(() => setTimeLeft(t => Math.max(0, t - TICK)), TICK)
    return () => clearTimeout(id)
  }, [phase, picked, timeLeft, resolve])

  // Keyboard answering: 1–4.
  useEffect(() => {
    if (phase !== 'playing') return
    const onKey = (e) => {
      const n = parseInt(e.key, 10)
      if (n >= 1 && n <= 4 && question && !picked) resolve(question.options[n - 1])
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [phase, question, picked, resolve])

  // Persist best score.
  useEffect(() => {
    if (phase === 'over' && score > best) {
      setBest(score)
      localStorage.setItem('lg-best', String(score))
    }
  }, [phase, score, best])

  const timePct  = Math.max(0, (timeLeft / QUESTION_TIME) * 100)
  const lowTime  = timePct < 30
  const gridColor = phase === 'menu' ? '0,229,255' : conf.color

  return (
    <div className={`lg-page lg-${lang}`}>
      <TriGrid3D size={52} color={gridColor} radius={3} />

      <div className="lg-shell">

        {/* ── MENU ── */}
        {phase === 'menu' && (
          <div className="lg-menu">
            <span className="lg-tag">🎮 Arcade</span>
            <h1 className="lg-title">Alphabet <span className="lg-title-accent">Arcade</span></h1>
            <p className="lg-lede">
              A letter flashes — pick its sound before the timer drains.
              Build streaks, chase the high score, learn an alphabet for real.
            </p>

            <div className="lg-lang-grid">
              {Object.entries(LANGUAGES).map(([key, l]) => (
                <button
                  key={key}
                  className={`lg-lang-card lg-card-${key}`}
                  onClick={() => startGame(key)}
                >
                  <span className="lg-lang-flag">{l.flag}</span>
                  <span className="lg-lang-name">{l.label}</span>
                  <span className="lg-lang-sub">{l.sub}</span>
                  <span className="lg-lang-sample">{l.sample}</span>
                  <span className="lg-lang-play">Play →</span>
                </button>
              ))}
            </div>

            <div className="lg-menu-foot">
              <span className="lg-best">★ Best score: {best}</span>
              <Link to="/" className="lg-back-link">← Back to BublikStudios</Link>
            </div>
          </div>
        )}

        {/* ── PLAYING ── */}
        {phase === 'playing' && question && (
          <div className="lg-game">
            <div className="lg-hud">
              <div className="lg-hud-cell">
                <span className="lg-hud-label">Score</span>
                <span className="lg-hud-value">{score}</span>
              </div>
              <div className="lg-hud-cell">
                <span className="lg-hud-label">Streak</span>
                <span className={`lg-hud-value ${streak >= 3 ? 'lg-streak-hot' : ''}`}>
                  {streak >= 3 ? '🔥' : ''} ×{streak}
                </span>
              </div>
              <div className="lg-hud-cell">
                <span className="lg-hud-label">Lives</span>
                <span className="lg-hud-value lg-hearts">
                  {Array.from({ length: LIVES }, (_, i) => (
                    <span key={i} className={i < lives ? 'lg-heart' : 'lg-heart lg-heart-lost'}>
                      {i < lives ? '♥' : '♡'}
                    </span>
                  ))}
                </span>
              </div>
            </div>

            <div className="lg-timer">
              <div
                className="lg-timer-fill"
                style={{
                  width: `${timePct}%`,
                  background: lowTime ? '#ff2d78' : conf.accent,
                  boxShadow: `0 0 12px ${lowTime ? '#ff2d78' : conf.accent}`,
                }}
              />
            </div>

            <div
              className={
                'lg-char-panel' +
                (picked ? (picked.correct ? ' lg-correct' : ' lg-wrong') : '') +
                (streak >= 3 ? ' lg-hot' : '')
              }
            >
              <span className="lg-char">{question.char}</span>
              <span className="lg-char-hint">{conf.label} · {conf.sub}</span>
            </div>

            <div className="lg-options">
              {question.options.map((opt, i) => {
                let state = ''
                if (picked) {
                  if (opt === question.ans) state = ' lg-opt-correct'
                  else if (opt === picked.option) state = ' lg-opt-wrong'
                  else state = ' lg-opt-dim'
                }
                return (
                  <button
                    key={opt}
                    className={`lg-opt${state}`}
                    onClick={() => resolve(opt)}
                    disabled={!!picked}
                  >
                    <span className="lg-opt-key">{i + 1}</span>
                    <span className="lg-opt-text">{opt}</span>
                  </button>
                )
              })}
            </div>

            <button className="lg-quit" onClick={() => setPhase('menu')}>Quit</button>
          </div>
        )}

        {/* ── GAME OVER ── */}
        {phase === 'over' && (
          <div className="lg-over">
            <span className="lg-tag">Game Over</span>
            <h2 className="lg-over-score">{score}</h2>
            <p className="lg-over-label">points · {conf.label}</p>
            <p className="lg-over-best">
              {score >= best && score > 0 ? '🏆 New best score!' : `★ Best: ${best}`}
            </p>
            <div className="lg-over-actions">
              <button className="lg-btn lg-btn-primary" onClick={() => startGame(lang)}>
                Play again
              </button>
              <button className="lg-btn" onClick={() => setPhase('menu')}>
                Change language
              </button>
            </div>
            <Link to="/" className="lg-back-link">← Back to BublikStudios</Link>
          </div>
        )}

      </div>
    </div>
  )
}
