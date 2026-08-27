import { Link } from 'react-router-dom';

interface Cta {
  to: string;
  label: string;
}

interface Props {
  title: string;
  accent?: string;
  slogan?: string;
  tags?: string[];
  primary?: Cta;
  ghost?: Cta;
  figureText?: string;
}

export default function Hero({
  title,
  accent,
  slogan,
  tags = [],
  primary,
  ghost,
  figureText,
}: Props) {
  return (
    <section className="hero">
      <div className="container">
        <h1>
          {title}
          {accent && <span className="accent"> {accent}</span>}
        </h1>
        {slogan && <p className="slogan">{slogan}</p>}
        {tags.length > 0 && (
          <div className="tags">
            {tags.map((t) => (
              <span key={t}>{t}</span>
            ))}
          </div>
        )}
        {(primary || ghost) && (
          <div className="actions">
            {primary && (
              <Link className="btn btn-primary" to={primary.to}>
                {primary.label}
              </Link>
            )}
            {ghost && (
              <Link className="btn btn-ghost" to={ghost.to}>
                {ghost.label}
              </Link>
            )}
          </div>
        )}
      </div>
      {figureText && <div className="hero-figure">{figureText}</div>}
    </section>
  );
}
