import { useEffect, useState } from 'react';
import { Table, Select, Space, Tag, Typography, App, Button } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { getApplications, updateApplication } from '../api/applications';
import { getJobs } from '../api/jobs';
import { normalizeList, formatDateTime } from '../utils/helpers';
import type { JobApplication, ApplicationStatus, Job } from '../types';

const STATUS_OPTIONS: { label: string; value: ApplicationStatus }[] = [
  { label: '待处理', value: 'pending' },
  { label: '已查看', value: 'reviewed' },
  { label: '已拒绝', value: 'rejected' },
  { label: '已录用', value: 'hired' },
];

const STATUS_COLOR: Record<ApplicationStatus, string> = {
  pending: 'default',
  reviewed: 'processing',
  rejected: 'error',
  hired: 'success',
};

export default function ApplicationList() {
  const [data, setData] = useState<JobApplication[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<ApplicationStatus | undefined>();
  const { message } = App.useApp();

  const load = async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = {};
      if (status) params.status = status;
      const res = await getApplications(params);
      setData(normalizeList(res));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    getJobs()
      .then((r) => setJobs(normalizeList(r)))
      .catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const changeStatus = async (id: number, value: ApplicationStatus) => {
    await updateApplication(id, { status: value });
    message.success('状态已更新');
    load();
  };

  const jobTitle = (id: number) => jobs.find((j) => j.id === id)?.title ?? `#${id}`;

  const columns: ColumnsType<JobApplication> = [
    { title: 'ID', dataIndex: 'id', width: 70 },
    { title: '应聘岗位', dataIndex: 'job_id', width: 140, render: (id: number) => jobTitle(id) },
    { title: '姓名', dataIndex: 'name', width: 100 },
    { title: '手机', dataIndex: 'phone', width: 140 },
    { title: '邮箱', dataIndex: 'email', width: 180, render: (v) => v || '-' },
    {
      title: '简历',
      dataIndex: 'resume_url',
      width: 100,
      render: (v) =>
        v ? (
          <Button size="small" type="link" href={v} target="_blank" rel="noreferrer">
            查看
          </Button>
        ) : (
          '-'
        ),
    },
    { title: '留言', dataIndex: 'message', ellipsis: true, render: (v) => v || '-' },
    { title: '提交时间', dataIndex: 'created_at', width: 170, render: (v) => formatDateTime(v) },
    {
      title: '状态',
      dataIndex: 'status',
      width: 140,
      render: (s: ApplicationStatus, record) => (
        <Select
          value={s}
          options={STATUS_OPTIONS}
          onChange={(v) => changeStatus(record.id, v)}
          style={{ width: 110 }}
          variant="borderless"
        />
      ),
    },
  ];

  return (
    <div>
      <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>
        <h2 style={{ margin: 0 }}>简历投递</h2>
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
      <Table rowKey="id" loading={loading} columns={columns} dataSource={data} scroll={{ x: 1100 }} />
    </div>
  );
}
