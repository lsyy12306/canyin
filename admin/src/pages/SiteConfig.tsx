import { useEffect, useState } from 'react';
import { Form, Input, Button, Card, Space, App, Typography, Spin } from 'antd';
import { getConfigs, updateConfig } from '../api/configs';
import type { SiteConfig } from '../types';

interface FieldDef {
  key: string;
  label: string;
  textarea?: boolean;
  placeholder?: string;
}

const FIELDS: FieldDef[] = [
  { key: 'icp', label: 'ICP 备案号', placeholder: '如：粤ICP备XXXXXXXX号-1' },
  { key: 'police_record', label: '公安备案号', placeholder: '如：粤公网安备 XXXXXXXXXX 号' },
  { key: 'franchise_license', label: '特许经营备案号', placeholder: '商业特许经营备案号' },
  { key: 'franchise_risk_tip', label: '加盟风险提示文案', placeholder: '投资有风险，加盟需谨慎。' },
  { key: 'contact_phone', label: '招商热线', placeholder: '如：400-xxx-xxxx' },
  { key: 'contact_email', label: '联系邮箱', placeholder: '如：contact@weihe.com' },
  { key: 'contact_address', label: '总部地址', placeholder: '如：广州市xx区xx路xx号' },
  { key: 'site_title_suffix', label: '页面标题后缀', placeholder: '如：味禾小馆' },
  { key: 'privacy_policy', label: '隐私政策正文（Markdown）', textarea: true, placeholder: '## 隐私政策\n\n请填写正式内容' },
];

export default function SiteConfig() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { message } = App.useApp();

  useEffect(() => {
    getConfigs()
      .then((list: SiteConfig[]) => {
        const map: Record<string, string> = {};
        list.forEach((c) => {
          map[c.config_key] = c.config_value;
        });
        form.setFieldsValue(map);
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, [form]);

  const onSave = async () => {
    const values = form.getFieldsValue() as Record<string, string>;
    setSaving(true);
    try {
      await Promise.all(
        FIELDS.map((f) => {
          const val = values[f.key] ?? '';
          return updateConfig(f.key, val);
        })
      );
      message.success('配置已保存');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 64 }}>
        <Spin />
      </div>
    );
  }

  return (
    <div>
      <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>
        <h2 style={{ margin: 0 }}>站点配置</h2>
        <Button type="primary" loading={saving} onClick={onSave}>
          保存配置
        </Button>
      </Space>

      <Typography.Paragraph type="secondary">
        备案号、联系方式与隐私政策等将动态展示于官网前台页脚与合规区域。
      </Typography.Paragraph>

      <Card>
        <Form form={form} layout="vertical">
          {FIELDS.map((f) => (
            <Form.Item key={f.key} name={f.key} label={f.label}>
              {f.textarea ? (
                <Input.TextArea rows={8} placeholder={f.placeholder} />
              ) : (
                <Input placeholder={f.placeholder} />
              )}
            </Form.Item>
          ))}
        </Form>
      </Card>
    </div>
  );
}
