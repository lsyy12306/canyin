import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import SectionHeader from '../components/SectionHeader';
import CategoryFilter from '../components/CategoryFilter';
import DishCard from '../components/DishCard';
import ReservationModal from '../components/ReservationModal';
import { useDishes, useDishCategories } from '../hooks/useDishes';
import type { DishOut } from '../types';

// 菜品中心页面：分类筛选 + 菜品网格 + 提前预约弹窗。
export default function DishListPage() {
  // 拉取分类列表（含 color），供顶部筛选条与卡片徽标使用。
  const { categories } = useDishCategories();
  const [active, setActive] = useState('all'); // 当前选中分类，'all' 为全部
  const [reserveOpen, setReserveOpen] = useState(false); // 预约弹窗开关
  const [presetDish, setPresetDish] = useState<DishOut | null>(null); // 带入弹窗的预选菜品

  // 实时筛选：active 为 'all' 时不传 category（取全部），否则按分类 key 过滤。
  // useDishes 内部会重新请求 /api/dishes，实现“点分类即筛选”的交互。
  const { dishes, isLoading } = useDishes({
    category: active === 'all' ? undefined : active,
  });

  // 打开预约弹窗：可选传入某菜品作为预选（从卡片“提前预约”按钮进入时带上）。
  const openReserve = (dish?: DishOut) => {
    setPresetDish(dish ?? null);
    setReserveOpen(true);
  };

  return (
    <>
      <Helmet>
        <title>菜品中心 | 味禾小馆</title>
        <meta
          name="description"
          content="味禾小馆菜品中心——新式家常粤菜，现炒现做，招牌热菜、靓汤、小炒、主食与点心。"
        />
      </Helmet>

      <section className="page-hero dish-hero">
        <div className="container">
          <div className="crumb">
            <Link to="/">首页</Link> / 产品 / 菜品中心
          </div>
          <h1>菜品中心</h1>
          <p style={{ color: 'var(--muted)', maxWidth: 640 }}>
            现炒现做、拒绝预制。口味随节气更替，可在线「提前预约」心仪菜品，到店即享。
          </p>
          <button type="button" className="btn btn-primary dish-hero-cta" onClick={() => openReserve()}>
            提前预约菜品
          </button>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <CategoryFilter categories={categories} active={active} onChange={setActive} />
          {isLoading ? (
            <div className="state">
              <div className="spinner" />
              加载中…
            </div>
          ) : dishes.length === 0 ? (
            <div className="state">暂无该分类下的菜品。</div>
          ) : (
            <div className="grid grid-4">
              {dishes.map((d) => (
                <DishCard key={d.id} dish={d} onReserve={() => openReserve(d)} />
              ))}
            </div>
          )}
        </div>
      </section>

      <ReservationModal
        open={reserveOpen}
        onClose={() => setReserveOpen(false)}
        presetDish={presetDish}
      />
    </>
  );
}
