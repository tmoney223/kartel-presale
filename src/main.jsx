// COMPLETE main.jsx with all features discussed
import React, { useState, useEffect, useMemo } from 'react';
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
  useBalance,
  usePrepareContractWrite,
  useContractWrite
} from 'wagmi';
import { publicProvider } from 'wagmi/providers/public';
import { parseUnits } from 'viem';

const base = {
  id: 8453,
  name: 'Base',
  network: 'base',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://mainnet.base.org'] },
    public: { http: ['https://mainnet.base.org'] },
  },
  blockExplorers: {
    default: { name: 'Basescan', url: 'https://basescan.org' },
  },
};

const KARTEL = "0xC680eca227FC9AB21A9210E0EaFEff9068a89327";
const USDC = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
const PESO = "0x1423569894d749AdE3f2b677Ea6220e2366E7AaC";
const LP = "0x24e8f008519c7a9cc414e21a19aba500c6c5fe46";
const TREASURY = "0xF08a91c214c42a0F51DE0C5691FDf6Fa37e6E1f2";

const ERC20_ABI = [
  {
    name: 'approve',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    outputs: []
  }
];

const PESO_ABI = [
  {
    name: 'mint',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'usdcAmount', type: 'uint256' }],
    outputs: []
  },
  {
    name: 'burn',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'pesoAmount', type: 'uint256' }],
    outputs: []
  }
];

const { chains, provider } = configureChains([base], [publicProvider()]);
const { connectors } = getDefaultWallets({
  appName: 'Kartel Exchange',
  projectId: 'c15464b8daf8151f93cd366810034e5b',
  chains
});
const wagmiClient = createClient({ autoConnect: true, connectors, provider });

const isValidNumber = (val) => {
  if (!val || val === '.' || val.endsWith('.')) return false;
  return /^\d*\.?\d*$/.test(val);
};

const Dashboard = () => {
  const { address, isConnected } = useAccount();
  const [inputUSDC, setInputUSDC] = useState('');
  const [inputRedeem, setInputRedeem] = useState('');
  const [prices, setPrices] = useState({ KARTEL: 0.0, PESO: 0.05, USDC: 1 });
  const [pesoSupply, setPesoSupply] = useState(0);
  const [usdcReserves, setUsdcReserves] = useState(0);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const kartel = useBalance({ address, token: KARTEL });
  const usdc = useBalance({ address, token: USDC });
  const peso = useBalance({ address, token: PESO });
  const lp = useBalance({ address, token: LP });
  const kartelT = useBalance({ address: TREASURY, token: KARTEL });
  const usdcT = useBalance({ address: TREASURY, token: USDC });
  const pesoT = useBalance({ address: TREASURY, token: PESO });
  const lpT = useBalance({ address: TREASURY, token: LP });

  useEffect(() => {
    const fetchStats = async () => {
      const apiKey = import.meta.env.VITE_BASESCAN_API_KEY;
      try {
        const pesoRes = await fetch(`https://api.basescan.org/api?module=stats&action=tokensupply&contractaddress=${PESO}&apikey=${apiKey}`);
        const pesoJson = await pesoRes.json();
        setPesoSupply(Number(pesoJson.result) / 1e18);

        const usdcRes = await fetch(`https://api.basescan.org/api?module=account&action=tokenbalance&contractaddress=${USDC}&address=${PESO}&tag=latest&apikey=${apiKey}`);
        const usdcJson = await usdcRes.json();
        setUsdcReserves(Number(usdcJson.result) / 1e6);
      } catch (err) {
        console.error("Failed to fetch BaseScan stats", err);
      }
    };
    fetchStats();
    const interval = setInterval(fetchStats, 60000);
    return () => clearInterval(interval);
  }, []);

  const formatUsd = (symbol, balance) => {
    const val = parseFloat(balance);
    const price = prices[symbol] || 0;
    return isNaN(val) ? '' : ` ($${(val * price).toFixed(2)})`;
  };

  const backingRatio = pesoSupply > 0 ? (usdcReserves / (pesoSupply * 0.05)).toFixed(2) : '...';

  const parsedUSDC = useMemo(() => {
    try {
      return isValidNumber(inputUSDC) ? parseUnits(inputUSDC, 6) : undefined;
    } catch {
      return undefined;
    }
  }, [inputUSDC]);

  const parsedPESO = useMemo(() => {
    try {
      return isValidNumber(inputRedeem) ? parseUnits(inputRedeem, 18) : undefined;
    } catch {
      return undefined;
    }
  }, [inputRedeem]);

  const { config: approveUSDCConfig } = usePrepareContractWrite({
    address: USDC,
    abi: ERC20_ABI,
    functionName: 'approve',
    args: parsedUSDC ? [PESO, parsedUSDC.toString()] : undefined,
    enabled: Boolean(parsedUSDC)
  });
  const { writeAsync: approveUSDC } = useContractWrite(approveUSDCConfig);

  const { config: approvePESOConfig } = usePrepareContractWrite({
    address: PESO,
    abi: ERC20_ABI,
    functionName: 'approve',
    args: parsedPESO ? [PESO, parsedPESO.toString()] : undefined,
    enabled: Boolean(parsedPESO)
  });
  const { writeAsync: approvePESO } = useContractWrite(approvePESOConfig);

  const { config: mintConfig } = usePrepareContractWrite({
    address: PESO,
    abi: PESO_ABI,
    functionName: 'mint',
    args: parsedUSDC ? [parsedUSDC.toString()] : undefined,
    enabled: Boolean(parsedUSDC)
  });
  const { writeAsync: mintWrite } = useContractWrite(mintConfig);

  const { config: burnConfig } = usePrepareContractWrite({
    address: PESO,
    abi: PESO_ABI,
    functionName: 'burn',
    args: parsedPESO ? [parsedPESO.toString()] : undefined,
    enabled: Boolean(parsedPESO)
  });
  const { writeAsync: burnWrite } = useContractWrite(burnConfig);

  const handleAction = async (label, fn) => {
    try {
      setLoading(true);
      setStatus(`${label} pending...`);
      await fn();
      setStatus(`${label} submitted! ✅`);
    } catch (err) {
      console.error(err);
      setStatus(`${label} failed ❌`);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveUSDC = () => handleAction('Approve USDC', async () => await approveUSDC?.());
  const handleMint = () => handleAction('Mint PESO', async () => await mintWrite?.());
  const handleApprovePESO = () => handleAction('Approve PESO', async () => await approvePESO?.());
  const handleBurn = () => handleAction('Redeem PESO', async () => await burnWrite?.());

  return (
    <div className="min-h-screen text-white p-6 flex flex-col items-center" style={{
      backgroundColor: '#2c2c2c',
      backgroundImage: "url('/desert-background.png')",
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    }}>
      <div className="flex flex-col items-center mb-6">
        <img src="/kartel-logo.png" alt="KARTEL" className="w-[20rem] mb-4 border-4 border-black rounded" />
        <ConnectButton label="Connect Wallet" chainStatus="none" showBalance={false} />
        {isConnected && <div className="mt-2 bg-gray-800 px-4 py-2 rounded text-sm border border-gray-600">{address}</div>}
        {status && <div className="mt-2 text-sm text-center text-yellow-400">{loading ? '⏳ ' : ''}{status}</div>}
      </div>

      <div className="bg-gray-900 p-4 rounded border border-gray-700 text-center w-full max-w-3xl mb-6">
        <h2 className="text-xl font-bold mb-4">Your Balances</h2>
        <p>KARTEL: {kartel.data?.formatted}{formatUsd('KARTEL', kartel.data?.formatted)}</p>
        <p>USDC: {usdc.data?.formatted}{formatUsd('USDC', usdc.data?.formatted)}</p>
        <p>PESO: {peso.data?.formatted}{formatUsd('PESO', peso.data?.formatted)}</p>
      </div>

      <div className="w-full max-w-3xl space-y-6">
        <div className="bg-gray-900 p-4 rounded border border-gray-700 text-center">
          <h2 className="text-xl font-bold mb-2">MINTING</h2>
          <p className="text-sm text-gray-400 mb-4">20 PESO per 1 USDC</p>
          <div className="space-y-4">
            <div className="flex gap-2 items-end">
              <input type="text" value={inputUSDC} onChange={(e) => setInputUSDC(e.target.value)} placeholder="USDC amount (min 20)" className="w-full p-2 rounded bg-gray-800 border border-gray-600" />
              <button onClick={handleApproveUSDC} disabled={loading || !parsedUSDC} className="bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded text-white">APPROVE</button>
              <button onClick={handleMint} disabled={loading || !parsedUSDC} className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-white">MINT</button>
            </div>
            <div className="flex gap-2 items-end">
              <input type="text" value={inputRedeem} onChange={(e) => setInputRedeem(e.target.value)} placeholder="PESO amount (min 400)" className="w-full p-2 rounded bg-gray-800 border border-gray-600" />
              <button onClick={handleApprovePESO} disabled={loading || !parsedPESO} className="bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded text-white">APPROVE</button>
              <button onClick={handleBurn} disabled={loading || !parsedPESO} className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-white">REDEEM</button>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 p-4 rounded border border-gray-700 text-center">
          <h2 className="text-xl font-bold mb-2">TREASURY</h2>
          <p className="text-sm text-gray-400 mb-2">{TREASURY}</p>
          <p>KARTEL/PESO LP: {lpT.data?.formatted}</p>
          <p>KARTEL: {kartelT.data?.formatted}{formatUsd('KARTEL', kartelT.data?.formatted)}</p>
          <p>USDC: {usdcT.data?.formatted}{formatUsd('USDC', usdcT.data?.formatted)}</p>
          <p>PESO: {pesoT.data?.formatted}{formatUsd('PESO', pesoT.data?.formatted)}</p>
        </div>

        <div className="bg-gray-900 p-4 rounded border border-gray-700 text-center">
          <h2 className="text-xl font-bold mb-4">STATISTICS</h2>
          <p>PESO Circulating Supply: {pesoSupply.toLocaleString()}</p>
          <p>USDC Reserves: ${usdcReserves.toLocaleString()}</p>
          <p>Backing Ratio: {backingRatio}</p>
        </div>

        <div className="flex gap-4 justify-center mt-8">
          <button disabled className="bg-gray-700 px-4 py-2 rounded text-white opacity-50 cursor-not-allowed">STAKING DAPP (coming soon)</button>
          <button disabled className="bg-gray-700 px-4 py-2 rounded text-white opacity-50 cursor-not-allowed">BONDING DAPP (coming soon)</button>
        </div>
      </div>
    </div>
  );
};

const App = () => (
  <WagmiConfig client={wagmiClient}>
    <RainbowKitProvider chains={chains}>
      <Dashboard />
    </RainbowKitProvider>
  </WagmiConfig>
);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);