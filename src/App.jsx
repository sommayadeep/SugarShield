import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Onboarding from './components/Onboarding'
import Dashboard from './components/Dashboard'
import { storage } from './utils/storage'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [particles, setParticles] = useState([])

  useEffect(() => {
    const userData = storage.getUserData()
    setUser(userData)
    setLoading(false)
  }, [])

  // Track mouse movement for liquid effects
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY })

      // Create particle burst on mouse move
      if (Math.random() > 0.8) {
        const newParticle = {
          id: Math.random(),
          x: e.clientX,
          y: e.clientY,
          life: 1
        }
        setParticles(prev => [...prev, newParticle].slice(-20))
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  if (loading) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 relative overflow-hidden">
      {/* Robot Skeleton Framework */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">

        {/* Central Robot Skeleton */}
        <svg className="absolute inset-0 w-full h-full opacity-15" preserveAspectRatio="none">
          {/* Spine */}
          <motion.line
            x1="50%"
            y1="0%"
            x2="50%"
            y2="100%"
            stroke="url(#skelGradient1)"
            strokeWidth="3"
            animate={{ opacity: [0.2, 0.6, 0.2] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          />
          {/* Ribs */}
          {[...Array(6)].map((_, i) => {
            const yPos = 15 + i * 12;
            return (
              <motion.g key={`rib-${i}`}>
                <motion.line
                  x1="40%"
                  y1={`${yPos}%`}
                  x2="60%"
                  y2={`${yPos}%`}
                  stroke="url(#skelGradient2)"
                  strokeWidth="2"
                  animate={{ opacity: [0.15, 0.5, 0.15], strokeWidth: [2, 3, 2] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: i * 0.2 }}
                />
              </motion.g>
            );
          })}
          <defs>
            <linearGradient id="skelGradient1" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ec4899" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#a855f7" stopOpacity="0.8" />
            </linearGradient>
            <linearGradient id="skelGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#ec4899" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.8" />
            </linearGradient>
          </defs>
        </svg>

        {/* Liquid Metal Blobs - Follow Cursor */}
        <motion.div
          animate={{
            x: mousePos.x - 40,
            y: mousePos.y - 40,
            scale: [1, 1.3, 1],
            opacity: [0.4, 0.8, 0.4]
          }}
          transition={{ type: 'spring', stiffness: 500, damping: 30, mass: 0.8 }}
          className="fixed w-20 h-20 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full blur-lg shadow-2xl shadow-pink-500/70 pointer-events-none z-20"
        />

        {/* Secondary Liquid Blob */}
        <motion.div
          animate={{
            x: mousePos.x + 60,
            y: mousePos.y + 60,
            scale: [0.8, 1.2, 0.8],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{ type: 'spring', stiffness: 450, damping: 35, mass: 1 }}
          className="fixed w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full blur-lg shadow-2xl shadow-cyan-400/60 pointer-events-none z-20"
        />

        {/* Burst Particles from Cursor */}
        <motion.div className="fixed inset-0 pointer-events-none z-15">
          {particles.map(particle => (
            <motion.div
              key={particle.id}
              initial={{ opacity: 1, scale: 1, x: particle.x, y: particle.y }}
              animate={{
                opacity: 0,
                scale: 0,
                x: particle.x + (Math.random() - 0.5) * 200,
                y: particle.y + (Math.random() - 0.5) * 200
              }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              className={`absolute w-3 h-3 rounded-full ${Math.random() > 0.5 ? 'bg-pink-500 shadow-lg shadow-pink-500' : 'bg-cyan-400 shadow-lg shadow-cyan-400'
                }`}
            />
          ))}
        </motion.div>

        {/* Neon Grid Lines */}
        <svg className="absolute inset-0 w-full h-full opacity-25" preserveAspectRatio="none">
          <motion.path
            d={`M0,${window.innerHeight * 0.3} L${window.innerWidth},${window.innerHeight * 0.3}`}
            stroke="url(#neonGradient1)"
            strokeWidth="2"
            animate={{
              strokeDashoffset: [0, 100],
              opacity: [0.3, 0.8, 0.3]
            }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          />
          <motion.path
            d={`M0,${window.innerHeight * 0.5} L${window.innerWidth},${window.innerHeight * 0.5}`}
            stroke="url(#neonGradient2)"
            strokeWidth="2"
            animate={{
              strokeDashoffset: [0, 100],
              opacity: [0.3, 0.8, 0.3]
            }}
            transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
          />
          <motion.path
            d={`M0,${window.innerHeight * 0.7} L${window.innerWidth},${window.innerHeight * 0.7}`}
            stroke="url(#neonGradient3)"
            strokeWidth="2"
            animate={{
              strokeDashoffset: [0, 100],
              opacity: [0.2, 0.7, 0.2]
            }}
            transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
          />
          <defs>
            <linearGradient id="neonGradient1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ec4899" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#ec4899" stopOpacity="0.8" />
            </linearGradient>
            <linearGradient id="neonGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#a855f7" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#22d3ee" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#a855f7" stopOpacity="0.8" />
            </linearGradient>
            <linearGradient id="neonGradient3" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#84cc16" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.8" />
            </linearGradient>
          </defs>
        </svg>

        {/* Neon Glow Orbs */}
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.15, 0.35, 0.15]
          }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-pink-500/25 to-purple-600/25 rounded-full blur-3xl shadow-2xl shadow-pink-500/30"
        />

        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.3, 0.1]
          }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-full blur-3xl shadow-2xl shadow-cyan-500/30"
        />

        {/* Flowing Neon Particles */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={`neon-flow-${i}`}
            initial={{ opacity: 0, x: -100, y: Math.random() * window.innerHeight }}
            animate={{
              opacity: [0, 0.6, 0],
              x: [-100, window.innerWidth + 100],
              y: Math.sin(i) * 80
            }}
            transition={{
              duration: 8 + i * 0.5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.8
            }}
            className={`absolute w-2 h-2 rounded-full blur-md shadow-lg ${i % 4 === 0 ? 'bg-pink-500 shadow-pink-500' :
              i % 4 === 1 ? 'bg-cyan-400 shadow-cyan-400' :
                i % 4 === 2 ? 'bg-purple-500 shadow-purple-500' :
                  'bg-lime-400 shadow-lime-400'
              }`}
          />
        ))}

        {/* Tech Hexagon Grid */}
        <svg className="absolute inset-0 w-full h-full opacity-20" preserveAspectRatio="none">
          <pattern id="hexagon" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
            <polygon points="50,10 90,30 90,70 50,90 10,70 10,30" fill="none" stroke="#ec4899" strokeWidth="1.5" opacity="0.5" />
          </pattern>
          <motion.rect
            width="100%"
            height="100%"
            fill="url(#hexagon)"
            animate={{
              opacity: [0.15, 0.4, 0.15]
            }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          />
        </svg>
      </div>

      {/* Content Layer */}
      <div className="relative z-10">
        <AnimatePresence mode="wait">
          {!user ? (
            <motion.div
              key="onboarding"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.5 }}
            >
              <Onboarding onComplete={setUser} />
            </motion.div>
          ) : (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.5 }}
            >
              <Dashboard user={user} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default App
