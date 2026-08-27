import PlaceholderImage from './PlaceholderImage';
import { badgeClass, formatPrice } from '../utils/helpers';
import type { DishOut } from '../types';

// 菜品卡片组件：用于菜品中心的网格展示。
// 关键增强点：
// - 分类主题色（dish.category_color）驱动右上角彩色徽标 cat-pill 的底色；
//   无颜色时兜底为品牌红 #C8452E。
// - “招牌推荐”徽标仅在 is_recommended 为 true 时显示。
// - 当父组件传入 onReserve 时，渲染“提前预约”按钮，点击回调把当前菜品带出弹窗。
interface Props {
  dish: DishOut;
  onReserve?: (dish: DishOut) => void;
}

export default function DishCard({ dish, onReserve }: Props) {
  // 取该菜品所属分类的主题色，缺省走品牌红，保证徽标始终有颜色。
  const color = dish.category_color || '#C8452E';
  return (
    <div className="dish dish-card">
      <div className="dish-media">
        <PlaceholderImage
          src={dish.image_url}
          ratio="dish"
          label={dish.name}
          alt={dish.name}
          color={color}
        />
        {/* 分类彩色徽标：底色用分类主题色，文字白色 */}
        <span
          className="cat-pill"
          style={{ background: color, color: '#fff' }}
        >
          {dish.category_name}
        </span>
        {dish.is_recommended && <span className="rec-pill">招牌推荐</span>}
      </div>
      <div className="body">
        <h3>{dish.name}</h3>
        {dish.description && <p>{dish.description}</p>}
        <div className="meta">
          <div className="badges">
            {dish.tags.map((tag) => (
              <span key={tag} className={`badge ${badgeClass(tag)}`}>
                {tag}
              </span>
            ))}
          </div>
          <span className="price">{formatPrice(dish.price, dish.price_text)}</span>
        </div>
        {onReserve && (
          <button
            type="button"
            className="btn btn-reserve"
            onClick={() => onReserve(dish)}
          >
            提前预约
          </button>
        )}
      </div>
    </div>
  );
}
