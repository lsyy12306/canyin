import { useState, type FormEvent } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { z } from 'zod';
import SectionHeader from '../components/SectionHeader';
import JobCard from '../components/JobCard';
import { useToast } from '../components/Toast';
import { useJobs } from '../hooks/useJobs';
import { applyJob } from '../api/jobs';
import { jobTypeLabel } from '../utils/helpers';
import type { Job, JobApplicationPayload } from '../types';

const applicationSchema = z.object({
  name: z.string().min(1, '请填写姓名'),
  phone: z.string().min(1, '请填写手机号'),
  email: z.string().email('邮箱格式不正确').or(z.literal('')),
  message: z.string().optional(),
});

export default function JobsPage() {
  const toast = useToast();
  const { jobs, isLoading } = useJobs();
  const [active, setActive] = useState<Job | null>(null);
  const [values, setValues] = useState<JobApplicationPayload>({
    name: '',
    phone: '',
    email: '',
    message: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof JobApplicationPayload, string>>>({});
  const [submitting, setSubmitting] = useState(false);

  const openApply = (job: Job) => {
    setActive(job);
    setValues({ name: '', phone: '', email: '', message: '' });
    setErrors({});
  };
  const close = () => setActive(null);

  const set = (k: keyof JobApplicationPayload, v: string) => {
    setValues((p) => ({ ...p, [k]: v } as unknown as JobApplicationPayload));
    setErrors((e) => ({ ...e, [k]: undefined } as Partial<Record<keyof JobApplicationPayload, string>>));
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!active) return;
    const parsed = applicationSchema.safeParse(values);
    if (!parsed.success) {
      const fe: Partial<Record<keyof JobApplicationPayload, string>> = {};
      parsed.error.issues.forEach((i) => {
        const k = i.path[0] as keyof JobApplicationPayload;
        if (!fe[k]) fe[k] = i.message;
      });
      setErrors(fe);
      return;
    }
    setSubmitting(true);
    try {
      await applyJob(active.id, parsed.data);
      toast.success('简历已提交，感谢您对味禾小馆的关注！');
      close();
    } catch {
      // 错误 toast 由拦截器统一弹出
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>人才招聘 | 味禾小馆</title>
        <meta
          name="description"
          content="味禾小馆人才招聘——门店店长、厨师、前厅服务与供应链等岗位招募中。"
        />
      </Helmet>

      <section className="page-hero">
        <div className="container">
          <div className="crumb">
            <Link to="/">首页</Link> / 招商加盟 / 人才招聘
          </div>
          <h1>人才招聘</h1>
          <p style={{ color: 'var(--muted)', maxWidth: 640 }}>
            和味禾一起，把家常味带给更多人。以下岗位来自后端接口，薪资与要求以正式招聘为准。
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {isLoading ? (
            <div className="state">
              <div className="spinner" />
              加载中…
            </div>
          ) : jobs.length === 0 ? (
            <div className="state">暂无招聘岗位。</div>
          ) : (
            <div className="grid grid-2">
              {jobs.map((job) => (
                <JobCard key={job.id} job={job} onApply={openApply} />
              ))}
            </div>
          )}

          <div className="card" style={{ marginTop: 24 }}>
            <h3>我们提供</h3>
            <p>
              具竞争力的薪酬、清晰的晋升通道、系统的岗前带训，以及在一个稳健成长的连锁品牌里长期发展的机会。
            </p>
          </div>
        </div>
      </section>

      {active && (
        <div className="modal-mask" onClick={close}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: 6 }}>投递：{active.title}</h3>
            <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 16 }}>
              {[active.location, jobTypeLabel(active.type), active.department]
                .filter(Boolean)
                .join(' · ')}
            </p>
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
                <label>手机号</label>
                <input
                  type="text"
                  placeholder="手机"
                  value={values.phone}
                  onChange={(e) => set('phone', e.target.value)}
                />
                {errors.phone && <div className="error">{errors.phone}</div>}
              </div>
              <div className="field">
                <label>邮箱（选填）</label>
                <input
                  type="text"
                  placeholder="邮箱"
                  value={values.email}
                  onChange={(e) => set('email', e.target.value)}
                />
                {errors.email && <div className="error">{errors.email}</div>}
              </div>
              <div className="field">
                <label>留言（选填）</label>
                <textarea
                  rows={3}
                  placeholder="一句话介绍你的相关经验"
                  value={values.message}
                  onChange={(e) => set('message', e.target.value)}
                />
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button className="btn btn-primary" type="submit" disabled={submitting}>
                  {submitting ? '提交中…' : '提交简历'}
                </button>
                <button className="btn btn-ghost" type="button" onClick={close}>
                  取消
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
