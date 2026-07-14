"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { AUTH_ROUTES } from "@/features/auth/constants";
import {
  COMPARISON_GROUPS,
  PRICING_FAQS,
  PRICING_PLANS,
  YEARLY_DISCOUNT_LABEL,
  type BillingCycle,
  type PricingPlan,
} from "@/features/pricing/data/pricing-data";

function formatVnd(amount: number) {
  return `${amount.toLocaleString("vi-VN")}đ`;
}

function planPrice(plan: PricingPlan, cycle: BillingCycle) {
  return cycle === "monthly" ? plan.priceMonthly : plan.priceYearly;
}

function CellValue({ value, color }: { value: string | boolean; color: string }) {
  if (typeof value === "string") {
    return <span className="text-sm font-semibold text-foreground">{value}</span>;
  }
  return value ? (
    <span className="material-symbols-outlined text-xl" style={{ color }} aria-label="Có">
      check_circle
    </span>
  ) : (
    <span className="material-symbols-outlined text-xl text-foreground-muted/40" aria-label="Không">
      remove
    </span>
  );
}

function PlanCard({
  plan,
  cycle,
  index,
}: {
  plan: PricingPlan;
  cycle: BillingCycle;
  index: number;
}) {
  const price = planPrice(plan, cycle);

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -6 }}
      className={`relative flex flex-col rounded-3xl border p-7 sm:p-8 ${
        plan.highlighted
          ? "border-primary bg-card shadow-primary"
          : "border-primary-soft bg-card"
      }`}
    >
      {plan.highlighted && (
        <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-primary px-4 py-1 text-xs font-black uppercase tracking-wide text-background-dark shadow-primary">
          Phổ biến nhất
        </span>
      )}

      <div className="flex items-center gap-3">
        <span
          className="flex h-11 w-11 items-center justify-center rounded-xl"
          style={{
            background: `linear-gradient(135deg, color-mix(in srgb, ${plan.color} 30%, transparent), color-mix(in srgb, ${plan.color} 10%, transparent))`,
            border: `1px solid color-mix(in srgb, ${plan.color} 40%, transparent)`,
          }}
        >
          <span className="material-symbols-outlined text-xl" style={{ color: plan.color }} aria-hidden>
            {plan.icon}
          </span>
        </span>
        <h3 className="text-xl font-black text-foreground">{plan.name}</h3>
      </div>

      <p className="mt-3 min-h-[2.5rem] text-sm leading-relaxed text-foreground-muted">
        {plan.description}
      </p>

      <div className="mt-5 flex min-h-[3.5rem] items-end gap-2">
        <AnimatePresence mode="wait">
          <motion.div
            key={cycle}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="flex items-end gap-2"
          >
            {price === null ? (
              <span className="text-3xl font-black text-foreground">Liên hệ</span>
            ) : price === 0 ? (
              <span className="text-4xl font-black text-foreground">0đ</span>
            ) : (
              <>
                <span className="text-4xl font-black text-foreground">{formatVnd(price)}</span>
                <span className="pb-1 text-sm font-medium text-foreground-muted">/tháng</span>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
      {price !== null && price > 0 && cycle === "yearly" && (
        <p className="mt-1 text-xs font-semibold text-success">
          Thanh toán theo năm — {YEARLY_DISCOUNT_LABEL}
        </p>
      )}

      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} className="mt-6">
        <Link
          href={AUTH_ROUTES.SIGN_IN}
          className={`flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-bold transition-colors ${
            plan.highlighted
              ? "bg-primary text-background-dark shadow-primary hover:bg-primary/90"
              : "border border-primary-soft text-foreground hover:bg-primary-soft"
          }`}
        >
          {plan.cta}
          <span className="material-symbols-outlined text-base" aria-hidden>
            arrow_forward
          </span>
        </Link>
      </motion.div>

      <ul className="mt-7 flex flex-col gap-3 border-t border-primary-soft pt-6">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-3 text-sm text-foreground-muted">
            <span
              className="material-symbols-outlined mt-0.5 text-lg"
              style={{ color: plan.color }}
              aria-hidden
            >
              check_circle
            </span>
            {feature}
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="overflow-hidden rounded-2xl border border-primary-soft bg-card">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
      >
        <span className="text-sm font-bold text-foreground">{question}</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.25 }}
          className="material-symbols-outlined shrink-0 text-primary"
          aria-hidden
        >
          expand_more
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="px-5 pb-5 text-sm leading-relaxed text-foreground-muted">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function PricingPage() {
  const [cycle, setCycle] = useState<BillingCycle>("yearly");

  return (
    <div className="pb-24 pt-32 md:pt-40">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
        className="mx-auto max-w-2xl px-6 text-center"
      >
        <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-bold text-primary">
          <span className="material-symbols-outlined text-base" aria-hidden>
            sell
          </span>
          Bảng giá
        </span>
        <h1 className="mt-4 text-4xl font-black tracking-tight text-foreground md:text-6xl">
          Chọn gói phù hợp với <span className="text-primary">chiến dịch của bạn</span>
        </h1>
        <p className="mt-4 text-base leading-relaxed text-foreground-muted">
          Bắt đầu miễn phí, nâng cấp khi tăng trưởng. Creator tham gia nền tảng
          hoàn toàn miễn phí.
        </p>

        {/* Billing toggle */}
        <div className="mt-8 inline-flex items-center rounded-full border border-primary-soft bg-card p-1">
          {(
            [
              { id: "monthly", label: "Theo tháng" },
              { id: "yearly", label: "Theo năm" },
            ] as { id: BillingCycle; label: string }[]
          ).map((option) => {
            const isActive = cycle === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => setCycle(option.id)}
                aria-pressed={isActive}
                className="relative rounded-full px-5 py-2 text-sm font-bold"
              >
                {isActive && (
                  <motion.span
                    layoutId="billing-pill"
                    className="absolute inset-0 rounded-full bg-primary shadow-primary"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span
                  className={`relative flex items-center gap-1.5 transition-colors ${
                    isActive ? "text-background-dark" : "text-foreground-muted"
                  }`}
                >
                  {option.label}
                  {option.id === "yearly" && (
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-[10px] font-black ${
                        isActive ? "bg-background-dark/15" : "bg-success/15 text-success"
                      }`}
                    >
                      -20%
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Plan cards */}
      <div className="mx-auto mt-14 grid max-w-6xl grid-cols-1 gap-6 px-6 md:grid-cols-3">
        {PRICING_PLANS.map((plan, index) => (
          <PlanCard key={plan.id} plan={plan} cycle={cycle} index={index} />
        ))}
      </div>

      {/* Comparison table */}
      <div className="mx-auto mt-24 max-w-5xl px-6">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="text-center text-2xl font-black tracking-tight text-foreground md:text-4xl"
        >
          So sánh chi tiết các gói
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55, delay: 0.1 }}
          className="mt-10 overflow-x-auto rounded-3xl border border-primary-soft bg-card"
        >
          <table className="w-full min-w-[640px] border-collapse text-left">
            <thead>
              <tr className="border-b border-primary-soft">
                <th className="px-6 py-4 text-sm font-bold text-foreground-muted">Tính năng</th>
                {PRICING_PLANS.map((plan) => (
                  <th key={plan.id} className="px-6 py-4 text-center">
                    <span className="flex items-center justify-center gap-2 text-sm font-black text-foreground">
                      <span
                        className="material-symbols-outlined text-lg"
                        style={{ color: plan.color }}
                        aria-hidden
                      >
                        {plan.icon}
                      </span>
                      {plan.name}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARISON_GROUPS.map((group) => (
                <React.Fragment key={group.title}>
                  <tr className="border-b border-primary-soft bg-primary/5">
                    <td colSpan={4} className="px-6 py-3">
                      <span className="flex items-center gap-2 text-xs font-black uppercase tracking-wide text-primary">
                        <span className="material-symbols-outlined text-base" aria-hidden>
                          {group.icon}
                        </span>
                        {group.title}
                      </span>
                    </td>
                  </tr>
                  {group.rows.map((row) => (
                    <tr key={row.label} className="border-b border-primary-soft last:border-b-0">
                      <td className="px-6 py-4 text-sm text-foreground-muted">{row.label}</td>
                      {PRICING_PLANS.map((plan) => (
                        <td key={plan.id} className="px-6 py-4 text-center">
                          <CellValue value={row[plan.id]} color={plan.color} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </motion.div>
      </div>

      {/* FAQ */}
      <div className="mx-auto mt-24 max-w-3xl px-6">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="text-center text-2xl font-black tracking-tight text-foreground md:text-4xl"
        >
          Câu hỏi thường gặp
        </motion.h2>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-10 flex flex-col gap-3"
        >
          {PRICING_FAQS.map((faq) => (
            <FaqItem key={faq.question} question={faq.question} answer={faq.answer} />
          ))}
        </motion.div>
      </div>

      {/* Bottom CTA */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.55 }}
        className="mx-auto mt-24 max-w-4xl px-6"
      >
        <div className="relative overflow-hidden rounded-3xl border border-primary-soft bg-card p-10 text-center sm:p-14">
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(60% 80% at 50% 0%, color-mix(in srgb, var(--color-primary) 12%, transparent) 0%, transparent 70%)",
            }}
            aria-hidden
          />
          <h2 className="relative text-2xl font-black tracking-tight text-foreground md:text-4xl">
            Chưa chắc gói nào phù hợp?
          </h2>
          <p className="relative mx-auto mt-3 max-w-xl text-sm leading-relaxed text-foreground-muted">
            Dùng thử Growth 14 ngày miễn phí — hoặc để đội ngũ Hive-K tư vấn
            giải pháp theo ngân sách và ngành hàng của bạn.
          </p>
          <div className="relative mt-8 flex flex-wrap items-center justify-center gap-4">
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.95 }}>
              <Link
                href={AUTH_ROUTES.SIGN_IN}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-7 py-3.5 text-sm font-bold text-background-dark shadow-primary transition-colors hover:bg-primary/90"
              >
                Dùng thử miễn phí
                <span className="material-symbols-outlined text-base" aria-hidden>
                  rocket_launch
                </span>
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.95 }}>
              <Link
                href={AUTH_ROUTES.SIGN_IN}
                className="inline-flex items-center gap-2 rounded-xl border border-primary-soft px-7 py-3.5 text-sm font-bold text-foreground transition-colors hover:bg-primary-soft"
              >
                Liên hệ tư vấn
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
