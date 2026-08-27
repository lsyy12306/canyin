import PlaceholderImage from './PlaceholderImage';
import type { Store } from '../types';

export default function StoreCard({ store }: { store: Store }) {
  return (
    <div className="card">
      <PlaceholderImage
        src={store.image_url}
        ratio="store"
        label="门店实景图"
        alt={`${store.city} ${store.name}`}
      />
      <h3 style={{ marginTop: 14 }}>{store.city} · {store.name}</h3>
      {store.highlight && <p>{store.highlight}</p>}
    </div>
  );
}
