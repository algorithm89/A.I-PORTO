import './CartoonBelt.css'
import HexGrid from './HexGrid'
import pic13 from '../assets/PIC13.png'
import pic14 from '../assets/PIC14.png'
import pic15 from '../assets/PIC15.jpg'
import pic16 from '../assets/PIC16.png'
import pic18 from '../assets/PIC18.png'
import pic19 from '../assets/PIC19.png'
import pic20 from '../assets/PIC20.png'


const FAVOURITES = [
  { name: 'Avatar: The Legend of Korra', emoji: '🌊', img: pic13 },
  { name: 'X-Men 97',                   emoji: '⚡', img: pic14 },
  { name: 'Legend of Calamity Jane',    emoji: '🎸', img: pic15 },
  { name: 'Highlander the Series',      emoji: '⚔️', img: pic16 },
  { name: 'Legend of Vox Machina',      emoji: '🐉', img: pic18 },
  { name: 'Mighty Max',                 emoji: '🚀', img: pic19 },
  { name: 'Ninja Scroll',               emoji: '🍃', img: pic20 },
]

function CartoonBelt() {
  return (
    <div className="belt-wrap" id="animation">
      <HexGrid color="255,230,0" radius={3.5} />
      <div className="container" style={{position:'relative', zIndex:1}}>
        <div className="belt-header">
          <span className="sec-tag sec-tag-yellow">🎬 Favourite Animations</span>
          <h2 className="sec-title">Cartoons that <span className="gradient-text-yellow">Inspire Me</span></h2>
          <p className="sec-sub">These shows shaped how I think about storytelling, design and the world.</p>
        </div>
      </div>

      <div className="belt-track-wrap" style={{position:'relative', zIndex:1}}>
        <div className="belt-track">
          {FAVOURITES.map((f, i) => (
            <div key={i} className="belt-card">
              <div className="belt-img-wrap">
                <img src={f.img} alt={f.name} className="belt-img" loading="lazy" />
                <div className="belt-overlay">
                  <span className="belt-emoji">{f.emoji}</span>
                </div>
              </div>
              <div className="belt-name">{f.name}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default CartoonBelt
