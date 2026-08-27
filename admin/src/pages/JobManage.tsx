import { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Select, Switch, Space, Popconfirm, Tag, App } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { getJobs, createJob, updateJob, deleteJob } from '../api/jobs';
import { normalizeList } from '../utils/helpers';
import type { Job, JobType } from '../types';

const TYPE_OPTIONS = [
  { label: '全职', value: 'full_time' },
  { label: '兼职', value: 'part_time' },
  { label: '实习', value: 'intern' },
];

const TYPE_LABEL: Record<JobType, string> = {
  full_time: '全职',
  part_time: '兼职',
  intern: '实习',
};

export default function JobManage() {
  const [data, setData] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Job | null>(null);
  const [form] = Form.useForm();
  const { message } = App.useApp();

  const load = async () => {
    setLoading(true);
    try {
      const res = await getJobs();
      setData(normalizeList(res));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!open) return;
    if (editing) {
      form.setFieldsValue(editing);
    } else {
      form.resetFields();
      form.setFieldsValue({ type: 'full_time', is_active: true, sort_order: 0 });
    }
  }, [open, editing, form]);

  const openCreate = () => {
    setEditing(null);
    setOpen(true);
  };

  const openEdit = (record: Job) => {
    setEditing(record);
    setOpen(true);
  };

  const handleOk = async () => {
    const values = await form.validateFields();
    if (editing) {
      await updateJob(editing.id, values);
      message.success('已更新');
    } else {
      await createJob(values);
      message.success('已创建');
    }
    setOpen(false);
    load();
  };

  const handleDelete = async (id: number) => {
    await deleteJob(id);
    message.success('已删除');
    load();
  };

  const columns: ColumnsType<Job> = [
    { title: 'ID', dataIndex: 'id', width: 70 },
    { title: '职位', dataIndex: 'title', ellipsis: true },
    { title: '部门', dataIndex: 'department', width: 110 },
    { title: '地点', dataIndex: 'location', width: 120 },
    {
      title: '类型',
      dataIndex: 'type',
      width: 90,
      render: (t: JobType) => <Tag>{TYPE_LABEL[t]}</Tag>,
    },
    {
      title: '招聘中',
      dataIndex: 'is_active',
      width: 90,
      render: (v) => (v ? <Tag color="green">招聘中</Tag> : <Tag>停招</Tag>),
    },
    {
      title: '操作',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(record)}>
            编辑
          </Button>
          <Popconfirm title="确认删除该岗位？" onConfirm={() => handleDelete(record.id)}>
            <Button size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>
        <h2 style={{ margin: 0 }}>岗位管理</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          新增岗位
        </Button>
      </Space>

      <Table rowKey="id" loading={loading} columns={columns} dataSource={data} scroll={{ x: 900 }} />

      <Modal
        title={editing ? '编辑岗位' : '新增岗位'}
        open={open}
        onOk={handleOk}
        onCancel={() => setOpen(false)}
        okText="保存"
        cancelText="取消"
        width={680}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item name="title" label="职位名" rules={[{ required: true, message: '请输入职位名' }]}>
            <Input maxLength={64} />
          </Form.Item>
          <Space size="large" style={{ display: 'flex' }}>
            <Form.Item name="department" label="部门" style={{ flex: 1 }}>
              <Input maxLength={32} placeholder="如：运营部" />
            </Form.Item>
            <Form.Item name="location" label="工作地点" style={{ flex: 1 }}>
              <Input maxLength={64} placeholder="如：广州" />
            </Form.Item>
          </Space>
          <Form.Item name="type" label="工作类型" rules={[{ required: true }]}>
            <Select options={TYPE_OPTIONS} />
          </Form.Item>
          <Form.Item name="description" label="岗位描述">
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item name="requirements" label="任职要求">
            <Input.TextArea rows={4} />
          </Form.Item>
          <Space size="large">
            <Form.Item name="is_active" label="是否招聘中" valuePropName="checked">
              <Switch />
            </Form.Item>
            <Form.Item name="sort_order" label="排序权重">
              <InputNumber min={0} />
            </Form.Item>
          </Space>
        </Form>
      </Modal>
    </div>
  );
}
