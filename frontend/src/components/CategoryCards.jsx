import { Link } from 'react-router-dom'
import './CategoryCards.css'
import picAbout     from '../assets/PIC4.png'
import picTutorials from '../assets/PIC24.png'
import picBlog      from '../assets/PIC9.jpg'

const CATEGORIES = [
  {
    id: 1,
    color: 'pink',
    title: 'About',
    desc: 'Who is behind BublikStudios? A curious mind at the intersection of technology, creativity and self-discovery. Come say hi.',
    label: 'Get to know me',
    href: '/#about',
    img: picAbout,
  },
  {
    id: 2,
    color: 'cyan',
    title: 'MLOps / A.I Tutorials',
    desc: 'Hands-on guides covering Machine Learning, MLOps pipelines, local AI with Ollama, neural networks and everything in between.',
    label: 'Start learning',
    to: '/tutorials',
    img: picTutorials,
  },
  {
    id: 3,
    color: 'yellow',
    title: 'Inner Compass Blog',
    desc: 'Reflections on mindset, growth and finding direction. Writing from the heart about the inner journey that runs alongside the tech one.',
    label: 'Read the blog',
    to: '/blog',
    img: picBlog,
  },
]

function CategoryCards() {
  return (
    <section className="categories-section" id="categories">
      <div className="container">

        <div className="sec-header">
          <span className="sec-tag sec-tag-pink">📚 Explore</span>
          <h2 className="sec-title">What's <span className="gradient-text">Inside</span></h2>
          <p className="sec-sub">Three spaces, one studio — pick your path.</p>
        </div>

        <div className="cat-grid">
          {CATEGORIES.map(cat => (
            <div key={cat.id} className={`cat-card cat-${cat.color}`}>

              {/* Real image */}
              <div className="cat-img-wrap">
                <img src={cat.img} alt={cat.title} className="cat-img" />
              </div>

              <div className="cat-body">
                <span className={`cat-badge cat-badge-${cat.color}`}>{cat.title}</span>
                <p className="cat-desc">{cat.desc}</p>
                {cat.to
                  ? <Link to={cat.to} className={`cat-btn cat-btn-${cat.color}`}>{cat.label} →</Link>
                  : <a href={cat.href} className={`cat-btn cat-btn-${cat.color}`}>{cat.label} →</a>
                }
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  )
}

export default CategoryCards
