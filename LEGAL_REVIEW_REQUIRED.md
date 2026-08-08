# LEGAL_REVIEW_REQUIRED

站内所有涉及加州租赁法律的内容登记表。

**规则**：本表里 `status: pending` 的条目，在复核通过前**不得**改写成确定语气，也不得新增同主题页面。
David Dai 是 Realtor，不是律师 —— 全站措辞一律用「California law generally provides…」「是否适用取决于…」，不用「你可以合法地…」「法律规定必须…」。

最后更新：2026-08-07（P0A-7）

---

## 一、P0A-7 已修正的内容（仍需复核确认）

### 1. 押金上限的法条张冠李戴 ⚠️ 已修正

| | |
|---|---|
| 位置 | `property-management.html`（正文 6 处 + FAQPage JSON-LD 1 处） |
| 原文 | 「What is the California security deposit limit under **SB 567**?」「Under SB 567, which took effect **April 1, 2024**…one month's rent」 |
| 问题 | **法条搞错了。** 一个月押金上限来自 **AB 12**（修订 Civil Code §1950.5，一般自 **2024-07-01** 起）。**SB 567**（2024-04-01 生效）修的是 AB 1482 的 just cause / 涨幅规则，**与押金无关**。原文还把 SB 567 的生效日期安到了押金规则上。 |
| 影响 | 该问答同时写在 FAQPage schema 里，Google 可能直接当答案展示 —— 等于对外发布一条错误的法律信息。 |
| 现状 | 已改为 AB 12 + Civil Code §1950.5，生效日期改为 2024-07-01，并说明 SB 567 是另一部法；已加 leginfo 与 California Courts 链接。 |
| status | **pending** — 请律师或 David 确认表述，尤其是 small-landlord 例外的适用条件 |

### 2. 「月收入 3 倍」被写成硬性标准 ⚠️ 已修正

| | |
|---|---|
| 位置 | `index.html`、`landlords.html`、`tenants.html`、`cities/los-angeles.html`、`cities/pasadena.html`、`cities/san-gabriel.html` |
| 原文 | 「收入证明（通常需要月收入 3 倍于月租）」「一般要求月收入为租金的 2.5–3 倍」 |
| 问题 | 加州**没有**这条法定标准。而且把收入倍数当硬门槛，可能与 FEHA、收入来源歧视（source-of-income）规则冲突（例如 Section 8 补助）。 |
| 现状 | 全部改为「这是市场惯例、不是加州法定标准，应作为你事先写好并对所有申请人一致适用的标准」。 |
| status | **pending** — 建议同时补一页「怎么写 written screening criteria」 |

### 3. Fair Housing：按族裔匹配租客 ⚠️ 已修正

| | |
|---|---|
| 位置 | `cities/los-angeles.html`、`cities/pasadena.html`、`cities/san-gabriel.html`（FAQ「华人房东为什么需要专门的华人经纪人？」） |
| 原文 | 「②了解华人文化习惯和租客需求，**匹配更精准**；④可通过微信等华人渠道推广，**触达更广泛华人租客群体**」 |
| 问题 | 对外宣传按 national origin 匹配 / 定向招租，属于 Fair Housing Act 与 FEHA 明确禁止的表述。**用中文服务华人房东没问题；宣传"帮你找华人租客"有问题。** |
| 现状 | 已重写为：中文沟通、本地市场判断、微信作为推广渠道之一；并明确写明房源对所有符合条件的申请人开放、按统一标准审核。 |
| status | **pending** — 建议整站做一次 Fair Housing 文案复核 |

### 4. Fair Housing：对特定族裔申请人「针对性评估」 ⚠️ 已修正

| | |
|---|---|
| 位置 | `landlords.html` FAQ「租客审查有哪些内容？」 |
| 原文 | 「David 还会对**华人租客**的特殊情况（如海外收入、信用记录较短）进行**针对性评估**」 |
| 问题 | 按族裔对申请人区别对待的表述。 |
| 现状 | 改为按**材料类型**（海外收入、在美信用记录短）在书面标准里预先写明可接受的替代材料，并对所有申请人一致适用。 |
| status | **pending** |

### 5. AB 1482 被写成确定结论 ⚠️ 已修正

| | |
|---|---|
| 位置 | `landlords.html` FAQ（同时进了 FAQPage schema） |
| 原文 | 「适用于大多数建成超过 15 年的多户型房产…独立屋（SFR）通常有豁免…David 会帮您判断您的房产是否受此法案约束」 |
| 问题 | 把具体阈值写成确定结论且无出处；「David 会帮您判断」接近法律意见。 |
| 现状 | 改为 hedged 表述 + 明确列出影响适用性的变量（房产类型 / 房龄 / 产权结构 / 通知历史 / 本地条例）+ 加 Civil Code §1947.12、§1946.2、HCD 链接 + 「以现行法条或律师意见为准」。 |
| status | **pending** |

---

## 二、尚未处理，需要决定

### 6a. 押金规则 — status: **已补写（2026-08-07），待复核**

`landlords.html#security-deposit` 新增完整一节，依据 Civil Code §1950.5 条文原文（已查证 leginfo）：

| 内容 | 依据 |
|---|---|
| 押金上限一般为 **1 个月租金**，带不带家具都一样（原为不带家具 2 个月 / 带家具 3 个月） | AB 12，2024-07-01 起 |
| 小房东例外：自然人（或成员全为自然人的 LLC），住宅出租房产 ≤2 处且合计 ≤4 个单元 → 最多 2 个月。家族信托符合条件时视为自然人 | §1950.5(c) |
| 租客是 **service member** 时小房东例外不适用，一律 1 个月 | §1950.5(c) |
| 因信用/租房历史多收押金 → 须给**书面说明**（金额+理由）；住满 6 个月且无欠租须退还多收部分 | §1950.5(c)(4) |
| 退租后 **21 个日历日**内出逐项明细 + 退余款；维修与清洁合计超 **$125** 须附账单/发票/收据 | §1950.5(h)(1)–(4) |
| **拍照义务**：2025-07-01 起的租约须在入住前/入住时拍照；2025-04-01 起收回房屋后及维修清洁后也须拍照 | §1950.5(g) |
| 押金若以电子方式收取，须按租客书面指定账户**电子退还** | AB 414，2026-01-01 起 |

⚠️ **重要发现**：`§1950.5` 在 AB 12 之后**又被修订过** —— 当前条文标注为
`Amended by Stats. 2025, Ch. 340, Sec. 1. (AB 414) Effective January 1, 2026`。
也就是说「AB 12 = 押金法」这个说法已经不完整，写押金内容时必须查当前条文，不能只引 AB 12。

**待复核**：上述表述请律师过一遍，尤其是小房东例外的适用条件与 service member 定义。

### 6b. 全站仍缺失的重要法规 — status: **not started**

- **LA RSO**（Los Angeles Rent Stabilization Ordinance）
- **Pasadena Measure H**（2022 通过的本地租管条例）
- **Civil Code §1954**（进屋 24 小时书面通知）
- （已在 6a 处理）
- **Civil Code §1950.6**（申请审核费 screening fee 的收取、上限与退还规则；以及书面筛选标准）

LA 和 Pasadena 是主推城市，却没提本地租管条例 —— 这是目前最大的内容缺口。
**但按 P0A 规范，这些不在本轮自行补写**，需要 David / 律师确认后再建页面。

### 7. 驱逐程序表述 — status: **pending**

- `property-management.html` 描述了 unlawful detainer 流程与「3–6 周」时间预期。
- unlawful detainer 属律师业务；页面应明确「需律师处理」，且不宜给具体时间承诺。
- 现有「协助处理加州驱逐程序」的表述需要确认服务边界。

### 8. 宠物押金表述 — status: **pending**

- `tenants.html` 曾写「宠物押金通常为一个月租金」。需与 AB 12 的总押金上限一并核对（宠物押金通常计入总押金）。
- 另需注意 service animal / assistance animal 不属于宠物，不得收取宠物押金 —— 这是 Fair Housing 高频争议点，站内目前完全没提。

---

## 三、复核流程

1. 每条改为 `status: reviewed`（附复核人、日期、依据链接）后，才能把措辞收紧。
2. 法律相关页面统一挂 `Educational information · Not legal advice`。
3. 只引用官方来源：
   - `leginfo.legislature.ca.gov`（法条原文）
   - `selfhelp.courts.ca.gov`（California Courts 自助指南）
   - `hcd.ca.gov`（California HCD）
   - `dre.ca.gov`（DRE）
4. **不要**在 build 时自动更新法律页面的「最后更新」日期 —— 只有真正复核过才改。
