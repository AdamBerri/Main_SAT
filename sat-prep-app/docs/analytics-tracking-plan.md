# Analytics Tracking Plan (PostHog)

This project uses PostHog for:
- product analytics (events + funnels),
- session-level behavior (time on page),
- A/B experiments (feature flags + variants).

## 1) North Star + Guardrails

Start with one North Star metric:
- `activation_rate_7d`: % of new users who complete at least one practice session within 7 days.

Guardrail metrics:
- Landing bounce proxy: users with only 1 page view and no CTA click.
- `time_to_signup`: time from first `page_viewed` on landing to auth completion.
- `practice_start_rate`: % of signed-in users who start practice in a session.
- Error rate (add later from backend failures / client exceptions).

## 2) Event Taxonomy (V1)

Current events wired in app:
- `page_viewed`
  - props: `path`, `full_path`
- `page_left`
  - props: `path`, `full_path`, `reason`, `duration_seconds`
- `cta_clicked`
  - props: `page`, `cta_id`, `destination`, `auth_state`
- `experiment_exposed`
  - props: `experiment`, `variant`
- `practice_started`
  - props: `attempt_id`, `mode`, `section`, `question_count`, `started_from`
- `question_answered`
  - props: `attempt_id`, `mode`, `question_id`, `question_index`, `selected_answer`, `changed_answer`
- `practice_submitted`
  - props: `attempt_id`, `completion_method`, `answered_count`, `total_questions`, `elapsed_seconds`
- `practice_scored`
  - props: `attempt_id`, `correct_count`, `incorrect_count`, `accuracy_percent`
- `practice_abandoned`
  - props: `attempt_id`, `mode`, `section`, `reason`, `answered_count`
- `subscription_checkout_started`
  - props: `plan`, `billing_interval`, `price_usd`
- `subscription_checkout_completed`
  - props: `session_id`, `status`
- `subscription_portal_opened`
  - props: `user_id`, `subscription_plan`, `subscription_status`
- `checkout_started`
  - props: `checkout_type`, `purchase_type`, `amount_cents`
- `checkout_completed`
  - props: `checkout_type`, `session_id`, `status`, `amount_cents`
- `paywall_viewed`
  - props: `path`, `paywall_variant`

Naming rules:
- Use `snake_case` for event names and properties.
- Keep event names stable; add new properties instead of renaming events.
- Avoid free-text properties for anything you plan to chart/filter.

## 3) Key PostHog Charts To Create First

1. Landing funnel:
- `page_viewed` (`path=/`) -> `cta_clicked` (`cta_id=hero_primary`) -> signup complete event.

2. Landing engagement:
- Median `duration_seconds` from `page_left` where `path=/`.

3. CTA performance:
- Count of `cta_clicked` split by `cta_id`.

4. Activation funnel:
- signup complete event -> first practice started -> first practice submitted.

5. Practice quality:
- `practice_started` -> `practice_submitted` -> `practice_scored`
- Breakdown by `mode`, `section`, and `completion_method`.

## 4) A/B Testing Setup (First Experiment)

Create feature flag:
- key: `landing_hero_cta_copy`
- variants:
  - `control` (default UI copy),
  - `start_now`,
  - `join_club`

Target metric:
- Primary: `cta_clicked` with `cta_id=hero_primary`
- Secondary: signup conversion and 7-day activation
- Guardrail: `page_left.duration_seconds` on landing and bounce proxy

Decision rule:
- Run until sample size is sufficient and one variant is both statistically better on primary metric and neutral/non-harmful on guardrails.

## 5) Next Instrumentation To Add

High-priority product events:
- `practice_resumed`
- `portal_open_failed` (for Stripe portal errors)
- `checkout_failed` (include error code buckets)

When adding these, capture:
- `section`, `mode`, `attempt_id`, and `question_index` (where relevant).
