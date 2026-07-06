import { useEffect, useState, useCallback } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const ORDERS_URL = 'https://functions.poehali.dev/7647836b-6e1f-4b8c-88df-598b8dba915e';
const AUTH_KEY = 'belosnezhka_admin_auth';

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

const PAGE_SIZES = [5, 10, 25, 50, 100];

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

const Admin = () => {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem(AUTH_KEY) === '1');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [updating, setUpdating] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');
    try {
      const res = await fetch(ORDERS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Неверный пароль');
      }
      sessionStorage.setItem(AUTH_KEY, '1');
      setAuthed(true);
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Ошибка входа');
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = () => {
    sessionStorage.removeItem(AUTH_KEY);
    setAuthed(false);
    setPassword('');
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (search) params.set('search', search);
      if (statusFilter !== 'all') params.set('status', statusFilter);
      const res = await fetch(`${ORDERS_URL}?${params.toString()}`);
      const data = await res.json();
      setOrders(data.orders || []);
      setTotal(data.total || 0);
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, statusFilter]);

  useEffect(() => {
    if (authed) load();
  }, [authed, load]);

  const runSearch = () => {
    setPage(1);
    setSearch(searchInput.trim());
  };

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

  const totalPages = Math.max(1, Math.ceil(total / limit));

  if (!authed) {
    return (
      <div className="min-h-screen bg-[#f5fafd] font-body flex items-center justify-center px-4">
        <form
          onSubmit={login}
          className="w-full max-w-sm bg-white rounded-3xl shadow-xl shadow-primary/5 p-8"
        >
          <div className="flex justify-center mb-6">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary text-primary">
              <Icon name="Lock" size={26} />
            </span>
          </div>
          <h1 className="font-heading font-bold text-xl text-center mb-1">Панель заявок</h1>
          <p className="text-sm text-muted-foreground text-center mb-6">Прачечная «Белоснежка»</p>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Введите пароль"
            className="h-12 rounded-xl bg-[#f5fafd] mb-4"
            autoFocus
          />
          {authError && <p className="text-destructive text-sm text-center mb-4">{authError}</p>}
          <Button type="submit" disabled={authLoading} className="w-full rounded-xl h-12 font-semibold">
            {authLoading ? 'Проверяем...' : 'Войти'}
          </Button>
        </form>
      </div>
    );
  }

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
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => load()} className="rounded-full">
              <Icon name="RefreshCw" size={16} className="mr-2" /> Обновить
            </Button>
            <Button variant="ghost" onClick={logout} className="rounded-full">
              <Icon name="LogOut" size={16} className="mr-2" /> Выйти
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-72">
              <Input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && runSearch()}
                placeholder="Поиск по имени или телефону"
                className="h-10 rounded-xl bg-[#f5fafd]"
              />
            </div>
            <Button onClick={runSearch} size="icon" className="rounded-xl h-10 w-10 shrink-0">
              <Icon name="Search" size={16} />
            </Button>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground whitespace-nowrap">Статус:</span>
            <Select
              value={statusFilter}
              onValueChange={(v) => {
                setStatusFilter(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-48 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все статусы</SelectItem>
                {Object.entries(STATUS_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <p className="text-muted-foreground">
            Всего заявок: <span className="font-semibold text-foreground">{total}</span>
          </p>

          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Строк на странице:</span>
            <Select
              value={String(limit)}
              onValueChange={(v) => {
                setLimit(Number(v));
                setPage(1);
              }}
            >
              <SelectTrigger className="w-20 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAGE_SIZES.map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-border shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-14">№</TableHead>
                <TableHead>Имя</TableHead>
                <TableHead>Телефон</TableHead>
                <TableHead>Комментарий</TableHead>
                <TableHead>IP-адрес</TableHead>
                <TableHead>ОС</TableHead>
                <TableHead>Дата</TableHead>
                <TableHead className="w-56">Статус</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                    Загрузка заявок...
                  </TableCell>
                </TableRow>
              ) : orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                    Заявок пока нет
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell className="font-medium">{order.name}</TableCell>
                    <TableCell>
                      <a href={`tel:${order.phone}`} className="text-primary hover:underline">
                        {order.phone}
                      </a>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <span className="text-muted-foreground line-clamp-2">{order.comment || '—'}</span>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">{order.ip_address || '—'}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">{order.os_info || '—'}</TableCell>
                    <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
                      {formatDate(order.created_at)}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={order.status}
                        onValueChange={(v) => changeStatus(order.id, v)}
                        disabled={updating === order.id}
                      >
                        <SelectTrigger className="w-full rounded-xl">
                          <SelectValue>
                            <span
                              className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${STATUS_COLORS[order.status]}`}
                            >
                              {STATUS_LABELS[order.status] || order.status}
                            </span>
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(STATUS_LABELS).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <Icon name="ChevronLeft" size={18} />
            </Button>
            <span className="text-sm text-muted-foreground px-3">
              Страница {page} из {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              <Icon name="ChevronRight" size={18} />
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Admin;