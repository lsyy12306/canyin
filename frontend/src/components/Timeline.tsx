interface Item {
  year: string;
  text: string;
}

export default function Timeline({ items }: { items: Item[] }) {
  return (
    <div className="timeline">
      {items.map((it) => (
        <div className="tl-item" key={it.year}>
          <div className="tl-year">{it.year}</div>
          <p>{it.text}</p>
        </div>
      ))}
    </div>
  );
}
