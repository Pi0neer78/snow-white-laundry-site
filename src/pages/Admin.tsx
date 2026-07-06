import { useEffect, useState, useCallback } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const ORDERS_URL = 'https://functions.poehali.dev/7647836b-6e1f-4b8c-88df-598b8dba915e';

interface Order {
  id: number;
  name: string;
  phone: string;
  comment: string;
  ip_address: string;
  user_agent: string;
  os_info: string;
  created_at: string;
  status: string;
}

const STATUS_LABELS: Record<string, string> = {
  new: 'Новая',
  in_progress: 'В работе',
  done: 'Выполнена',
  delivered: 'Выполнена и доставлена',
  cancelled: 'Отменена',
};

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-blue-100 text-blue-700 border-blue-200',
  in_progress: 'bg-amber-100 text-amber-700 border-amber-200',
  done: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  delivered: 'bg-teal-100 text-teal-700 border-teal-200',
  cancelled: 'bg-red-100 text-red-700 border-red-200',
};

const FILTERS = ['all', 'new', 'in_progress', 'done', 'delivered', 'cancelled'];

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

const Admin = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [updating, setUpdating] = useState<number | null>(null);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch(ORDERS_URL);
      const data = await res.json();
      setOrders(data.orders || []);
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(() => load(true), 300000);
    return () => clearInterval(interval);
  }, [load]);

  const changeStatus = async (id: number, status: string) => {
    setUpdating(id);
    try {
      await fetch(ORDERS_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    } finally {
      setUpdating(null);
    }
  };

  const filtered = filter === 'all' ? orders : orders.filter((o) => o.status === filter);
  const counts = FILTERS.reduce<Record<string, number>>((acc, f) => {
    acc[f] = f === 'all' ? orders.length : orders.filter((o) => o.status === f).length;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-[#f5fafd] font-body">
      <header className="bg-white border-b border-border sticky top-0 z-10">
        <div className="container flex items-center justify-between h-20">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white">
              <Icon name="Snowflake" size={20} />
            </span>
            <div>
              <h1 className="font-heading font-bold text-lg leading-none">Белоснежка</h1>
              <p className="text-xs text-muted-foreground">Панель заявок</p>
            </div>
          </div>
          <Button variant="outline" onClick={() => load()} className="rounded-full">
            <Icon name="RefreshCw" size={16} className="mr-2" /> Обновить
          </Button>
        </div>
      </header>

      <main className="container py-8">
        <div className="flex flex-wrap gap-2 mb-8">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-4 py-2 text-sm font-medium border transition-colors ${
                filter === f
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white text-muted-foreground border-border hover:border-primary'
              }`}
            >
              {f === 'all' ? 'Все' : STATUS_LABELS[f]} ({counts[f] ?? 0})
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-20 text-muted-foreground">Загрузка заявок...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">Заявок пока нет</div>
        ) : (
          <div className="space-y-4">
            {filtered.map((order) => (
              <div
                key={order.id}
                className="rounded-2xl bg-white border border-border p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-heading font-bold text-lg">{order.name}</span>
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${STATUS_COLORS[order.status]}`}
                      >
                        {STATUS_LABELS[order.status] || order.status}
                      </span>
                    </div>
                    <a href={`tel:${order.phone}`} className="text-primary font-medium hover:underline">
                      {order.phone}
                    </a>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    <div>#{order.id}</div>
                    <div>{formatDate(order.created_at)}</div>
                  </div>
                </div>

                {order.comment && (
                  <p className="text-muted-foreground mb-4 bg-[#f5fafd] rounded-xl p-3">{order.comment}</p>
                )}

                <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-border">
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Icon name="Globe" size={14} /> {order.ip_address || '—'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Icon name="Monitor" size={14} /> {order.os_info || '—'}
                    </span>
                  </div>
                  <Select
                    value={order.status}
                    onValueChange={(v) => changeStatus(order.id, v)}
                    disabled={updating === order.id}
                  >
                    <SelectTrigger className="w-56 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(STATUS_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Admin;
