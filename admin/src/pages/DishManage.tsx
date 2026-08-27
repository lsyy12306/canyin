import { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Select, Switch, Space, Popconfirm, Tag, Image, App } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { getDishes, createDish, updateDish, deleteDish, getDishCategories } from '../api/dishes';
import { normalizeList, formatPrice } from '../utils/helpers';
import ImageUpload from '../components/ImageUpload';
import type { Dish, DishCategory } from '../types';

export default function DishManage() {
  const [data, setData] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<DishCategory[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Dish | null>(null);
  const [form] = Form.useForm();
  const { message } = App.useApp();

  const load = async () => {
    setLoading(true);
    try {
      const res = await getDishes();
      setData(normalizeList(res));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    getDishCategories().then(setCategories).catch(() => undefined);
  }, []);

  // 打开弹窗后回填表单（Form 已挂载）
  useEffect(() => {
    if (!open) return;
    if (editing) {
      form.setFieldsValue({ ...editing, tags: editing.tags ?? [] });
    } else {
      form.resetFields();
      form.setFieldsValue({ is_recommended: false, is_active: true, tags: [], price: 0, sort_order: 0 });
    }
  }, [open, editing, form]);

  const openCreate = () => {
    setEditing(null);
    setOpen(true);
  };

  const openEdit = (record: Dish) => {
    setEditing(record);
    setOpen(true);
  };

  const handleOk = async () => {
    const values = await form.validateFields();
    if (editing) {
      await updateDish(editing.id, values);
      message.success('已更新');
    } else {
      await createDish(values);
      message.success('已创建');
    }
    setOpen(false);
    load();
  };

  const handleDelete = async (id: number) => {
    await deleteDish(id);
    message.success('已删除');
    load();
  };

  const columns: ColumnsType<Dish> = [
    { title: 'ID', dataIndex: 'id', width: 70 },
    {
      title: '图片',
      dataIndex: 'image_url',
      width: 80,
      render: (v) =>
        v ? <Image src={v} width={48} height={48} style={{ objectFit: 'cover', borderRadius: 6 }} /> : '-',
    },
    { title: '菜名', dataIndex: 'name' },
    {
      title: '分类',
      dataIndex: 'category_id',
      width: 120,
      // 用分类主题色渲染彩色标签（无颜色兜底品牌红），与官网彩色徽标保持一致。
      render: (cid: number) => {
        const c = categories.find((x) => x.id === cid);
        if (!c) return cid;
        return (
          <Tag
            style={{
              background: c.color || '#C8482E',
              color: '#fff',
              borderColor: 'transparent',
              fontWeight: 600,
            }}
          >
            {c.name}
          </Tag>
        );
      },
    },
    { title: '价格', dataIndex: 'price', width: 100, render: (v) => formatPrice(v) },
    {
      title: '标签',
      dataIndex: 'tags',
      width: 160,
      render: (tags: string[]) => (tags ?? []).map((t) => <Tag key={t}>{t}</Tag>),
    },
    {
      title: '推荐',
      dataIndex: 'is_recommended',
      width: 70,
      render: (v) => (v ? <Tag color="volcano">推荐</Tag> : '-'),
    },
    {
      title: '上架',
      dataIndex: 'is_active',
      width: 80,
      render: (v) => (v ? <Tag color="green">上架</Tag> : <Tag color="default">下架</Tag>),
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
          <Popconfirm title="确认删除该菜品？" onConfirm={() => handleDelete(record.id)}>
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
      <div
        style={{
          marginBottom: 16,
          padding: '20px 24px',
          borderRadius: 10,
          background: 'linear-gradient(120deg, #C8482E 0%, #E08A3C 100%)',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <h2 style={{ margin: 0, color: '#fff', fontSize: 20 }}>菜品管理</h2>
          <div style={{ opacity: 0.85, fontSize: 13, marginTop: 4 }}>共 {data.length} 道菜品 · 点击颜色徽标可快速识别分类</div>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={openCreate}
          style={{ background: 'rgba(255,255,255,0.18)', borderColor: 'rgba(255,255,255,0.4)' }}
        >
          新增菜品
        </Button>
      </div>

      <Table rowKey="id" loading={loading} columns={columns} dataSource={data} scroll={{ x: 920 }} />

      <Modal
        title={editing ? '编辑菜品' : '新增菜品'}
        open={open}
        onOk={handleOk}
        onCancel={() => setOpen(false)}
        okText="保存"
        cancelText="取消"
        width={640}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="菜名" rules={[{ required: true, message: '请输入菜名' }]}>
            <Input placeholder="如：古法烧腩仔" maxLength={64} />
          </Form.Item>
          <Form.Item
            name="slug"
            label="URL 标识 (slug)"
            rules={[{ required: true, message: '请输入 slug' }]}
          >
            <Input placeholder="如：gu-fa-shao-ru-zai" maxLength={64} />
          </Form.Item>
          <Form.Item name="category_id" label="分类" rules={[{ required: true, message: '请选择分类' }]}>
            <Select
              placeholder="选择分类"
              options={categories.map((c) => ({ label: c.name, value: c.id }))}
            />
          </Form.Item>
          <Form.Item
            name="price"
            label="价格（分）"
            tooltip="整数，单位：分。4800 表示 ¥48.00"
            rules={[{ required: true, message: '请输入价格' }]}
          >
            <InputNumber min={0} step={100} style={{ width: '100%' }} placeholder="单位：分" />
          </Form.Item>
          <Form.Item name="description" label="简介">
            <Input.TextArea rows={2} maxLength={255} showCount />
          </Form.Item>
          <Form.Item name="tags" label="标签">
            <Select
              mode="tags"
              placeholder="输入后回车添加，如：招牌"
              tokenSeparators={[',']}
              suffixIcon={null}
            />
          </Form.Item>
          <Form.Item name="image_url" label="图片">
            <ImageUpload />
          </Form.Item>
          <Space size="large">
            <Form.Item name="is_recommended" label="首页推荐" valuePropName="checked">
              <Switch />
            </Form.Item>
            <Form.Item name="is_active" label="是否上架" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Space>
          <Form.Item name="sort_order" label="排序权重">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
