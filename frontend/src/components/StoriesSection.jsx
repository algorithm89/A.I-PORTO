import './StoriesSection.css'
import TronGrid from './TronGrid'
import pic8  from '../assets/PIC8.jpg'
import pic4  from '../assets/PIC4.png'
import pic7  from '../assets/PIC7.jpg'
import pic10 from '../assets/PIC10.png'



function StoriesSection() {
  const cards = [
    { id:1, tag:'AI & MLOps',  color:'cyan',   icon:'🤖', title:'MLOps / A.I Tutorials',  desc:'Deep dives into machine learning pipelines, models, and real-world AI you can actually use.', img:pic8,  imgPos:'center 15%' },
    { id:2, tag:'About Me',    color:'pink',   icon:'✨', title:'About Me',                desc:'The story behind BublikStudios — math, cartoons, code and a love for learning.', img:pic4,  imgPos:'center 10%' },
    { id:3, tag:'Inner Compass',color:'purple', icon:'🧭', title:'Inner Compass Blog',     desc:'Personal reflections on growth, creativity and navigating life with curiosity.', img:pic7,  imgPos:'center 10%' },
    { id:4, tag:'Cartoon Blog', color:'yellow', icon:'🎨', title:'Cartoon Blog', desc:'Hand-drawn stories and illustrated posts — where imagination runs the show.', img:pic10, imgPos:'center 70%' },
  ]

  return (
    <section className="explore-section" id="stories">
      <TronGrid cellSize={55} color="255,45,120" radius={3} />
      <div className="container" style={{position:'relative', zIndex:1}}>
        <div className="sec-header">
          <span className="sec-tag sec-tag-pink">✦ Explore</span>
          <h2 className="sec-title">What's <span className="gradient-text">Inside</span></h2>
          <p className="sec-sub">Stories, AI tutorials, cartoon blogs and more — all in one place.</p>
        </div>
        <div className="explore-grid">
          {cards.map(c => (
            <div key={c.id} className={`ex-card ex-${c.color}`}>
              <div className="ex-img-wrap">
                <img src={c.img} alt={c.title} className="ex-img" style={{objectPosition: c.imgPos}} />
                <div className="ex-img-overlay">
                  <h3 className="ex-img-title">{c.title}</h3>
                </div>
              </div>
              <div className="ex-body">
                <p className="ex-desc">{c.desc}</p>
                <a href="#" className="ex-link">Explore →</a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default StoriesSection



