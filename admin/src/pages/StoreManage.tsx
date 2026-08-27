import { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Switch, Space, Popconfirm, Tag, Image, App } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { getStores, createStore, updateStore, deleteStore } from '../api/stores';
import { normalizeList } from '../utils/helpers';
import ImageUpload from '../components/ImageUpload';
import type { Store } from '../types';

export default function StoreManage() {
  const [data, setData] = useState<Store[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Store | null>(null);
  const [form] = Form.useForm();
  const { message } = App.useApp();

  const load = async () => {
    setLoading(true);
    try {
      const res = await getStores();
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
      form.setFieldsValue({ is_active: true, sort_order: 0 });
    }
  }, [open, editing, form]);

  const openCreate = () => {
    setEditing(null);
    setOpen(true);
  };

  const openEdit = (record: Store) => {
    setEditing(record);
    setOpen(true);
  };

  const handleOk = async () => {
    const values = await form.validateFields();
    if (editing) {
      await updateStore(editing.id, values);
      message.success('已更新');
    } else {
      await createStore(values);
      message.success('已创建');
    }
    setOpen(false);
    load();
  };

  const handleDelete = async (id: number) => {
    await deleteStore(id);
    message.success('已删除');
    load();
  };

  const columns: ColumnsType<Store> = [
    { title: 'ID', dataIndex: 'id', width: 70 },
    {
      title: '图片',
      dataIndex: 'image_url',
      width: 80,
      render: (v) =>
        v ? <Image src={v} width={48} height={48} style={{ objectFit: 'cover', borderRadius: 6 }} /> : '-',
    },
    { title: '城市', dataIndex: 'city', width: 100 },
    { title: '店名', dataIndex: 'name' },
    { title: '亮点', dataIndex: 'highlight', ellipsis: true },
    {
      title: '展示',
      dataIndex: 'is_active',
      width: 80,
      render: (v) => (v ? <Tag color="green">展示</Tag> : <Tag>隐藏</Tag>),
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
          <Popconfirm title="确认删除该门店？" onConfirm={() => handleDelete(record.id)}>
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
        <h2 style={{ margin: 0 }}>门店管理</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          新增门店
        </Button>
      </Space>

      <Table rowKey="id" loading={loading} columns={columns} dataSource={data} scroll={{ x: 860 }} />

      <Modal
        title={editing ? '编辑门店' : '新增门店'}
        open={open}
        onOk={handleOk}
        onCancel={() => setOpen(false)}
        okText="保存"
        cancelText="取消"
        width={640}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item name="city" label="城市" rules={[{ required: true, message: '请输入城市' }]}>
            <Input placeholder="如：广州" maxLength={32} />
          </Form.Item>
          <Form.Item name="name" label="店名" rules={[{ required: true, message: '请输入店名' }]}>
            <Input placeholder="如：北京路店" maxLength={64} />
          </Form.Item>
          <Form.Item
            name="slug"
            label="URL 标识 (slug)"
            rules={[{ required: true, message: '请输入 slug' }]}
          >
            <Input placeholder="如：beijing-lu" maxLength={64} />
          </Form.Item>
          <Form.Item name="highlight" label="一句话亮点">
            <Input placeholder="如：社区人气王，日销 300+ 份" maxLength={255} />
          </Form.Item>
          <Form.Item name="image_url" label="门店实景图">
            <ImageUpload />
          </Form.Item>
          <Form.Item name="is_active" label="是否展示" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item name="sort_order" label="排序权重">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
