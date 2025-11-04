import { useState, useEffect, useCallback } from 'react';
import { connectWallet, getWeb3 } from '@/lib/web3-utils';
import Web3 from 'web3';
import { toast } from 'react-hot-toast';

export const useWeb3 = () => {
  const [account, setAccount] = useState<string | null>(null);
  const [web3, setWeb3] = useState<Web3 | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const connect = useCallback(async () => {
    setIsConnecting(true);
    try {
      const { address, web3: web3Instance } = await connectWallet();
      setAccount(address);
      setWeb3(web3Instance);
      setIsConnected(true);
      toast.success('Wallet connected successfully!');
      return address;
    } catch (error: any) {
      console.error('Connection error:', error);
      toast.error(error.message || 'Failed to connect wallet');
      throw error;
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setAccount(null);
    setWeb3(null);
    setIsConnected(false);
    toast.success('Wallet disconnected');
  }, []);

  useEffect(() => {
    // Auto-detect if wallet is already connected
    const checkConnection = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ 
            method: 'eth_accounts' 
          });
          if (accounts.length > 0) {
            setAccount(accounts[0]);
            setWeb3(getWeb3());
            setIsConnected(true);
          }
        } catch (error) {
          console.error('Auto-connect error:', error);
        }
      }
    };

    checkConnection();

    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setIsConnected(true);
        } else {
          disconnect();
        }
      });

      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      }
    };
  }, [disconnect]);

  return {
    account,
    web3,
    isConnected,
    isConnecting,
    connect,
    disconnect
  };
};
