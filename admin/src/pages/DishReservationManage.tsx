import { useEffect, useState } from 'react';
import { Table, Select, Space, Tag, Typography, Drawer, Descriptions, List, Popconfirm, Button, App } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { getReservations, updateReservationStatus, deleteReservation } from '../api/reservation';
import { normalizeList, formatDateTime } from '../utils/helpers';
import type { DishReservation, ReservationStatus } from '../types';

// 后台“预约管理”页面（基于 AntD）。
// 功能概述：集中展示顾客在前台提交的“提前预约菜品”线索；
// - 顶部可按状态筛选；
// - 表格列出联系人/手机/门店/预约时间/人数/明细数量/状态；
// - 状态列用下拉框直接流转（pending/confirmed/done/cancelled）；
// - “查看 N 道”打开右侧抽屉看完整明细并可标记确认/完成；
// - 删除走 Popconfirm 二次确认，后端级联清明细。
// 状态对应的中文文案与标签色由 STATUS_META 统一维护，避免散落硬编码。
const STATUS_OPTIONS: { label: string; value: ReservationStatus }[] = [
  { label: '待确认', value: 'pending' },
  { label: '已确认', value: 'confirmed' },
  { label: '已完成', value: 'done' },
  { label: '已取消', value: 'cancelled' },
];

// 状态 -> { 标签色, 中文 } 映射，供表格 Tag 与明细抽屉统一取用。
const STATUS_META: Record<ReservationStatus, { color: string; label: string }> = {
  pending: { color: 'gold', label: '待确认' },
  confirmed: { color: 'green', label: '已确认' },
  done: { color: 'blue', label: '已完成' },
  cancelled: { color: 'default', label: '已取消' },
};

export default function DishReservationManage() {
  const [data, setData] = useState<DishReservation[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<ReservationStatus | undefined>();
  const [detail, setDetail] = useState<DishReservation | null>(null);
  const { message } = App.useApp();

  const load = async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = {};
      if (status) params.status = status;
      const res = await getReservations(params);
      setData(normalizeList(res));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  // 流转状态：调用 PUT /api/admin/dish-reservations/{id}/status，
  // 成功后提示并重新拉取列表，保持视图与数据库一致。
  const changeStatus = async (id: number, value: ReservationStatus) => {
    await updateReservationStatus(id, value);
    message.success('状态已更新');
    load();
  };

  const handleDelete = async (id: number) => {
    await deleteReservation(id);
    message.success('已删除');
    load();
  };

  const columns: ColumnsType<DishReservation> = [
    { title: 'ID', dataIndex: 'id', width: 70 },
    { title: '联系人', dataIndex: 'name', width: 100 },
    { title: '手机号', dataIndex: 'phone', width: 140 },
    { title: '门店', dataIndex: 'store_name', width: 140, render: (v) => v || '-' },
    {
      title: '预约日期',
      dataIndex: 'reserve_date',
      width: 120,
      render: (v: string, r) => `${v}${r.reserve_time ? ' ' + r.reserve_time : ''}`,
    },
    { title: '人数', dataIndex: 'guests', width: 70, render: (v) => `${v} 人` },
    {
      title: '菜品明细',
      width: 120,
      render: (_, r) => (
        <Button type="link" size="small" onClick={() => setDetail(r)}>
          查看 {r.items.length} 道
        </Button>
      ),
    },
    { title: '提交时间', dataIndex: 'created_at', width: 170, render: (v) => formatDateTime(v) },
    {
      title: '状态',
      dataIndex: 'status',
      width: 160,
      render: (s: ReservationStatus, record) => (
        <Select
          value={s}
          options={STATUS_OPTIONS}
          onChange={(v) => changeStatus(record.id, v)}
          style={{ width: 120 }}
          variant="borderless"
        />
      ),
    },
    {
      title: '操作',
      width: 90,
      fixed: 'right',
      render: (_, record) => (
        <Popconfirm title="确认删除该预约？" onConfirm={() => handleDelete(record.id)}>
          <Button size="small" danger>
            删除
          </Button>
        </Popconfirm>
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
          <h2 style={{ margin: 0, color: '#fff', fontSize: 20 }}>预约管理</h2>
          <div style={{ opacity: 0.85, fontSize: 13, marginTop: 4 }}>
            顾客在小程序/官网提交的「提前预约菜品」将集中显示在这里，可确认、完成或取消。
          </div>
        </div>
        <Select
          allowClear
          placeholder="按状态筛选"
          options={STATUS_OPTIONS}
          value={status}
          onChange={(v) => setStatus(v)}
          style={{ width: 180 }}
        />
      </div>

      <Typography.Paragraph type="secondary">共 {data.length} 条记录</Typography.Paragraph>
      <Table rowKey="id" loading={loading} columns={columns} dataSource={data} scroll={{ x: 1100 }} />

      <Drawer
        title="预约明细"
        width={420}
        open={!!detail}
        onClose={() => setDetail(null)}
      >
        {detail && (
          <>
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="联系人">{detail.name}</Descriptions.Item>
              <Descriptions.Item label="手机号">{detail.phone}</Descriptions.Item>
              <Descriptions.Item label="门店">{detail.store_name}</Descriptions.Item>
              <Descriptions.Item label="预约日期">
                {detail.reserve_date} {detail.reserve_time}
              </Descriptions.Item>
              <Descriptions.Item label="用餐人数">{detail.guests} 人</Descriptions.Item>
              <Descriptions.Item label="备注">{detail.note || '-'}</Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={STATUS_META[detail.status].color}>{STATUS_META[detail.status].label}</Tag>
              </Descriptions.Item>
            </Descriptions>
            <Typography.Title level={5} style={{ marginTop: 20 }}>
              预约菜品
            </Typography.Title>
            <List
              size="small"
              bordered
              dataSource={detail.items}
              renderItem={(it) => (
                <List.Item>
                  <span>{it.dish_name || `菜品#${it.dish_id}`}</span>
                  <Tag color="volcano">× {it.quantity}</Tag>
                </List.Item>
              )}
            />
            <Space style={{ marginTop: 20 }}>
              <Button
                type="primary"
                onClick={() => changeStatus(detail.id, 'confirmed')}
                disabled={detail.status === 'confirmed'}
              >
                标记为已确认
              </Button>
              <Button onClick={() => changeStatus(detail.id, 'done')} disabled={detail.status === 'done'}>
                标记为已完成
              </Button>
            </Space>
          </>
        )}
      </Drawer>
    </div>
  );
}
