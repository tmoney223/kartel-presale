import React, { useState, useRef, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import '@rainbow-me/rainbowkit/styles.css';
import {
  getDefaultWallets,
  RainbowKitProvider,
  ConnectButton
} from '@rainbow-me/rainbowkit';
import {
  configureChains,
  createClient,
  WagmiConfig,
  useAccount,
  useBalance
} from 'wagmi';
import { mainnet } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';

// Wallet config
const { chains, provider } = configureChains([mainnet], [publicProvider()]);
const { connectors } = getDefaultWallets({
  appName: 'Kartel Exchange',
  projectId: 'c15464b8daf8151f93cd366810034e5b',
  chains
});
const wagmiClient = createClient({ autoConnect: true, connectors, provider });

const Dashboard = () => {
  const { address, isConnected } = useAccount();
  const [inputUSDC, setInputUSDC] = useState('');
  const [inputRedeem, setInputRedeem] = useState('');
  const [stakeAmount, setStakeAmount] = useState('');

  return (
    <div
  className="min-h-screen bg-black text-white p-6"
  style={{
    backgroundImage: "url('/dashboardbg.png')",
    backgroundSize: 'cover',
    backgroundPosition: 'center'
  }}
>

      {/* Top Logo & Connect */}
      <div className="flex flex-col items-center mb-6">
        <img src="/kartel-logo.png" alt="KARTEL" className="w-80 mb-2 border-4 border-black rounded" />
        <div className="mt-2"><ConnectButton label="Connect Wallet" chainStatus="none" showBalance={false} className="px-6 py-3 text-lg bg-green-600 hover:bg-green-700 rounded" /></div>
        {isConnected && (
          <div className="mt-2 bg-gray-800 px-4 py-2 rounded text-sm border border-gray-600">{address}</div>
        )}
      </div>

      {/* Dashboard Content */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Side */}
        <div className="w-full lg:w-1/2 space-y-6">
          {/* Balances */}
          <div className="bg-gray-900 p-4 rounded border border-gray-700">
            <h2 className="text-xl font-semibold mb-4">BALANCES</h2>
            <div className="space-y-2">
              <p>KARTEL Balance: 3,311.243 ($967.21)</p>
              <p>USDC Balance: 7,733.542 ($7733.542)</p>
              <p>MXND Balance: 66,240.672 ($3312.422)</p>
            </div>
          </div>

          {/* Minting */}
          <div className="bg-gray-900 p-4 rounded border border-gray-700">
            <h2 className="text-xl font-semibold mb-4">MINTING</h2>
            <div className="space-y-4">
              <div>
                <label className="block mb-1">Mint MXND</label>
                <input type="number" value={inputUSDC} onChange={(e) => setInputUSDC(e.target.value)} className="w-full p-2 rounded bg-gray-800 border border-gray-600" placeholder="Enter USDC amount" />
              </div>
              <div>
                <label className="block mb-1">Redeem USDC</label>
                <input type="number" value={inputRedeem} onChange={(e) => setInputRedeem(e.target.value)} className="w-full p-2 rounded bg-gray-800 border border-gray-600" placeholder="Enter MXND amount" />
              </div>
              <a href="#" className="block mt-4 bg-green-700 hover:bg-green-800 text-white text-center py-2 rounded">CREATE KARTEL/MXND LP ON UNISWAP</a>
            </div>
          </div>
        </div>

        {/* Right Side */}
        <div className="w-full lg:w-1/2 space-y-6">
          {/* Bonding */}
          <div className="bg-gray-900 p-4 rounded border border-gray-700">
            <h2 className="text-xl font-semibold mb-4">BONDING</h2>
            <p>KARTEL/MXND Bonding APY: 422.223%</p>
            <p>KARTEL/MXND Balance: 0.0000242223 ($1221.984)</p>
            <p>Pending Rewards: 4659.133 KARTEL ($1397.772)</p>
            <div className="flex items-center justify-between mb-2">
              <p>Available Rewards: 369.223 KARTEL ($110.122)</p>
              <button className="bg-green-700 hover:bg-green-800 text-white px-3 py-1 rounded text-sm">CLAIM</button>
            </div>
            <input type="number" value={stakeAmount} onChange={(e) => setStakeAmount(e.target.value)} className="w-full mt-3 p-2 rounded bg-gray-800 border border-gray-600" placeholder="Enter amount" />
            <button className="mt-4 w-full bg-green-600 hover:bg-green-700 rounded py-2">Bond</button>
          </div>

          {/* Treasury */}
          <div className="bg-gray-900 p-4 rounded border border-gray-700">
            <h2 className="text-xl font-semibold mb-4">TREASURY 0xF08a91c214c42a0F51DE0C5691FDf6Fa37e6E1f2</h2>
            <p>KARTEL/MXND LP: 0.0000331 ($12,229.032)</p>
            <p>KARTEL Balance: 30,4122.223 ($9,123.443)</p>
            <p>USDC Balance: 11,833.876 ($11,833.876)</p>
            <p>MXND Balance: 144,640 ($7232.214)</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider chains={chains}>
        <Dashboard />
      </RainbowKitProvider>
    </WagmiConfig>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
