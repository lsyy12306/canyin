import { useEffect, useMemo, useState } from 'react';
import { getStores } from '../api/stores';
import { getAllDishes } from '../api/dishes';
import { createReservation } from '../api/dishReservations';
import { showToast } from './Toast';
import { formatPrice } from '../utils/helpers';
import type { DishOut, Store } from '../types';

interface Props {
  open: boolean;
  onClose: () => void;
  /** 从菜品卡片点“提前预约”带入的预选菜品 */
  presetDish?: DishOut | null;
}

interface FormState {
  store_id: number | '';
  name: string;
  phone: string;
  reserve_date: string;
  reserve_time: string;
  guests: number;
  note: string;
  qty: Record<number, number>; // dish_id -> 数量
}

const emptyForm: FormState = {
  store_id: '',
  name: '',
  phone: '',
  reserve_date: '',
  reserve_time: '',
  guests: 2,
  note: '',
  qty: {},
};

export default function ReservationModal({ open, onClose, presetDish }: Props) {
  const [stores, setStores] = useState<Store[]>([]);
  const [dishes, setDishes] = useState<DishOut[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    getStores().then(setStores).catch(() => setStores([]));
    getAllDishes().then(setDishes).catch(() => setDishes([]));
  }, [open]);

  // 带入预选菜品
  useEffect(() => {
    if (open && presetDish) {
      setForm((f) => ({ ...emptyForm, qty: { [presetDish.id]: 1 } }));
    } else if (open) {
      setForm(emptyForm);
    }
  }, [open, presetDish]);

  const totalQty = useMemo(
    () => Object.values(form.qty).reduce((a, b) => a + b, 0),
    [form.qty],
  );

  if (!open) return null;

  const setQty = (id: number, q: number) => {
    setForm((f) => {
      const next = { ...f.qty };
      if (q <= 0) delete next[id];
      else next[id] = q;
      return { ...f, qty: next };
    });
  };

  const submit = async () => {
    if (!form.store_id) return showToast('error', '请选择预约门店');
    if (!form.name.trim()) return showToast('error', '请填写联系人姓名');
    if (!/^\d{5,16}$/.test(form.phone.trim()))
      return showToast('error', '请填写正确的手机号');
    if (!form.reserve_date) return showToast('error', '请选择预约日期');
    if (totalQty === 0) return showToast('error', '请至少选择一道菜');

    const items = Object.entries(form.qty).map(([id, quantity]) => ({
      dish_id: Number(id),
      quantity,
    }));

    setSubmitting(true);
    try {
      await createReservation({
        store_id: Number(form.store_id),
        name: form.name.trim(),
        phone: form.phone.trim(),
        reserve_date: form.reserve_date,
        reserve_time: form.reserve_time,
        guests: form.guests,
        note: form.note.trim(),
        items,
      });
      showToast('success', '预约提交成功，门店将尽快与您确认！');
      onClose();
    } catch {
      // 错误已在拦截器 toast
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-mask" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>提前预约菜品</h3>
          <button type="button" className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="modal-body">
          <div className="form-row">
            <label>预约门店</label>
            <select
              value={form.store_id}
              onChange={(e) =>
                setForm((f) => ({ ...f, store_id: e.target.value ? Number(e.target.value) : '' }))
              }
            >
              <option value="">请选择门店</option>
              {stores.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.city} · {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-row two">
            <div>
              <label>联系人</label>
              <input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="您的称呼"
              />
            </div>
            <div>
              <label>手机号</label>
              <input
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder="接收确认短信"
              />
            </div>
          </div>

          <div className="form-row two">
            <div>
              <label>预约日期</label>
              <input
                type="date"
                value={form.reserve_date}
                onChange={(e) => setForm((f) => ({ ...f, reserve_date: e.target.value }))}
              />
            </div>
            <div>
              <label>预约时间</label>
              <input
                type="time"
                value={form.reserve_time}
                onChange={(e) => setForm((f) => ({ ...f, reserve_time: e.target.value }))}
              />
            </div>
          </div>

          <div className="form-row">
            <label>用餐人数：{form.guests} 人</label>
            <input
              type="range"
              min={1}
              max={20}
              value={form.guests}
              onChange={(e) =>
                setForm((f) => ({ ...f, guests: Number(e.target.value) }))
              }
            />
          </div>

          <div className="form-row">
            <label>选择菜品（点击 + / − 调整数量）</label>
            <div className="dish-picker">
              {dishes.map((d) => (
                <div key={d.id} className="dish-pick-row">
                  <span className="dp-name">{d.name}</span>
                  <span className="dp-price">{formatPrice(d.price, d.price_text)}</span>
                  <div className="stepper">
                    <button
                      type="button"
                      onClick={() => setQty(d.id, (form.qty[d.id] || 0) - 1)}
                    >
                      −
                    </button>
                    <span>{form.qty[d.id] || 0}</span>
                    <button
                      type="button"
                      onClick={() => setQty(d.id, (form.qty[d.id] || 0) + 1)}
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="form-row">
            <label>备注</label>
            <textarea
              value={form.note}
              onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
              placeholder="口味、忌口、座位偏好等"
              rows={2}
            />
          </div>
        </div>
        <div className="modal-foot">
          <span className="res-total">已选 {totalQty} 道</span>
          <button
            type="button"
            className="btn btn-primary"
            disabled={submitting}
            onClick={submit}
          >
            {submitting ? '提交中…' : '提交预约'}
          </button>
        </div>
      </div>
    </div>
  );
}
