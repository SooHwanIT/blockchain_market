// src/components/ProductCard.jsx
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useWeb3 } from '../context/Web3Context';
import ProductDetailModal from './ProductDetailModal'; // 상세보기 모달 import

// 주소를 '0x123...abcd' 형태로 짧게 줄여주는 헬퍼 함수
const formatAddress = (address) => {
  if (!address || typeof address !== 'string' || address.length < 10) return '';
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

export default function ProductCard({ product }) {
  const { isConnected, account, purchaseProductOnChain } = useWeb3();
  const [isModalOpen, setIsModalOpen] = useState(false); // 모달 열림/닫힘 상태
  
  // 현재 지갑 주소와 판매자 주소가 같은지 확인
  const isOwner = isConnected && account?.toLowerCase() === product.seller?.toLowerCase();

  const handlePurchase = async () => {
    if (!isConnected) return toast.error('구매하려면 지갑을 연결해야 합니다.');
    if (isOwner) return toast.error('자신이 등록한 상품은 구매할 수 없습니다.');
    
    const promise = purchaseProductOnChain(product.id, product.price);

    toast.promise(promise, {
      loading: '구매 트랜잭션을 처리 중입니다...',
      success: () => {
        // 성공 시 페이지를 새로고침하여 판매된 상품을 목록에서 제거
        window.location.reload(); 
        return `'${product.name}' 구매가 완료되었습니다!`;
      },
      error: (err) => err.shortMessage || '구매에 실패했습니다.',
    });
  };
console.log("렌더링된 상품의 이미지 URL:", product.imageUrls); // <-- 이 줄을 추가하세요

  return (
    <>
      <div className="bg-surface rounded-2xl flex flex-col overflow-hidden
                     border border-transparent hover:border-primary/50
                     transition-all duration-300 group">
        
        {/* 상품 이미지 */}
        <div className="aspect-square w-full overflow-hidden">
          <img
            src={product.imageUrls && product.imageUrls.length > 0 ? product.imageUrls[0] : 'https://via.placeholder.com/300'}
            alt={product.name}
            // 👇 이미지가 로드되지 않으면 이 함수가 실행됩니다.
            onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/300'; }}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
        </div>
        
        <div className="p-6 flex flex-col flex-grow">
          {/* 상품명 및 판매자 정보 */}
          <div>
            <h3 className="text-xl font-bold truncate">{product.name}</h3>
            <p className="text-sm text-text-muted break-all mb-4">
              판매자: {formatAddress(product.seller)}
            </p>
          </div>

          <div className="mt-auto">
            {/* 가격 */}
            <p className="text-2xl font-semibold text-accent mb-4">{product.price} ETH</p>
            
            {/* 버튼 그룹 */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex-1 bg-primary/20 text-primary font-semibold py-2 px-4 rounded-full
                           hover:bg-primary/30 transition-colors text-sm"
              >
                상세보기
              </button>
              <button
                onClick={handlePurchase}
                disabled={!isConnected || isOwner}
                className="flex-1 bg-accent text-background font-semibold py-2 px-4 rounded-full
                           hover:bg-opacity-80 transition-colors text-sm
                           disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                {isOwner ? '내 상품' : '구매하기'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 상세보기 모달 */}
      <ProductDetailModal
        isOpen={isModalOpen}
        setIsOpen={setIsModalOpen}
        product={product}
        onPurchase={handlePurchase}
        isOwner={isOwner}
      />
    </>
  );
}