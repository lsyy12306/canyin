import type { DishCategory } from '../types';

// 菜品分类筛选条：用于菜品中心顶部。
// active 为当前选中分类的 key（'all' 表示全部）；点击切换会回调 onChange(key)。
// 每个分类按钮前若定义了 color，则渲染一个同色小圆点（cat-dot），
// 与菜品卡片的彩色徽标呼应，形成“彩色分类体系”。
interface Props {
  categories: DishCategory[];
  active: string; // 'all' 或分类 key
  onChange: (key: string) => void;
}

export default function CategoryFilter({ categories, active, onChange }: Props) {
  return (
    <div className="cat-filter">
      <button
        type="button"
        className={active === 'all' ? 'on' : ''}
        onClick={() => onChange('all')}
      >
        全部
      </button>
      {categories.map((c) => (
        <button
          type="button"
          key={c.key}
          className={active === c.key ? 'on' : ''}
          onClick={() => onChange(c.key)}
        >
          {/* 分类主题色圆点：无 color 时跳过，保证视觉不突兀 */}
          {c.color && (
            <span
              className="cat-dot"
              style={{ background: c.color }}
              aria-hidden
            />
          )}
          {c.name}
        </button>
      ))}
    </div>
  );
}
