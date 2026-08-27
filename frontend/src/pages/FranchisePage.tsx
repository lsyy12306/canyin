import { useState, type FormEvent } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { z } from 'zod';
import { Soup, Boxes, BarChart3, GraduationCap, type LucideIcon } from 'lucide-react';
import SectionHeader from '../components/SectionHeader';
import StepFlow from '../components/StepFlow';
import { useToast } from '../components/Toast';
import useSWR from 'swr';
import { getConfigs } from '../api/config';
import { submitInquiry } from '../api/franchise';
import type { FranchiseInquiryPayload } from '../types';

const SUPPORTS: { icon: LucideIcon; title: string; desc: string }[] = [
  { icon: Soup, title: '产品支持', desc: '中央厨房标准化配送，门店现炒即可出餐，降低对厨师的依赖。' },
  { icon: Boxes, title: '供应链支持', desc: '冷链直达，食材可追溯，多城稳定供应。' },
  { icon: BarChart3, title: '运营支持', desc: '选址评估、开业筹备、日常督导与数字化管理工具。' },
  { icon: GraduationCap, title: '培训支持', desc: '店长与团队带训，输出标准化服务流程。' },
];

const STEPS = [
  { title: '意向咨询', desc: '提交加盟意向，获取品牌手册与政策说明。' },
  { title: '资质评估', desc: '双方沟通城市与场地，评估契合度。' },
  { title: '签约选址', desc: '确定门店位置，完成签约与营建规划。' },
  { title: '筹建培训', desc: '门店装修、设备进场、团队带训。' },
  { title: '开业运营', desc: '正式开业，总部持续督导与支持。' },
];

const inquirySchema = z.object({
  name: z.string().min(1, '请填写您的姓名'),
  phone: z.string().min(1, '请填写联系电话'),
  city: z.string().optional(),
  budget_range: z.string().optional(),
  message: z.string().optional(),
});

export default function FranchisePage() {
  const toast = useToast();
  const { data: legal } = useSWR('configs-legal', () => getConfigs('legal'));
  const riskTip = legal?.franchise_risk_tip;
  const franchiseLicense = legal?.franchise_license;

  const [values, setValues] = useState<FranchiseInquiryPayload>({
    name: '',
    phone: '',
    city: '',
    budget_range: '',
    message: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FranchiseInquiryPayload, string>>>({});
  const [submitting, setSubmitting] = useState(false);

  const set = (k: keyof FranchiseInquiryPayload, v: string) => {
    setValues((p) => ({ ...p, [k]: v } as unknown as FranchiseInquiryPayload));
    setErrors((e) => ({ ...e, [k]: undefined } as Partial<Record<keyof FranchiseInquiryPayload, string>>));
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const parsed = inquirySchema.safeParse(values);
    if (!parsed.success) {
      const fe: Partial<Record<keyof FranchiseInquiryPayload, string>> = {};
      parsed.error.issues.forEach((i) => {
        const k = i.path[0] as keyof FranchiseInquiryPayload;
        if (!fe[k]) fe[k] = i.message;
      });
      setErrors(fe);
      return;
    }
    setSubmitting(true);
    try {
      await submitInquiry(parsed.data);
      toast.success('提交成功，招商顾问将在 1-2 个工作日内与您联系。');
      setValues({ name: '', phone: '', city: '', budget_range: '', message: '' });
      setErrors({});
    } catch {
      // 错误 toast 由拦截器统一弹出
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>加盟合作 | 味禾小馆</title>
        <meta
          name="description"
          content="味禾小馆招商加盟——成熟的供应链、运营与培训体系，助你稳健开店。"
        />
      </Helmet>

      <section className="page-hero">
        <div className="container">
          <div className="crumb">
            <Link to="/">首页</Link> / 招商加盟 / 加盟合作
          </div>
          <h1>加盟合作</h1>
          <p style={{ color: 'var(--muted)', maxWidth: 640 }}>
            把“家”的味道开进你的城市。味禾小馆提供从选址到运营的一站式支持。
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHeader eyebrow="为什么加盟味禾" title="四大支持体系" />
          <div className="grid grid-4">
            {SUPPORTS.map((s) => {
              const Icon = s.icon;
              return (
                <div className="card" key={s.title}>
                  <Icon className="ico" size={28} />
                  <h3>{s.title}</h3>
                  <p>{s.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section alt">
        <div className="container">
          <SectionHeader eyebrow="加盟流程" title="五步开启一家味禾小馆" />
          <StepFlow steps={STEPS} />
        </div>
      </section>

      {riskTip && (
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="container">
            <div className="risk-tip">
              <strong>加盟风险提示：</strong>
              {riskTip}
            </div>
            {franchiseLicense && (
              <p style={{ marginTop: 10, color: 'var(--muted)', fontSize: 13 }}>
                特许经营备案号：{franchiseLicense}
              </p>
            )}
          </div>
        </section>
      )}

      <section className="section">
        <div className="container">
          <div className="cta-band">
            <h2>准备好了解具体政策了吗？</h2>
            <p>投资额度、加盟条件、分成模式等以正式招商手册为准（当前为占位）。</p>
            <Link className="btn btn-amber" to="/about/contact">
              联系招商顾问
            </Link>
            <Link className="btn btn-ghost" to="/franchise/jobs">
              查看招聘岗位
            </Link>
          </div>
        </div>
      </section>

      <section className="section alt">
        <div className="container">
          <SectionHeader eyebrow="意向登记" title="提交加盟意向" />
          <div className="card" style={{ maxWidth: 560, margin: '0 auto' }}>
            <form onSubmit={onSubmit} noValidate>
              <div className="field">
                <label>姓名</label>
                <input
                  type="text"
                  placeholder="您的姓名"
                  value={values.name}
                  onChange={(e) => set('name', e.target.value)}
                />
                {errors.name && <div className="error">{errors.name}</div>}
              </div>
              <div className="field">
                <label>联系电话</label>
                <input
                  type="text"
                  placeholder="手机"
                  value={values.phone}
                  onChange={(e) => set('phone', e.target.value)}
                />
                {errors.phone && <div className="error">{errors.phone}</div>}
              </div>
              <div className="field">
                <label>意向城市</label>
                <input
                  type="text"
                  placeholder="如：深圳"
                  value={values.city}
                  onChange={(e) => set('city', e.target.value)}
                />
              </div>
              <div className="field">
                <label>预算区间</label>
                <input
                  type="text"
                  placeholder="如：50-100万"
                  value={values.budget_range}
                  onChange={(e) => set('budget_range', e.target.value)}
                />
              </div>
              <div className="field">
                <label>留言</label>
                <textarea
                  rows={3}
                  placeholder="请简要描述您的意向"
                  value={values.message}
                  onChange={(e) => set('message', e.target.value)}
                />
              </div>
              <button className="btn btn-primary" type="submit" disabled={submitting}>
                {submitting ? '提交中…' : '提交加盟意向'}
              </button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
