import { Outlet } from 'react-router-dom'; 
import { Navbar } from './components/layout/Navbar'; 
import { Footer } from './components/layout/Footer';
import styles from './App.module.css'; 

function App() {
  return (
    <div>
      <div className={styles.appContainer}> 
      <Navbar />

      {/* 3. Áp dụng class cho nội dung chính */}
      <main className={styles.mainContent}>
        <Outlet /> 
      </main>

      <Footer />
    </div>
    </div>
  );
}

export default App;