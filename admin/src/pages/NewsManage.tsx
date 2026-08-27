import { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Radio, Switch, Space, Popconfirm, Tag, Image, DatePicker, App } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { getNews, createNews, updateNews, deleteNews } from '../api/news';
import { normalizeList, formatDate } from '../utils/helpers';
import ImageUpload from '../components/ImageUpload';
import type { News, NewsType } from '../types';

export default function NewsManage() {
  const [data, setData] = useState<News[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<News | null>(null);
  const [form] = Form.useForm();
  const { message } = App.useApp();

  const load = async () => {
    setLoading(true);
    try {
      const res = await getNews();
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
      form.setFieldsValue({
        ...editing,
        published_at: editing.published_at ? dayjs(editing.published_at) : null,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({ type: 'corporate', is_published: false });
    }
  }, [open, editing, form]);

  const openCreate = () => {
    setEditing(null);
    setOpen(true);
  };

  const openEdit = (record: News) => {
    setEditing(record);
    setOpen(true);
  };

  const handleOk = async () => {
    const values = await form.validateFields();
    const payload: Partial<News> = { ...values };
    if (payload.published_at && dayjs.isDayjs(payload.published_at)) {
      payload.published_at = (payload.published_at as dayjs.Dayjs).format('YYYY-MM-DD');
    } else {
      payload.published_at = undefined;
    }
    if (editing) {
      await updateNews(editing.id, payload);
      message.success('已更新');
    } else {
      await createNews(payload);
      message.success('已创建');
    }
    setOpen(false);
    load();
  };

  const handleDelete = async (id: number) => {
    await deleteNews(id);
    message.success('已删除');
    load();
  };

  const columns: ColumnsType<News> = [
    { title: 'ID', dataIndex: 'id', width: 70 },
    {
      title: '封面',
      dataIndex: 'cover_image',
      width: 80,
      render: (v) =>
        v ? <Image src={v} width={48} height={48} style={{ objectFit: 'cover', borderRadius: 6 }} /> : '-',
    },
    { title: '标题', dataIndex: 'title', ellipsis: true },
    {
      title: '类型',
      dataIndex: 'type',
      width: 110,
      render: (t: NewsType) => (t === 'corporate' ? <Tag color="blue">企业新闻</Tag> : <Tag color="cyan">行业资讯</Tag>),
    },
    { title: '发布日期', dataIndex: 'published_at', width: 120, render: (v) => formatDate(v) },
    {
      title: '状态',
      dataIndex: 'is_published',
      width: 90,
      render: (v) => (v ? <Tag color="green">已发布</Tag> : <Tag>草稿</Tag>),
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
          <Popconfirm title="确认删除该新闻？" onConfirm={() => handleDelete(record.id)}>
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
        <h2 style={{ margin: 0 }}>新闻管理</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          新增新闻
        </Button>
      </Space>

      <Table rowKey="id" loading={loading} columns={columns} dataSource={data} scroll={{ x: 920 }} />

      <Modal
        title={editing ? '编辑新闻' : '新增新闻'}
        open={open}
        onOk={handleOk}
        onCancel={() => setOpen(false)}
        okText="保存"
        cancelText="取消"
        width={720}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item name="type" label="类型" rules={[{ required: true }]}>
            <Radio.Group
              optionType="button"
              buttonStyle="solid"
              options={[
                { label: '企业新闻', value: 'corporate' },
                { label: '行业资讯', value: 'industry' },
              ]}
            />
          </Form.Item>
          <Form.Item name="title" label="标题" rules={[{ required: true, message: '请输入标题' }]}>
            <Input maxLength={128} />
          </Form.Item>
          <Form.Item name="slug" label="URL 标识 (slug)" rules={[{ required: true, message: '请输入 slug' }]}>
            <Input placeholder="如：brand-anniversary" maxLength={128} />
          </Form.Item>
          <Form.Item name="summary" label="摘要">
            <Input.TextArea rows={2} maxLength={255} showCount />
          </Form.Item>
          <Form.Item name="content" label="正文（Markdown）">
            <Input.TextArea rows={6} placeholder="支持 Markdown / HTML" />
          </Form.Item>
          <Form.Item name="cover_image" label="封面图">
            <ImageUpload />
          </Form.Item>
          <Space size="large">
            <Form.Item name="published_at" label="发布日期">
              <DatePicker style={{ width: 200 }} format="YYYY-MM-DD" />
            </Form.Item>
            <Form.Item name="is_published" label="是否发布" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Space>
        </Form>
      </Modal>
    </div>
  );
}
