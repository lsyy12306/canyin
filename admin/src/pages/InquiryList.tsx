import { useEffect, useState } from 'react';
import { Table, Select, Space, Tag, Typography, App } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { getInquiries, updateInquiry } from '../api/inquiries';
import { normalizeList, formatDateTime } from '../utils/helpers';
import type { FranchiseInquiry, InquiryStatus } from '../types';

const STATUS_OPTIONS: { label: string; value: InquiryStatus }[] = [
  { label: '待联系', value: 'pending' },
  { label: '已联系', value: 'contacted' },
  { label: '已关闭', value: 'closed' },
];

const STATUS_META: Record<InquiryStatus, { color: string; label: string }> = {
  pending: { color: 'default', label: '待联系' },
  contacted: { color: 'processing', label: '已联系' },
  closed: { color: 'default', label: '已关闭' },
};

export default function InquiryList() {
  const [data, setData] = useState<FranchiseInquiry[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<InquiryStatus | undefined>();
  const { message } = App.useApp();

  const load = async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = {};
      if (status) params.status = status;
      const res = await getInquiries(params);
      setData(normalizeList(res));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // status 变化触发重新拉取
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const changeStatus = async (id: number, value: InquiryStatus) => {
    await updateInquiry(id, { status: value });
    message.success('状态已更新');
    load();
  };

  const columns: ColumnsType<FranchiseInquiry> = [
    { title: 'ID', dataIndex: 'id', width: 70 },
    { title: '姓名', dataIndex: 'name', width: 100 },
    { title: '手机', dataIndex: 'phone', width: 140 },
    { title: '意向城市', dataIndex: 'city', width: 100, render: (v) => v || '-' },
    { title: '预算区间', dataIndex: 'budget_range', width: 120, render: (v) => v || '-' },
    { title: '留言', dataIndex: 'message', ellipsis: true, render: (v) => v || '-' },
    { title: '提交时间', dataIndex: 'created_at', width: 170, render: (v) => formatDateTime(v) },
    {
      title: '状态',
      dataIndex: 'status',
      width: 160,
      render: (s: InquiryStatus, record) => (
        <Select
          value={s}
          options={STATUS_OPTIONS}
          onChange={(v) => changeStatus(record.id, v)}
          style={{ width: 120 }}
          variant="borderless"
        />
      ),
    },
  ];

  return (
    <div>
      <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>
        <h2 style={{ margin: 0 }}>加盟意向</h2>
        <Select
          allowClear
          placeholder="按状态筛选"
          options={STATUS_OPTIONS}
          value={status}
          onChange={(v) => setStatus(v)}
          style={{ width: 180 }}
        />
      </Space>
      <Typography.Paragraph type="secondary">共 {data.length} 条记录</Typography.Paragraph>
      <Table rowKey="id" loading={loading} columns={columns} dataSource={data} scroll={{ x: 1000 }} />
    </div>
  );
}
