import type { DishCategory } from '../types';

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
