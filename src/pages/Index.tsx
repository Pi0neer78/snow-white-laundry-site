import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const MAID = 'https://cdn.poehali.dev/projects/3a749f47-e4bb-4bb2-bfdd-eea651eef4ec/bucket/f7509daa-b67d-49b3-a1bc-c005585a0516.png';
const HERO = 'https://cdn.poehali.dev/projects/3a749f47-e4bb-4bb2-bfdd-eea651eef4ec/files/f0da4b9e-ba5b-48b5-83a7-0f7ce76df943.jpg';

const services = [
  { icon: 'Shirt', title: 'Стирка белья', text: 'Постельное, махровое и повседневное бельё для дома и семьи.' },
  { icon: 'Building2', title: 'Для больниц', text: 'Дезинфекция и стирка медицинского текстиля по стандартам.' },
  { icon: 'Coffee', title: 'Для кафе и ресторанов', text: 'Скатерти, салфетки, униформа — всегда белоснежно чистые.' },
  { icon: 'Sparkles', title: 'Глажка и упаковка', text: 'Профессиональная глажка и аккуратная упаковка каждой вещи.' },
  { icon: 'Truck', title: 'Доставка', text: 'Заберём грязное и привезём чистое прямо к вашей двери.' },
  { icon: 'Clock', title: 'Срочный заказ', text: 'Экспресс-стирка за несколько часов, когда нужно быстро.' },
];

const advantages = [
  { icon: 'Leaf', title: 'Эко-средства' },
  { icon: 'ShieldCheck', title: 'Гарантия качества' },
  { icon: 'Timer', title: 'Точно в срок' },
  { icon: 'HeartHandshake', title: 'Индивидуальный подход' },
];

const benefits = [
  'Экологичные и гипоаллергенные средства',
  'Дезинфекция для медицинских учреждений',
  'Договоры и документы для организаций',
];

const nav = [
  { label: 'Главная', id: 'home' },
  { label: 'Услуги', id: 'services' },
  { label: 'О нас', id: 'about' },
  { label: 'Цены', id: 'prices' },
  { label: 'Контакты', id: 'contacts' },
];

const scrollTo = (id: string) => {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
};

const SUBMIT_ORDER_URL = 'https://functions.poehali.dev/95f7f5c7-ed58-4d14-8385-c2f63ceaaf4c';

const Index = () => {
  const [form, setForm] = useState({ name: '', phone: '', comment: '' });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(SUBMIT_ORDER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Ошибка отправки');
      setSent(true);
      setForm({ name: '', phone: '', comment: '' });
      setTimeout(() => setSent(false), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось отправить заявку');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white font-body text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-border overflow-visible">
        <div className="container flex items-center justify-between h-20 overflow-visible">
          <button onClick={() => scrollTo('home')} className="flex items-center gap-2 overflow-visible">
            <img src={MAID} alt="Белоснежка" className="h-[150px] w-auto object-contain mt-28" />
            <span className="font-heading font-extrabold text-2xl text-accent tracking-wide">"БЕЛОСНЕЖКА"</span>
          </button>
          <nav className="hidden lg:flex items-center gap-8">
            {nav.map((n) => (
              <button key={n.id} onClick={() => scrollTo(n.id)} className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                {n.label}
              </button>
            ))}
          </nav>
          <Button onClick={() => scrollTo('contacts')} className="rounded-full px-6 font-semibold shadow-md shadow-primary/20">
            Заказать онлайн
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section id="home" className="relative overflow-hidden bg-gradient-to-b from-[#eaf6fd] to-white">
        <div className="container grid lg:grid-cols-2 gap-12 items-center py-16 lg:py-24">
          <div className="animate-fade-in">
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-primary shadow-sm mb-6">
              <Icon name="Sparkles" size={16} /> Чисто. Свежо. Вовремя.
            </span>
            <h1 className="font-heading font-black text-3xl sm:text-4xl lg:text-5xl xl:text-6xl leading-[1.1] mb-6">
              Профессиональная <span className="text-primary">прачечная</span> для вас и вашего бизнеса
            </h1>
            <p className="text-lg text-muted-foreground max-w-md mb-8">
              Стираем и гладим бельё для населения, больниц, кафе и организаций. Забираем и доставляем — вам остаётся только наслаждаться свежестью.
            </p>
            <div className="flex flex-wrap gap-4 mb-12">
              <Button onClick={() => scrollTo('contacts')} size="lg" className="rounded-full px-8 font-semibold shadow-lg shadow-primary/25">
                Оформить заказ
              </Button>
              <Button onClick={() => scrollTo('prices')} size="lg" variant="outline" className="rounded-full px-8 font-semibold border-2">
                Смотреть цены
              </Button>
            </div>
            <div className="flex gap-12">
              <div>
                <div className="font-heading font-extrabold text-3xl text-primary">50+</div>
                <div className="text-sm text-muted-foreground">клиентов</div>
              </div>
              <div>
                <div className="font-heading font-extrabold text-3xl text-primary">24 ч</div>
                <div className="text-sm text-muted-foreground">срочный заказ</div>
              </div>
            </div>
          </div>
          <div className="animate-fade-in relative z-0" style={{ animationDelay: '0.15s' }}>
            <img src={HERO} alt="Стопки свежего белья" className="animate-float rounded-[2rem] shadow-2xl shadow-primary/10 w-full max-w-md xl:max-w-lg mx-auto object-cover aspect-square" />
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-20 lg:py-28">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-heading font-black text-4xl lg:text-5xl mb-4">Наши услуги</h2>
            <p className="text-lg text-muted-foreground">Полный цикл ухода за текстилем для дома и организаций</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((s) => (
              <div key={s.title} className="group rounded-3xl border border-border bg-white p-8 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 transition-all">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                  <Icon name={s.icon} size={26} />
                </div>
                <h3 className="font-heading font-bold text-xl mb-3">{s.title}</h3>
                <p className="text-muted-foreground">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-20 lg:py-28 bg-[#eef7fb]">
        <div className="container grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="font-heading font-black text-4xl lg:text-5xl mb-6">О прачечной «Белоснежка»</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Мы — команда профессионалов, которой доверяют уже 50+ клиентов. Используем современное оборудование, экологичные средства и строго соблюдаем санитарные нормы. Работаем с частными клиентами и с организациями.
            </p>
            <ul className="space-y-4">
              {benefits.map((b) => (
                <li key={b} className="flex items-center gap-3">
                  <Icon name="CheckCircle2" size={22} className="text-primary shrink-0" />
                  <span className="font-medium">{b}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="grid grid-cols-2 gap-6">
            {advantages.map((a) => (
              <div key={a.title} className="rounded-3xl bg-white p-8 text-center shadow-sm hover:shadow-lg transition-shadow">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary text-primary">
                  <Icon name={a.icon} size={26} />
                </div>
                <div className="font-heading font-semibold">{a.title}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Prices */}
      <section id="prices" className="py-20 lg:py-28">
        <div className="container max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="font-heading font-black text-4xl lg:text-5xl mb-4">Цены</h2>
            <p className="text-lg text-muted-foreground">Прозрачные тарифы без скрытых платежей</p>
          </div>

          <h3 className="font-heading font-bold text-xl text-red-600 text-center mb-6">
            Прейскурант на стирку белья, гардин, тюль и штор
          </h3>
          <div className="overflow-x-auto mb-16">
            <table className="w-full border-collapse border border-black text-sm">
              <thead>
                <tr>
                  <th className="border border-black p-3 font-bold w-12">№</th>
                  <th className="border border-black p-3 font-bold text-left">Наименование изделий</th>
                  <th className="border border-black p-3 font-bold text-left w-56"></th>
                  <th className="border border-black p-3 font-bold w-32">Цена</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td rowSpan={2} className="border border-black p-3 text-center align-middle">1</td>
                  <td rowSpan={2} className="border border-black p-3 font-bold align-middle">Стирка белья:</td>
                  <td className="border border-black p-3">до 4 кг – (независимо от массы сданного белья)</td>
                  <td className="border border-black p-3 text-right font-bold">900 руб.</td>
                </tr>
                <tr>
                  <td className="border border-black p-3">свыше 4 кг</td>
                  <td className="border border-black p-3 text-right font-bold">225 руб.<br />за 1 кг</td>
                </tr>
                <tr>
                  <td rowSpan={2} className="border border-black p-3 text-center align-middle">2</td>
                  <td rowSpan={2} className="border border-black p-3 font-bold align-middle">Стирка белья с добавлением крахмала:</td>
                  <td className="border border-black p-3">до 4 кг – (независимо от массы сданного белья)</td>
                  <td className="border border-black p-3 text-right font-bold">1200 руб.</td>
                </tr>
                <tr>
                  <td className="border border-black p-3">свыше 4 кг</td>
                  <td className="border border-black p-3 text-right font-bold">300 руб.<br />за 1 кг</td>
                </tr>
                <tr>
                  <td className="border border-black p-3 text-center">3</td>
                  <td colSpan={2} className="border border-black p-3 font-bold">Гардины, тюль, шторы</td>
                  <td className="border border-black p-3 text-right font-bold">650 руб.<br />за 1 кг</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className="font-heading font-bold text-xl text-red-600 text-center mb-6">
            Прейскурант на услуги прачечной для спецодежды
          </h3>
          <div className="overflow-x-auto mb-10">
            <table className="w-full border-collapse border border-black text-sm">
              <thead>
                <tr>
                  <th className="border border-black p-3 font-bold w-12">№</th>
                  <th className="border border-black p-3 font-bold text-left">Наименование изделий</th>
                  <th className="border border-black p-3 font-bold w-40">Цена(руб)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-black p-3 text-center">1</td>
                  <td className="border border-black p-3">Спец. одежда за 1кг (без глажки)</td>
                  <td className="border border-black p-3 text-right font-bold">300</td>
                </tr>
                <tr>
                  <td className="border border-black p-3 text-center">1</td>
                  <td className="border border-black p-3">Спец. одежда за 1кг (с глажкой)</td>
                  <td className="border border-black p-3 text-right font-bold">550</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="text-center">
            <p className="font-heading font-bold text-lg mb-1">Надбавка за сложность + 30%</p>
            <p className="text-muted-foreground">Для организаций действуют специальные условия — уточняйте при заказе.</p>
          </div>
        </div>
      </section>

      {/* Contacts */}
      <section id="contacts" className="py-20 lg:py-28 bg-[#eef7fb]">
        <div className="container grid lg:grid-cols-2 gap-12">
          <div>
            <h2 className="font-heading font-black text-4xl lg:text-5xl mb-4">Заказ онлайн</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Оставьте заявку — перезвоним, уточним детали и заберём бельё.
            </p>
            <div className="space-y-5 mb-8">
              <a href="tel:+79591368053" className="flex items-center gap-4 group">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-primary"><Icon name="Phone" size={22} /></span>
                <span className="font-semibold group-hover:text-primary transition-colors">+7 (959) 136-80-53</span>
              </a>
              <a href="mailto:irinka-0909@mail.ru" className="flex items-center gap-4 group">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-primary"><Icon name="Mail" size={22} /></span>
                <span className="font-semibold group-hover:text-primary transition-colors">irinka-0909@mail.ru</span>
              </a>
              <div className="flex items-center gap-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-primary shrink-0"><Icon name="MapPin" size={22} /></span>
                <span className="font-semibold">ЛНР, м.о. Антрацитовский, г. Антрацит, ул. Смирнова, д. 15 А</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-primary"><Icon name="Clock" size={22} /></span>
                <span className="font-semibold">С понедельника по пятницу с 8:00 до 16:00</span>
              </div>
            </div>
            <div className="rounded-2xl overflow-hidden border border-border h-72 bg-white">
              <iframe
                title="Карта: г. Антрацит, ул. Смирнова, д. 15 А"
                src="https://yandex.ru/map-widget/v1/?text=г.%20Антрацит%2C%20ул.%20Смирнова%2C%20д.%2015%20А&z=16"
                className="w-full h-full border-0"
                loading="lazy"
              />
            </div>
          </div>

          <div className="rounded-3xl bg-white p-8 lg:p-10 shadow-xl shadow-primary/5">
            <form onSubmit={submit} className="space-y-5">
              <div>
                <label className="block font-medium mb-2">Ваше имя</label>
                <Input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Как к вам обращаться?"
                  className="h-12 rounded-xl bg-[#f5fafd]"
                />
              </div>
              <div>
                <label className="block font-medium mb-2">Телефон</label>
                <Input
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+7 (___) ___-__-__"
                  className="h-12 rounded-xl bg-[#f5fafd]"
                />
              </div>
              <div>
                <label className="block font-medium mb-2">Комментарий</label>
                <Textarea
                  value={form.comment}
                  onChange={(e) => setForm({ ...form, comment: e.target.value })}
                  placeholder="Что нужно постирать и когда забрать?"
                  className="min-h-28 rounded-xl bg-[#f5fafd]"
                />
              </div>
              <Button type="submit" size="lg" disabled={loading} className="w-full rounded-xl font-semibold text-base">
                {loading ? 'Отправляем...' : 'Отправить заявку'}
              </Button>
              {sent && (
                <p className="text-center text-primary font-medium animate-fade-in">
                  Спасибо! Заявка отправлена, скоро перезвоним.
                </p>
              )}
              {error && (
                <p className="text-center text-destructive font-medium animate-fade-in">
                  {error}
                </p>
              )}
              <p className="text-center text-sm text-muted-foreground">
                Нажимая кнопку, вы соглашаетесь на обработку персональных данных.
              </p>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white"><Icon name="Snowflake" size={18} /></span>
            <span className="font-heading font-bold">Белоснежка</span>
          </div>
          <p className="text-sm text-muted-foreground">© 2026 Прачечная «Белоснежка». Все права защищены.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;