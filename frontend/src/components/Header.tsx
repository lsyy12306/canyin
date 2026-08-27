import { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';

interface SubItem {
  label: string;
  to: string;
}
interface NavItem {
  label: string;
  to: string;
  subs?: SubItem[];
}

const NAV: NavItem[] = [
  { label: '首页', to: '/' },
  {
    label: '产品',
    to: '/products/dishes',
    subs: [
      { label: '菜品中心', to: '/products/dishes' },
      { label: '门店案例', to: '/products/stores' },
    ],
  },
  {
    label: '新闻',
    to: '/news/corporate',
    subs: [
      { label: '企业新闻', to: '/news/corporate' },
      { label: '行业资讯', to: '/news/industry' },
    ],
  },
  {
    label: '招商加盟',
    to: '/franchise/cooperation',
    subs: [
      { label: '加盟合作', to: '/franchise/cooperation' },
      { label: '人才招聘', to: '/franchise/jobs' },
    ],
  },
  {
    label: '关于我们',
    to: '/about/intro',
    subs: [
      { label: '品牌简介', to: '/about/intro' },
      { label: '发展历程', to: '/about/history' },
      { label: '品牌故事', to: '/about/story' },
      { label: '联系我们', to: '/about/contact' },
    ],
  },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  const isTopActive = (item: NavItem) =>
    item.subs ? item.subs.some((s) => pathname === s.to || pathname.startsWith(s.to + '/')) : pathname === item.to;

  const isSubActive = (to: string) => pathname === to || pathname.startsWith(to + '/');

  return (
    <header className="site-header">
      <div className="container nav-inner">
        <Link className="brand" to="/" onClick={() => setOpen(false)}>
          <span className="brand-logo">味禾</span>
          <span className="brand-name">味禾小馆</span>
        </Link>

        <button
          className="nav-toggle"
          aria-label="菜单"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? '✕' : '☰'}
        </button>

        <nav className={`main-nav ${open ? 'open' : ''}`}>
          <ul>
            {NAV.map((item) => (
              <li
                key={item.label}
                className={`${item.subs ? 'has-sub' : ''} ${isTopActive(item) ? 'active' : ''}`}
              >
                <NavLink to={item.to} onClick={() => setOpen(false)}>
                  {item.label}
                </NavLink>
                {item.subs && (
                  <ul className="submenu">
                    {item.subs.map((s) => (
                      <li key={s.to} className={isSubActive(s.to) ? 'active' : ''}>
                        <Link to={s.to} onClick={() => setOpen(false)}>
                          {s.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
