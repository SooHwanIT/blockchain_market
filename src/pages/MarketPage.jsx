import { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import { useWeb3 } from '../context/Web3Context';

export default function MarketPage() {
  const { provider, getAllProducts } = useWeb3();
  // products의 초기 상태를 빈 배열 []로 설정합니다.
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      // 컴포넌트가 마운트 해제된 경우 상태 업데이트를 방지 (메모리 누수 방지)
      let isMounted = true; 
      
      // 로딩 상태를 true로 설정 (데이터를 다시 불러올 때를 대비)
      setIsLoading(true);
      try {
        const fetchedProducts = await getAllProducts();
        // getAllProducts가 null이나 undefined를 반환할 경우를 대비
        if (isMounted && fetchedProducts) {
          setProducts(fetchedProducts);
        }
      } catch (error) {
        console.error("상품 목록 로딩 오류:", error);
        // 에러가 발생해도 products는 빈 배열이므로 UI가 깨지지 않습니다.
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }

      return () => {
        isMounted = false;
      };
    };

    fetchProducts();
  }, [provider, getAllProducts]);

  if (isLoading) {
    return <div className="text-center py-40">상품 목록을 불러오는 중...</div>;
  }

  return (
    // <div className="container mx-auto px-4 py-24"> // Layout.jsx에서 처리하므로 중복 padding 제거
    <div>
      <h2 className="text-4xl font-bold mb-8 text-center">마켓플레이스</h2>
      {products.length === 0 ? (
        <p className="text-center text-text-muted">등록된 상품이 없습니다.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}