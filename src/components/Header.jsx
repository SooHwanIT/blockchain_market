// src/components/Header.jsx

import { Link } from 'react-router-dom';
import { useWeb3 } from '../context/Web3Context';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import toast from 'react-hot-toast';

// 아이콘 컴포넌트는 Header 컴포넌트 외부에 선언하는 것이 좋습니다.
// 이렇게 하면 Header가 리렌더링될 때마다 함수가 재생성되는 것을 방지합니다.
const ChevronDownIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 transition-transform ui-open:rotate-180">
    <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
  </svg>
);

export default function Header() {
  const { isConnected, account, network, connectWallet, disconnectWallet } = useWeb3();

  // account가 문자열이 아닐 경우(예: null, undefined)를 대비한 방어 코드 추가
  const formatAddress = (address) => {
    if (!address || typeof address !== 'string' || address.length < 10) {
      return 'Invalid Address';
    }
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };
  
  const copyAddress = () => {
    if (!account) return;
    navigator.clipboard.writeText(account);
    toast.success('주소가 복사되었습니다.');
  };

  return (
    // 헤더 높이(h-16)를 고려하여 Layout 컴포넌트에서 main 영역에 pt-16을 추가해야 합니다.
    <header className="fixed top-0 left-0 right-0 h-16 bg-surface/80 backdrop-blur-sm border-b border-white/10 z-50">
      <div className="container mx-auto px-4 h-full flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-text-main">
          ✨ Aurora Market
        </Link>
        <nav className="flex items-center gap-4">
          <Link to="/market" className="text-sm font-medium text-text-muted hover:text-text-main transition-colors">
            마켓
          </Link>
          <Link to="/register" className="text-sm font-medium text-text-muted hover:text-text-main transition-colors">
            상품 등록
          </Link>
          
          <div className="w-px h-6 bg-white/20 mx-2"></div>

          {isConnected && account ? (
            <Menu as="div" className="relative inline-block text-left">
              <div>
                <Menu.Button className="inline-flex w-full justify-center items-center gap-2 rounded-full bg-primary/20 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75 transition-colors">
                  <span>{formatAddress(account)}</span>
                  <ChevronDownIcon />
                </Menu.Button>
              </div>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-white/10 rounded-md bg-surface shadow-lg ring-1 ring-black/5 focus:outline-none">
                  <div className="px-1 py-1">
                    <div className="px-3 py-2 text-xs text-text-muted">
                      네트워크: <span className="font-semibold text-text-main">{network?.name || 'Unknown'}</span>
                    </div>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={copyAddress}
                          className={`${
                            active ? 'bg-primary/20 text-text-main' : 'text-text-muted'
                          } group flex w-full items-center rounded-md px-2 py-2 text-sm transition-colors`}
                        >
                          주소 복사
                        </button>
                      )}
                    </Menu.Item>
                  </div>
                  <div className="px-1 py-1">
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={disconnectWallet}
                          className={`${
                            active ? 'bg-red-500/20 text-red-400' : 'text-text-muted'
                          } group flex w-full items-center rounded-md px-2 py-2 text-sm transition-colors`}
                        >
                          연결 해제
                        </button>
                      )}
                    </Menu.Item>
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>
          ) : (
            <button
              onClick={connectWallet}
              className="px-5 py-2 bg-primary text-white rounded-full text-sm font-semibold hover:bg-opacity-80 transition-all duration-300"
            >
              지갑 연결
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}