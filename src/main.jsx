import React, { useState, useRef, useMemo } from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import '@rainbow-me/rainbowkit/styles.css'
import {
  getDefaultWallets,
  RainbowKitProvider,
  ConnectButton
} from '@rainbow-me/rainbowkit'
import {
  configureChains,
  createClient,
  WagmiConfig,
  useAccount,
  useBalance
} from 'wagmi'
import { mainnet } from 'wagmi/chains'
import { publicProvider } from 'wagmi/providers/public'
import Particles from 'react-tsparticles'

// ✅ PARTICLES BACKGROUND (used in PasswordGate only)
const ParticlesBackground = () => {
  const particlesOptions = useMemo(() => ({
    fullScreen: { enable: true, zIndex: -1 },
    background: { color: '#000' },
    interactivity: { events: { onClick: { enable: false } } },
    particles: {
      number: { value: 50 },
      shape: {
        type: 'image',
        image: [
          { src: `${window.location.origin}/cocaine-brick.png`, width: 32, height: 32 },
          { src: `${window.location.origin}/money-stack.png`, width: 32, height: 32 }
        ]
      },
      size: { value: 36 },
      move: {
        enable: true,
        speed: 1,
        direction: 'none',
        outModes: { default: 'bounce' }
      },
      opacity: { value: 1 }
    },
    detectRetina: true
  }), [])

  return (
    <Particles
      id="tsparticles"
      init={async (main) => {
        const { loadImageShape } = await import('tsparticles-shape-image')
        const { loadFull } = await import('tsparticles')
        await loadFull(main)
        await loadImageShape(main)
      }}
      options={particlesOptions}
      className="absolute top-0 left-0 w-full h-full"
    />
  )
}

// 🔧 WALLET CONFIG
const { chains, provider } = configureChains([mainnet], [publicProvider()])
const { connectors } = getDefaultWallets({
  appName: 'Kartel Presale',
  projectId: 'c15464b8daf8151f93cd366810034e5b',
  chains
})
const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider
})

// 🔐 PASSWORD ENTRY
const PasswordGate = ({ onAccess, startMusic }) => {
  const [input, setInput] = useState('')
  const [error, setError] = useState(false)
  const [animateLogo, setAnimateLogo] = useState(false)

  const cashExplosionRef = useRef(null)
  const brickExplosionRef = useRef(null)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (input === 'kartel2024') {
      if (cashExplosionRef.current) {
        cashExplosionRef.current.classList.add('explode')
        cashExplosionRef.current.style.opacity = 1
      }
      if (brickExplosionRef.current) {
        brickExplosionRef.current.classList.add('explode')
        brickExplosionRef.current.style.opacity = 1
      }

      startMusic()
      setAnimateLogo(true)
      setTimeout(() => {
        onAccess(true)
      }, 1500)
    } else {
      setError(true)
    }
  }

  return (
    <div
      className="relative min-h-screen flex flex-col items-center justify-center text-white px-4 overflow-hidden"
      style={{
        backgroundImage: "url('/entry-desert-suvs.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Floating particles ONLY on entry page */}
      <ParticlesBackground />

      {/* Explosions */}
      <div
        ref={cashExplosionRef}
        className="absolute inset-0 z-20 pointer-events-none bg-repeat bg-contain opacity-0"
        style={{ backgroundImage: `url('/money-stack.png')` }}
      />
      <div
        ref={brickExplosionRef}
        className="absolute inset-0 z-10 pointer-events-none bg-repeat bg-contain opacity-0"
        style={{ backgroundImage: `url('/cocaine-brick.png')` }}
      />

      {/* Logo */}
      <div className="bg-black/70 border border-gray-600 p-4 rounded-xl mb-10 z-10">
        <img
          src={`${window.location.origin}/kartel-logo.png`}
          alt="KARTEL"
          className={`w-[420px] sm:w-[540px] drop-shadow-2xl transition-all duration-[2000ms] ${
            animateLogo
              ? 'opacity-0 scale-125 blur-sm'
              : 'animate-fade-in-slow animate-pulse'
          }`}
        />
      </div>

      {/* Password Form */}
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 w-full max-w-xs z-10"
      >
        <input
          type="password"
          placeholder="Enter Password"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="p-3 rounded bg-gray-800 border border-gray-600 text-white w-full"
        />
        <button
          type="submit"
          className="p-3 bg-green-600 rounded hover:bg-green-700 w-full"
        >
          Enter
        </button>
        {error && <p className="text-red-500 text-sm">Incorrect password. Try again.</p>}
      </form>
    </div>
  )
}

// 💼 DASHBOARD
const Dashboard = ({ toggleAudio, isPlaying }) => {
  const { address, isConnected } = useAccount()
  const { data: usdcBalance } = useBalance({
    addressOrName: address,
    token: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    watch: true
  })

  const [contribution, setContribution] = useState('')
  const [pendingKartel, setPendingKartel] = useState(0)
  const KARTEL_RATE = 1000

  const handleContribute = () => {
    const usdc = parseFloat(contribution)
    if (!isNaN(usdc)) {
      setPendingKartel(usdc * KARTEL_RATE)
    }
  }

  return (
    <div className="min-h-screen text-white p-6 relative overflow-hidden">
      {/* DASHBOARD BACKGROUND IMAGE */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: "url('/dashboard-background.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />

      <img
        src="/dashboard-logo.png"
        alt="Dashboard Logo"
        className="w-[500px] mx-auto mb-6 z-10 relative"
      />

      <video
        src="/cartel-intro.mp4"
        autoPlay
        muted
        loop
        playsInline
        className="w-full max-w-3xl mx-auto mb-8 rounded-lg shadow-lg z-10 relative"
      />

      {/* Connect + Audio Button */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10 z-10 relative">
        <ConnectButton />
        <button
          onClick={toggleAudio}
          className="bg-white text-black px-4 py-2 rounded text-sm hover:bg-gray-300 transition"
        >
          {isPlaying ? 'Pause' : 'Play'} Music
        </button>
      </div>

      {isConnected ? (
        <div className="max-w-md w-full space-y-6 z-10 relative">
          <div>
            <p className="text-sm text-gray-400">Wallet Address</p>
            <p className="break-all">{address}</p>
          </div>

          <div>
            <p className="text-sm text-gray-400">USDC Balance</p>
            <p>{usdcBalance ? `${usdcBalance.formatted} USDC` : 'Loading...'}</p>
          </div>

          <div>
            <label className="block mb-1 text-sm text-gray-300">Contribute USDC</label>
            <input
              type="number"
              min="0"
              value={contribution}
              onChange={(e) => setContribution(e.target.value)}
              placeholder="Enter amount"
              className="w-full p-2 bg-gray-800 rounded border border-gray-700"
            />
            <button
              onClick={handleContribute}
              className="mt-3 w-full p-2 bg-green-600 rounded hover:bg-green-700"
            >
              Submit Contribution
            </button>
          </div>

          <div>
            <p className="text-sm text-gray-400">Pending $KARTEL</p>
            <p className="text-lg font-semibold">{pendingKartel.toLocaleString()} KARTEL</p>
          </div>
        </div>
      ) : (
        <p className="text-center mt-10 text-gray-400 z-10">Connect your wallet to continue.</p>
      )}
    </div>
  )
}

// 🧠 APP ROOT
const App = () => {
  const [access, setAccess] = useState(false)
  const audioRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)

  const startMusic = () => {
    if (audioRef.current) {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {})
    }
  }

  const toggleAudio = () => {
    if (!audioRef.current) return
    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {})
    }
  }

  return (
    <>
      <audio ref={audioRef} src="/kartel-theme.mp3" preload="auto" loop />
      {access ? (
        <Dashboard toggleAudio={toggleAudio} isPlaying={isPlaying} />
      ) : (
        <PasswordGate onAccess={setAccess} startMusic={startMusic} />
      )}
    </>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider chains={chains}>
        <App />
      </RainbowKitProvider>
    </WagmiConfig>
  </React.StrictMode>
)
