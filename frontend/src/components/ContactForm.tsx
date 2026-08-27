import { useState, type FormEvent } from 'react';
import { z } from 'zod';
import { sendMessage } from '../api/contact';
import { useToast } from './Toast';
import type { ContactMessagePayload } from '../types';

const TYPE_OPTIONS: { value: ContactMessagePayload['msg_type']; label: string }[] = [
  { value: 'cooperation', label: '合作咨询' },
  { value: 'franchise', label: '加盟咨询' },
  { value: 'job', label: '应聘反馈' },
  { value: 'other', label: '其他' },
];

const schema = z.object({
  name: z.string().min(1, '请填写您的称呼'),
  contact: z.string().min(1, '请填写联系方式（手机或邮箱）'),
  msg_type: z.enum(['franchise', 'job', 'cooperation', 'other']),
  content: z.string().min(1, '请填写留言内容'),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  defaultType?: ContactMessagePayload['msg_type'];
  showTypeSelect?: boolean;
  submitLabel?: string;
  title?: string;
}

export default function ContactForm({
  defaultType = 'cooperation',
  showTypeSelect = true,
  submitLabel = '提交留言',
  title = '在线留言',
}: Props) {
  const toast = useToast();
  const [values, setValues] = useState<FormValues>({
    name: '',
    contact: '',
    msg_type: defaultType,
    content: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormValues, string>>>({});
  const [submitting, setSubmitting] = useState(false);

  const set = (key: keyof FormValues, val: string) => {
    setValues((v) => ({ ...v, [key]: val } as unknown as FormValues));
    setErrors((e) => ({ ...e, [key]: undefined } as Partial<Record<keyof FormValues, string>>));
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      const fieldErrors: Partial<Record<keyof FormValues, string>> = {};
      parsed.error.issues.forEach((issue) => {
        const k = issue.path[0] as keyof FormValues;
        if (!fieldErrors[k]) fieldErrors[k] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setSubmitting(true);
    try {
      await sendMessage(parsed.data);
      toast.success('留言已收到，我们会尽快回复。');
      setValues({ name: '', contact: '', msg_type: defaultType, content: '' });
      setErrors({});
    } catch {
      // 错误 toast 已由 axios 拦截器统一弹出
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} noValidate>
      <h3 style={{ marginBottom: 14 }}>{title}</h3>

      <div className="field">
        <label>称呼</label>
        <input
          type="text"
          placeholder="您的称呼"
          value={values.name}
          onChange={(e) => set('name', e.target.value)}
          aria-invalid={!!errors.name}
        />
        {errors.name && <div className="error">{errors.name}</div>}
      </div>

      <div className="field">
        <label>联系方式</label>
        <input
          type="text"
          placeholder="手机 / 邮箱"
          value={values.contact}
          onChange={(e) => set('contact', e.target.value)}
          aria-invalid={!!errors.contact}
        />
        {errors.contact && <div className="error">{errors.contact}</div>}
      </div>

      {showTypeSelect && (
        <div className="field">
          <label>留言类型</label>
          <select
            value={values.msg_type}
            onChange={(e) => set('msg_type', e.target.value)}
          >
            {TYPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="field">
        <label>留言内容</label>
        <textarea
          rows={4}
          placeholder="请简要描述您的需求"
          value={values.content}
          onChange={(e) => set('content', e.target.value)}
          aria-invalid={!!errors.content}
        />
        {errors.content && <div className="error">{errors.content}</div>}
      </div>

      <button className="btn btn-primary" type="submit" disabled={submitting}>
        {submitting ? '提交中…' : submitLabel}
      </button>
    </form>
  );
}
