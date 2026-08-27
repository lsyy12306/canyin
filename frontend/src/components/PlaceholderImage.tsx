import { useState } from 'react';
import { resolveImage } from '../utils/helpers';

type Ratio = 'dish' | 'store' | 'news' | 'hero' | 'tall';

interface Props {
  src?: string | null;
  ratio?: Ratio;
  label?: string;
  className?: string;
  alt?: string;
  /** 分类主题色（无图时作为占位渐变底色） */
  color?: string;
}

const ratioClass: Record<Ratio, string> = {
  dish: 'ph-dish',
  store: 'ph-store',
  news: 'ph-news',
  hero: 'ph-hero',
  tall: 'ph-tall',
};

// 图片占位组件：有真实图用 <img>（object-fit:cover），否则显示渐变占位
export default function PlaceholderImage({
  src,
  ratio = 'dish',
  label = '图片',
  className = '',
  alt = '',
  color,
}: Props) {
  const [errored, setErrored] = useState(false);
  const resolved = resolveImage(src);

  // 无图降级（缺图 / 图片加载失败）：用分类主题色生成 135° 渐变作为占位底色，
  // 文字白色显示在中心；这样即使没有真实图片，分类色系依然统一可辨识。
  const fallbackStyle = color
    ? {
        background: `linear-gradient(135deg, ${color} 0%, ${color}cc 100%)`,
        color: '#fff',
      }
    : undefined;

  return (
    <div className={`ph ${ratioClass[ratio]} ${className}`}>
      {resolved && !errored ? (
        <img
          src={resolved}
          alt={alt || label}
          loading="lazy"
          onError={() => setErrored(true)}
        />
      ) : (
        <span className="ph-fallback" style={fallbackStyle}>
          {label}
        </span>
      )}
    </div>
  );
}
