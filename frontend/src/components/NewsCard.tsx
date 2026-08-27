import { Link } from 'react-router-dom';
import PlaceholderImage from './PlaceholderImage';
import { formatDate } from '../utils/helpers';
import type { NewsOut } from '../types';

export default function NewsCard({ news }: { news: NewsOut }) {
  return (
    <Link className="post" to={`/news/${news.slug}`}>
      <PlaceholderImage src={news.cover_image} ratio="news" label="新闻配图" alt={news.title} />
      <div className="body">
        <div className="date">{formatDate(news.published_at)}</div>
        <h3>{news.title}</h3>
        {news.summary && <p>{news.summary}</p>}
      </div>
    </Link>
  );
}
