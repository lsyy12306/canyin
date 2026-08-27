import { useEffect, useState } from 'react';
import { Table, Select, Space, Tag, Typography, App } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { getMessages, updateMessage } from '../api/messages';
import { normalizeList, formatDateTime } from '../utils/helpers';
import type { ContactMessage, MessageStatus, MessageType } from '../types';

const STATUS_OPTIONS: { label: string; value: MessageStatus }[] = [
  { label: '待回复', value: 'pending' },
  { label: '已回复', value: 'replied' },
  { label: '已关闭', value: 'closed' },
];

const STATUS_COLOR: Record<MessageStatus, string> = {
  pending: 'default',
  replied: 'success',
  closed: 'default',
};

const TYPE_OPTIONS: { label: string; value: MessageType }[] = [
  { label: '加盟', value: 'franchise' },
  { label: '应聘', value: 'job' },
  { label: '合作', value: 'cooperation' },
  { label: '其他', value: 'other' },
];

const TYPE_COLOR: Record<MessageType, string> = {
  franchise: 'gold',
  job: 'blue',
  cooperation: 'green',
  other: 'default',
};

export default function MessageList() {
  const [data, setData] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<MessageStatus | undefined>();
  const { message } = App.useApp();

  const load = async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = {};
      if (status) params.status = status;
      const res = await getMessages(params);
      setData(normalizeList(res));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const changeStatus = async (id: number, value: MessageStatus) => {
    await updateMessage(id, { status: value });
    message.success('状态已更新');
    load();
  };

  const columns: ColumnsType<ContactMessage> = [
    { title: 'ID', dataIndex: 'id', width: 70 },
    { title: '称呼', dataIndex: 'name', width: 100 },
    { title: '联系方式', dataIndex: 'contact', width: 160 },
    {
      title: '类型',
      dataIndex: 'msg_type',
      width: 100,
      render: (t: MessageType) => <Tag color={TYPE_COLOR[t]}>{TYPE_OPTIONS.find((o) => o.value === t)?.label}</Tag>,
    },
    { title: '留言内容', dataIndex: 'content', ellipsis: true },
    { title: '提交时间', dataIndex: 'created_at', width: 170, render: (v) => formatDateTime(v) },
    {
      title: '状态',
      dataIndex: 'status',
      width: 150,
      render: (s: MessageStatus, record) => (
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
        <h2 style={{ margin: 0 }}>在线留言</h2>
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
