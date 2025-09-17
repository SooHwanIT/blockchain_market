// src/pages/RegisterPage.jsx

import { useState } from 'react';
import { useWeb3 } from '../context/Web3Context';
import toast from 'react-hot-toast';

// 이미지 업로드 로직 (별도 함수로 분리하여 가독성 향상)
async function uploadImageToIPFS(file) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append('pinataMetadata', JSON.stringify({ name: `product_image_${file.name}_${Date.now()}` }));
  formData.append('pinataOptions', JSON.stringify({ cidVersion: 0 }));

  const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${import.meta.env.VITE_PINATA_JWT}`,
    },
    body: formData,
  });
  const resData = await res.json();

  if (resData.error) {
    throw new Error(resData.error.reason || 'Pinata API 에러');
  }
  
  return `https://gateway.pinata.cloud/ipfs/${resData.IpfsHash}`;
}

export default function RegisterPage() {
  const { isConnected, registerProductOnChain } = useWeb3();
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  
  // ✨ 여러 이미지 파일을 저장할 배열 상태
  const [imageFiles, setImageFiles] = useState([]);
  // ✨ 이미지 미리보기를 위한 URL 배열 상태
  const [imagePreviews, setImagePreviews] = useState([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const MAX_IMAGES = 10; // 최대 이미지 개수

  // 이미지 파일 선택 핸들러
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // 최대 이미지 개수 제한
    if (imageFiles.length + files.length > MAX_IMAGES) {
      toast.error(`최대 ${MAX_IMAGES}장까지 이미지를 선택할 수 있습니다.`);
      return;
    }

    setImageFiles((prevFiles) => [...prevFiles, ...files]);

    // 파일 리더를 사용하여 미리보기 URL 생성
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prevPreviews) => [...prevPreviews, reader.result]);
      };
      reader.readAsDataURL(file);
    });
    // 파일 선택 후 input 값 초기화 (같은 파일 다시 선택 시 onChange 재실행을 위해)
    e.target.value = null; 
  };

  // 미리보기 이미지 삭제 핸들러
  const handleRemoveImage = (index) => {
    setImageFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
    setImagePreviews((prevPreviews) => prevPreviews.filter((_, i) => i !== index));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!isConnected) {
      return toast.error('상품을 등록하려면 지갑을 연결해야 합니다.');
    }
    // 유효성 검사에 imageFiles 추가
    if (!name || !price || parseFloat(price) <= 0 || !description || imageFiles.length === 0) {
      return toast.error('모든 필드를 올바르게 입력하고 이미지를 최소 1장 등록해주세요.');
    }

    setIsSubmitting(true);
    let toastId = toast.loading('이미지를 IPFS에 업로드 중입니다...');

    try {
      // ✨ 모든 이미지 파일을 IPFS에 개별적으로 업로드하고 URL 배열을 생성합니다.
      const uploadedImageUrls = [];
      for (const file of imageFiles) {
        const url = await uploadImageToIPFS(file);
        uploadedImageUrls.push(url);
      }
      
      toast.loading('상품 등록 트랜잭션을 처리 중입니다...', { id: toastId });

      // ✨ 생성된 URL 배열을 포함하여 스마트 컨트랙트 함수를 호출합니다.
      const promise = registerProductOnChain(name, price, uploadedImageUrls, description);

      await toast.promise(promise, {
        loading: '상품 등록 트랜잭션을 처리 중입니다...',
        success: () => {
          setName('');
          setPrice('');
          setDescription('');
          setImageFiles([]); // 파일 배열 초기화
          setImagePreviews([]); // 미리보기 배열 초기화
          return '상품이 성공적으로 등록되었습니다!';
        },
        error: (err) => err.shortMessage || '상품 등록에 실패했습니다.',
      });

    } catch (error) {
      console.error("IPFS 업로드 또는 트랜잭션 실패:", error);
      toast.error(error.message || '이미지 업로드 또는 등록에 실패했습니다.', { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="max-w-lg mt-32 mx-auto bg-surface rounded-2xl p-8 shadow-2xl shadow-primary/10">
        <h2 className="text-3xl font-bold mb-6 text-center">상품 등록</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 상품명 */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-text-muted mb-2">상품명</label>
            <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="예: 최신형 그래픽카드" className="w-full bg-background border border-white/20 rounded-lg px-4 py-3 focus:ring-2 focus:ring-accent focus:outline-none transition-all" />
          </div>

          {/* ✨ 상품 이미지 파일 선택 및 미리보기 */}
          <div>
            <label htmlFor="imageFiles" className="block text-sm font-medium text-text-muted mb-2">
              상품 이미지 ({imageFiles.length} / {MAX_IMAGES}장)
            </label>
            <input
              type="file"
              id="imageFiles"
              accept="image/*"
              multiple // 여러 파일 선택 가능
              onChange={handleImageChange}
              className="w-full text-sm text-text-muted file:mr-4 file:py-2 file:px-4
                         file:rounded-full file:border-0 file:text-sm file:font-semibold
                         file:bg-primary/20 file:text-primary hover:file:bg-primary/30"
            />
            
            {/* 이미지 미리보기 */}
            {imagePreviews.length > 0 && (
              <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 gap-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-white/10">
                    <img src={preview} alt={`Product preview ${index + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-1 right-1 bg-red-500/80 text-white rounded-full p-1 text-xs hover:bg-red-600 transition-colors"
                      aria-label={`Remove image ${index + 1}`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                        <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 상품 설명 */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-text-muted mb-2">상품 설명</label>
            <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="상품의 상태, 특징 등을 자세히 적어주세요." rows={4} className="w-full bg-background border border-white/20 rounded-lg px-4 py-3 focus:ring-2 focus:ring-accent focus:outline-none transition-all resize-none" />
          </div>

          {/* 가격 */}
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-text-muted mb-2">가격 (ETH)</label>
            <input type="number" id="price" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0.1" step="0.001" min="0" className="w-full bg-background border border-white/20 rounded-lg px-4 py-3 focus:ring-2 focus:ring-accent focus:outline-none transition-all" />
          </div>
          
          <button type="submit" disabled={!isConnected || isSubmitting} className="w-full bg-accent text-background font-bold py-3 px-8 rounded-full text-lg hover:bg-opacity-80 transition-all duration-300 disabled:bg-gray-500 disabled:cursor-not-allowed disabled:text-gray-300">
            {isSubmitting ? '처리 중...' : '상품 등록하기'}
          </button>
          
          {!isConnected && (<p className="text-center text-sm text-red-400 mt-4">지갑을 연결해야 상품을 등록할 수 있습니다.</p>)}
        </form>
      </div>
    </div>
  );
}