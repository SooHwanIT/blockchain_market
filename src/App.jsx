// src/App.jsx
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import MarketPage from './pages/MarketPage';
import RegisterPage from './pages/RegisterPage';

// 라우터 설정
const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />, // 모든 페이지에 공통으로 적용될 레이아웃 컴포넌트
    children: [
      {
        index: true, // path: '/' 와 동일한 경로일 때 보여줄 기본 페이지
        element: <HomePage />,
      },
      {
        path: 'market', // '/market' 경로에 대한 페이지
        element: <MarketPage />,
      },
      {
        path: 'register', // '/register' 경로에 대한 페이지
        element: <RegisterPage />,
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;