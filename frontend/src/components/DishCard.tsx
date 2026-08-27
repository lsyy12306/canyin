import PlaceholderImage from './PlaceholderImage';
import { badgeClass, formatPrice } from '../utils/helpers';
import type { DishOut } from '../types';

interface Props {
  dish: DishOut;
  onReserve?: (dish: DishOut) => void;
}

export default function DishCard({ dish, onReserve }: Props) {
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
