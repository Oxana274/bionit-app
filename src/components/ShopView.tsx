"use client";

import { useMemo, useState } from "react";
import { App, Button, Empty, InputNumber, Modal, Select } from "antd";
import { BionicCoin, PageHeader, ProductArtwork, StatusPill } from "@/components/Brand";
import { Icon } from "@/components/Icon";
import { formatDateTime } from "@/lib/utils/format";
import type { ShopData, ShopOrder, ShopProduct } from "@/types/domain";

interface CreateOrderResponse {
  order?: ShopOrder;
  balance?: number;
  error?: string;
}

export function ShopView({ initial }: { initial: ShopData }) {
  const { message } = App.useApp();
  const [balance, setBalance] = useState(initial.balance);
  const [products, setProducts] = useState(initial.products);
  const [orders, setOrders] = useState(initial.recentOrders);
  const [selected, setSelected] = useState<ShopProduct | null>(null);
  const [variantId, setVariantId] = useState<string | undefined>();
  const [quantity, setQuantity] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const selectedVariant = selected?.variants.find((variant) => variant.id === variantId) ?? null;
  const availableStock = selectedVariant?.stock ?? selected?.stock ?? 0;
  const total = (selected?.price ?? 0) * quantity;
  const canOrder = Boolean(
    selected &&
    availableStock >= quantity &&
    balance >= total &&
    (selected.variants.length === 0 || selectedVariant)
  );

  const featured = useMemo(() => products.filter((product) => product.featured), [products]);
  const catalog = useMemo(() => products.filter((product) => !product.featured), [products]);

  const openProduct = (product: ShopProduct) => {
    setSelected(product);
    setVariantId(product.variants[0]?.id);
    setQuantity(1);
  };

  const closeProduct = () => {
    if (submitting) return;
    setSelected(null);
    setVariantId(undefined);
    setQuantity(1);
  };

  const createOrder = async () => {
    if (!selected || !canOrder) return;
    setSubmitting(true);
    try {
      const response = await fetch("/api/shop/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: selected.id,
          variantId: selectedVariant?.id ?? null,
          quantity
        })
      });
      const body = (await response.json()) as CreateOrderResponse;
      if (!response.ok || !body.order) {
        throw new Error(body.error ?? "Не удалось оформить заказ.");
      }

      setOrders((current) => [body.order!, ...current].slice(0, 10));
      setBalance(body.balance ?? Math.max(balance - total, 0));
      setProducts((current) => current.map((product) => {
        if (product.id !== selected.id) return product;
        if (selectedVariant) {
          return {
            ...product,
            stock: Math.max(product.stock - quantity, 0),
            variants: product.variants.map((variant) =>
              variant.id === selectedVariant.id
                ? { ...variant, stock: Math.max(variant.stock - quantity, 0) }
                : variant
            )
          };
        }
        return { ...product, stock: Math.max(product.stock - quantity, 0) };
      }));
      void message.success(`Заказ ${body.order.number} оформлен`);
      closeProduct();
    } catch (error) {
      void message.error(error instanceof Error ? error.message : "Ошибка оформления заказа");
    } finally {
      setSubmitting(false);
    }
  };

  const ProductCard = ({ product, featuredCard = false }: { product: ShopProduct; featuredCard?: boolean }) => {
    const soldOut = product.stock <= 0;
    return <article className={featuredCard ? "product-card featured" : "product-card"}>
      {featuredCard ? <span className="product-label">Выбор команды</span> : null}
      <div className="product-art-wrap"><ProductArtwork product={product}/></div>
      <div className="product-card-body">
        <div className="product-card-title"><h3>{product.title}</h3><BionicCoin value={product.price} compact/></div>
        <p>{product.description}</p>
        <div className="product-card-footer">
          <span className={soldOut ? "stock-label sold-out" : "stock-label"}>{soldOut ? "Нет в наличии" : `Осталось: ${product.stock}`}</span>
          <Button type={featuredCard ? "primary" : "default"} disabled={soldOut} onClick={() => openProduct(product)}>Выбрать</Button>
        </div>
      </div>
    </article>;
  };

  return <div className="shop-page">
    <PageHeader eyebrow="Магазин" title="Мерч за Бионики" description="Меняйте Бионики на вещи, созданные для команды Бионит."/>

    <section className="shop-hero">
      <div><span className="eyebrow light">Доступно сейчас</span><h2>{balance.toLocaleString("ru-RU")} Биоников</h2><p>Бионики списываются сразу после оформления. HR подтвердит заказ и сообщит, когда его можно получить.</p></div>
      <div className="shop-hero-coin"><Icon name="gift" size={40}/><BionicCoin value={balance}/></div>
      <div className="hero-pattern"/>
    </section>

    {featured.length > 0 ? <section className="shop-section">
      <div className="section-title"><div><span className="eyebrow">Рекомендуем</span><h2>Фирменные вещи</h2></div></div>
      <div className="featured-products">{featured.map((product) => <ProductCard key={product.id} product={product} featuredCard/>)}</div>
    </section> : null}

    <section className="shop-section">
      <div className="section-title"><div><span className="eyebrow">Каталог</span><h2>Всё для команды</h2></div><span className="section-counter">{products.length} товаров</span></div>
      <div className="products-grid">{catalog.map((product) => <ProductCard key={product.id} product={product}/>)}</div>
    </section>

    <section className="shop-orders">
      <div className="section-title"><div><span className="eyebrow">Получение</span><h2>Мои заказы</h2></div></div>
      {orders.length === 0 ? <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Заказов пока нет"/> : <div className="orders-list">
        {orders.map((order) => <article className="order-row" key={order.id}>
          <span className="order-icon"><Icon name="orders"/></span>
          <div className="order-main"><strong>{order.productTitle}</strong><span>{order.variantTitle ? `${order.variantTitle} · ` : ""}{order.quantity} шт.</span><small>{order.number} · {formatDateTime(order.createdAt)}</small></div>
          <div className="order-meta"><BionicCoin value={order.total} compact/><StatusPill status={order.status}/></div>
        </article>)}
      </div>}
    </section>

    <Modal
      open={Boolean(selected)}
      onCancel={closeProduct}
      footer={null}
      centered
      width={520}
      title={null}
      className="product-modal"
      destroyOnClose
    >
      {selected ? <div className="product-modal-content">
        <div className="product-modal-art"><ProductArtwork product={selected}/></div>
        <span className="eyebrow">Оформление заказа</span>
        <h2>{selected.title}</h2>
        <p>{selected.description}</p>

        {selected.variants.length > 0 ? <label className="field-block"><span>Вариант</span><Select
          value={variantId}
          onChange={setVariantId}
          options={selected.variants.map((variant) => ({
            value: variant.id,
            label: `${variant.title} — ${variant.stock} шт.`,
            disabled: variant.stock <= 0
          }))}
          size="large"
          style={{ width: "100%" }}
        /></label> : null}

        <label className="field-block"><span>Количество</span><InputNumber
          min={1}
          max={Math.min(availableStock, 20)}
          value={quantity}
          onChange={(value) => setQuantity(value ?? 1)}
          size="large"
          style={{ width: "100%" }}
        /></label>

        <div className="order-summary">
          <div><span>К списанию</span><BionicCoin value={total}/></div>
          <div><span>Останется</span><strong>{Math.max(balance - total, 0).toLocaleString("ru-RU")}</strong></div>
        </div>
        {balance < total ? <div className="inline-warning"><Icon name="warning" size={18}/>Недостаточно Биоников для заказа.</div> : null}
        {availableStock < quantity ? <div className="inline-warning"><Icon name="warning" size={18}/>На складе меньше выбранного количества.</div> : null}
        <Button type="primary" size="large" block disabled={!canOrder} loading={submitting} onClick={() => void createOrder()}>Оформить заказ</Button>
        <Button type="text" size="large" block disabled={submitting} onClick={closeProduct}>Отмена</Button>
      </div> : null}
    </Modal>
  </div>;
}
