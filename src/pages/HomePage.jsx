// Part 3.2에서 제공된 코드와 동일
import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <div className="relative w-full h-screen overflow-hidden flex items-center justify-center">
      <div className="absolute top-0 left-0 w-full h-full -z-10">
        <div 
          className="absolute -inset-[10px] opacity-50 blur-[10px] 
                     [background-image:var(--aurora-gradient)] 
                     [background-size:300%_200%] 
                     animate-aurora"
          style={{
            '--aurora-gradient': `repeating-linear-gradient(100deg, var(--color-primary)_10%, var(--color-secondary)_25%, var(--color-accent)_40%)`
          }}
        ></div>
      </div>
      <div className="text-center z-10 p-4">
        <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400 mb-4">
          Aurora Market
        </h1>
        <p className="text-lg md:text-xl text-text-muted max-w-2xl mx-auto mb-8">
          블록체인 기술로 구현된 투명하고 안전한 P2P 중고 거래 플랫폼.
          당신의 자산을 직접 관리하며 새로운 거래를 경험해보세요.
        </p>
        <Link
          to="/market"
          className="inline-block bg-accent text-background font-bold py-3 px-8 rounded-full text-lg 
                     hover:scale-105 transition-transform duration-300 ease-in-out
                     shadow-[0_0_20px_theme(colors.accent/0.5)]"
        >
          마켓 둘러보기
        </Link>
      </div>
    </div>
  );
}