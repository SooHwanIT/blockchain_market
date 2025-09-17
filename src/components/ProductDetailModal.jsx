// src/components/ProductDetailModal.jsx

import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState } from 'react';
import { useWeb3 } from '../context/Web3Context';

const formatAddress = (address) => {
  if (!address || typeof address !== 'string' || address.length < 10) return '';
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

export default function ProductDetailModal({ isOpen, setIsOpen, product, onPurchase, isOwner }) {
  const { isConnected } = useWeb3();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // 모달이 닫힐 때 선택된 이미지 인덱스를 초기화
  const closeModal = () => {
    setIsOpen(false);
    setSelectedImageIndex(0);
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={closeModal}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-surface p-6 text-left align-middle shadow-xl transition-all">
                {/* 이미지 섹션 */}
                {product.imageUrls && product.imageUrls.length > 0 && (
                  <div className="w-full">
                    <div className="aspect-video w-full overflow-hidden rounded-lg mb-2 bg-background">
                      <img src={product.imageUrls[selectedImageIndex]} alt={product.name} className="w-full h-full object-contain" />
                    </div>
                    {product.imageUrls.length > 1 && (
                      <div className="flex gap-2 justify-center">
                        {product.imageUrls.map((url, index) => (
                          <button key={url} onClick={() => setSelectedImageIndex(index)}
                                  className={`w-16 h-16 rounded-md overflow-hidden border-2 transition-colors ${selectedImageIndex === index ? 'border-accent' : 'border-transparent hover:border-white/20'}`}>
                            <img src={url} alt={`thumbnail ${index + 1}`} className="w-full h-full object-cover"/>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 정보 섹션 */}
                <Dialog.Title as="h3" className="text-2xl font-bold leading-6 text-text-main mt-6">
                  {product.name}
                </Dialog.Title>
                <div className="mt-4">
                  <p className="text-sm text-text-muted">
                    판매자: {formatAddress(product.seller)}
                  </p>
                  <p className="text-md text-text-main my-4 whitespace-pre-wrap break-words">
                    {product.description}
                  </p>
                </div>

                {/* 가격 및 구매 버튼 */}
                <div className="mt-6 flex items-center justify-between">
                  <p className="text-3xl font-bold text-accent">{product.price} ETH</p>
                  <button
                    type="button"
                    onClick={onPurchase}
                    disabled={!isConnected || isOwner}
                    className="inline-flex justify-center rounded-full border border-transparent bg-accent px-8 py-3 text-sm font-medium text-background hover:bg-opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed"
                  >
                    {isOwner ? '내 상품' : '구매하기'}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}