// src/context/Web3Provider.jsx

import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';
import MarketplaceContract from '../contracts/Marketplace.json';

const Web3Context = createContext(null);

export const Web3Provider = ({ children }) => {
  const [provider, setProvider] = useState(null);
  const [account, setAccount] = useState(null);
  const [signer, setSigner] = useState(null);
  const [network, setNetwork] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  const handleAccountsChanged = useCallback((accounts) => {
    if (accounts.length > 0) {
      const newAccount = accounts[0];
      setAccount(newAccount);
      setIsConnected(true);
      if (provider) {
        provider.getSigner().then(setSigner);
      }
      toast.success(`계정 변경: ${newAccount.substring(0, 6)}...`);
    } else {
      setProvider(null); setAccount(null); setSigner(null); setNetwork(null); setIsConnected(false);
      toast("지갑 연결이 해제되었습니다.");
    }
  }, [provider]);

  const handleChainChanged = useCallback(() => {
    toast.success('네트워크가 변경되었습니다. 페이지를 새로고침합니다.');
    window.location.reload();
  }, []);

  useEffect(() => {
    const { ethereum } = window;
    if (ethereum) {
      ethereum.on('accountsChanged', handleAccountsChanged);
      ethereum.on('chainChanged', handleChainChanged);
      return () => {
        ethereum.removeListener('accountsChanged', handleAccountsChanged);
        ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [handleAccountsChanged, handleChainChanged]);

  const connectWallet = async () => {
    if (!window.ethereum) {
      return toast.error("MetaMask를 설치해주세요.");
    }
    try {
      const web3Provider = new ethers.BrowserProvider(window.ethereum);
      setProvider(web3Provider);
      const accounts = await web3Provider.send("eth_requestAccounts", []);
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        const signerInstance = await web3Provider.getSigner();
        setSigner(signerInstance);
        const networkData = await web3Provider.getNetwork();
        setNetwork(networkData);
        setIsConnected(true);
        toast.success("지갑이 연결되었습니다.");
      }
    } catch (error) {
      console.error("지갑 연결 오류:", error);
      toast.error("지갑 연결에 실패했습니다.");
    }
  };

  const disconnectWallet = () => {
    setProvider(null); setAccount(null); setSigner(null); setNetwork(null); setIsConnected(false);
    toast("지갑 연결이 해제되었습니다.");
  };

  const getContract = (signerOrProvider) => new ethers.Contract(MarketplaceContract.address, MarketplaceContract.abi, signerOrProvider);

    const getAllProducts = async () => {
    if (!provider) { 
        toast.error("지갑이 연결되지 않았습니다.");
        return [];
    }
    try {
        const contract = getContract(provider);
        const products = await contract.getAllProducts();
        return products
        .filter(p => !p.isSold)
        .map(p => ({
            id: Number(p.id),
            name: p.name,

            // imageUrl: p.imageUrl,       // 👈 이 부분이 잘못되었습니다.
            imageUrls: p.imageUrls,     // ✅ 's'를 붙여서 'imageUrls'로 수정해야 합니다.

            description: p.description,
            price: ethers.formatEther(p.price),
            seller: p.owner,
            isSold: p.isSold
        }));
    } catch (error) { 
        console.error("상품 목록 조회 오류:", error); 
        toast.error("상품 목록을 불러오는 데 실패했습니다."); 
        return []; 
    }
    };

  // ✨ [수정됨] imageUrls가 문자열 배열을 받도록 변경
  const registerProductOnChain = async (name, price, imageUrls, description) => {
    if (!signer) throw new Error("서명자가 없습니다. 지갑을 연결해주세요.");
    const contract = getContract(signer);
    const priceInWei = ethers.parseEther(price);
    // 스마트 컨트랙트 함수에 모든 인자 전달 (imageUrls는 배열)
    const tx = await contract.registerProduct(name, priceInWei, imageUrls, description);
    await tx.wait();
  };

  const purchaseProductOnChain = async (productId, price) => {
    if (!signer) throw new Error("서명자가 없습니다. 지갑을 연결해주세요.");
    const contract = getContract(signer);
    const priceInWei = ethers.parseEther(price);
    const tx = await contract.purchaseProduct(productId, { value: priceInWei });
    await tx.wait();
  };

  const value = {
    provider, account, signer, network, isConnected,
    connectWallet, disconnectWallet,
    getAllProducts, registerProductOnChain, purchaseProductOnChain,
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
};

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) throw new Error('useWeb3 must be used within a Web3Provider');
  return context;
};