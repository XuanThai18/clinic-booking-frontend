import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Hero } from "../components/home/Hero";
import { getAllSpecialtiesApi } from "../services/specialtyService";
import type { SpecialtyResponse } from "../types/specialty.types";
import styles from "./Home.module.css"; // Đảm bảo file này tồn tại

export const Home = () => {
  const [specialties, setSpecialties] = useState<SpecialtyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Ảnh mặc định nếu chuyên khoa chưa có ảnh
  const placeholderImg = "https://cdn-icons-png.flaticon.com/512/3063/3063176.png";

  useEffect(() => {
    const fetchSpecialties = async () => {
      try {
        const res = await getAllSpecialtiesApi();
        setSpecialties(res.data || []);
      } catch (err) {
        setError("Không tải được danh sách chuyên khoa.");
      } finally {
        setLoading(false);
      }
    };

    fetchSpecialties();
  }, []);

  return (
    <div>
      <Hero />

      <div className={styles.wrapper}>
        <h2>Các Chuyên Khoa Phổ Biến</h2>

        {loading && <p style={{textAlign: 'center'}}>Đang tải...</p>}
        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.grid}>
          {specialties.map((specialty) => (
            <Link
              to={`/specialty/${specialty.id}`} // Link đến trang chi tiết
              key={specialty.id}
              className={styles.card}
            >
              <img
                // Logic chọn ảnh: Có ảnh thì lấy ảnh đầu tiên, không thì lấy placeholder
                src={specialty.imageUrls && specialty.imageUrls.length > 0 
                      ? specialty.imageUrls[0] 
                      : placeholderImg}
                alt={specialty.name}
                className={styles.image}
                onError={(e) => e.currentTarget.src = placeholderImg} // Xử lý nếu link ảnh chết
              />
              <h3 className={styles.title}>{specialty.name}</h3>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};