import Prototype from "./Prototype";

const requirements = [
  {
    id: "FR-01／FR-02",
    title: "建立並驗證活動申請",
    text: "社團幹部輸入活動名稱、日期、時間、場地與活動說明；系統檢查必填欄位與資料格式。",
    source: "INT-01",
    priority: "高優先",
  },
  {
    id: "FR-03／FR-04",
    title: "檢查場地與時段衝突",
    text: "系統比對同一場地、同一日期的時段；重疊時禁止送出，不同場地或不同時段則可繼續。",
    source: "INT-02",
    priority: "高優先",
  },
  {
    id: "FR-05／FR-06",
    title: "建立紀錄並更新狀態",
    text: "資料通過檢查後建立申請紀錄，並將狀態設為「待審核」。",
    source: "INT-01",
    priority: "高優先",
  },
  {
    id: "FR-07",
    title: "查詢申請狀態",
    text: "社團幹部可查看活動、場地、時間與目前申請狀態。",
    source: "INT-01",
    priority: "中優先",
  },
  {
    id: "FR-08",
    title: "查看與更新審核結果",
    text: "課外活動組查看待審核活動清單並更新審核狀態；完整核准、退回與補件規則仍待確認。",
    source: "INT-01／INT-02，待確認",
    priority: "中優先",
  },
  {
    id: "FR-09",
    title: "查看場地使用資訊",
    text: "場地管理員查看已確認的場地、日期與使用時間；通知時機與方式仍待確認。",
    source: "OBS-01，待確認",
    priority: "待確認",
  },
  {
    id: "FR-10",
    title: "查看活動資訊",
    text: "一般學生查看活動名稱、時間、地點與狀態；直接訪談來源不足。",
    source: "7/13 任務書角色表",
    priority: "低優先",
  },
];

const traceRows = [
  ["FR-01", "UC-01", "T-01、T-02", "活動申請表", "AC-01-01"],
  ["FR-02", "UC-01", "T-03", "表單驗證", "AC-02-01"],
  ["FR-03", "UC-02", "T-04", "衝突提示", "AC-03-01"],
  ["FR-04", "UC-02", "T-04", "錯誤提示", "AC-03-02"],
  ["FR-05", "UC-03", "T-05", "成功畫面", "AC-05-01"],
  ["FR-06", "UC-03", "T-06", "狀態畫面", "AC-05-02"],
  ["FR-07", "UC-04", "T-07", "查詢畫面", "AC-07-01"],
  ["FR-08", "UC-05", "T-08", "管理畫面", "待確認"],
  ["FR-09", "待確認", "待確認", "場地使用資訊", "待確認"],
  ["FR-10", "待確認", "待確認", "活動資訊", "待確認"],
];

const navItems = [
  ["問題與範圍", "overview"],
  ["需求成果", "requirements"],
  ["分析模型", "models"],
  ["操作驗證", "prototype"],
  ["完整追溯", "traceability"],
  ["限制與下一步", "next"],
];

export default function Home() {
  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="回到頁首">
          <span className="brand-mark">05</span>
          <span>
            <strong>校園社團活動</strong>
            <small>場地智慧管理平台</small>
          </span>
        </a>
        <nav aria-label="頁面導覽">
          {navItems.map(([label, id]) => (
            <a key={id} href={`#${id}`}>
              {label}
            </a>
          ))}
        </nav>
        <a className="header-cta" href="#prototype">
          開始操作驗證
        </a>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <div className="eyebrow">
            <span>系統分析與設計</span>
            <span>Group05</span>
            <span>115 / 07 / 20</span>
          </div>
          <h1>
            讓活動申請
            <br />
            <em>不再卡在人工比對。</em>
          </h1>
          <p className="hero-lead">
            以社團幹部的活動與場地申請為核心，將資料檢查、場地衝突判斷、申請建檔與狀態查詢整合成一致流程。
          </p>
          <div className="hero-actions">
            <a className="button button-primary" href="#prototype">
              實際操作核心流程
            </a>
            <a className="button button-secondary" href="#overview">
              查看分析依據
            </a>
          </div>
          <p className="honesty-note">
            本頁是依 0720 文件建立的瀏覽器內可操作原型；資料不會寫入正式資料庫。FR-08～FR-10
            僅依現有分析內容示範，未確認的審核、通知與驗收規則不視為正式完成。
          </p>
        </div>
        <div className="hero-system" aria-label="核心流程摘要">
          <div className="system-topline">
            <span>CORE FLOW / UC-01—04</span>
            <span className="live-dot">可操作</span>
          </div>
          <div className="flow-stack">
            {[
              ["01", "填寫活動資料", "FR-01／02"],
              ["02", "檢查場地衝突", "FR-03／04"],
              ["03", "建立申請紀錄", "FR-05"],
              ["04", "顯示待審核狀態", "FR-06／07"],
            ].map(([number, title, req], index) => (
              <div className="flow-row" key={number}>
                <span className="flow-number">{number}</span>
                <span className="flow-title">{title}</span>
                <span className="flow-req">{req}</span>
                {index < 3 && <span className="flow-line" aria-hidden="true" />}
              </div>
            ))}
          </div>
          <div className="system-footer">
            <span>輸入</span>
            <strong>活動、日期、時間、場地</strong>
            <span>輸出</span>
            <strong>待審核申請</strong>
          </div>
        </div>
      </section>

      <section className="section section-light" id="overview">
        <div className="section-heading">
          <span className="section-index">01</span>
          <div>
            <p className="kicker">專案與問題</p>
            <h2>從三個人工痛點，界定本期系統範圍。</h2>
          </div>
        </div>

        <div className="problem-grid">
          <article className="problem-main">
            <p className="quote">
              現況依賴人工確認場地、人工審核與不固定通知，容易造成重複借用、處理延遲與訊息遺漏。
            </p>
            <div className="pain-list">
              <div>
                <b>P-01</b>
                <span>場地需人工確認是否衝突</span>
                <strong>高</strong>
              </div>
              <div>
                <b>P-02</b>
                <span>審核流程完全人工</span>
                <strong>高</strong>
              </div>
              <div>
                <b>P-03</b>
                <span>通知方式不固定</span>
                <strong className="medium">中</strong>
              </div>
            </div>
          </article>

          <article className="scope-card scope-in">
            <span className="card-label">本期範圍內</span>
            <h3>FR-01～FR-07</h3>
            <ul>
              <li>建立活動與場地申請</li>
              <li>必填欄位與格式檢查</li>
              <li>場地時段衝突判斷</li>
              <li>建立待審核紀錄</li>
              <li>查詢申請狀態</li>
            </ul>
          </article>

          <article className="scope-card scope-out">
            <span className="card-label">0720 原列待確認 · 本頁標準流程原型</span>
            <h3>FR-08～FR-10</h3>
            <ul>
              <li>課外活動組核准、補件或填寫原因退回</li>
              <li>場地管理員查看已確認場地</li>
              <li>一般學生搜尋與篩選已核准活動</li>
              <li>站內通知；正式外部通知仍待串接</li>
            </ul>
          </article>
        </div>

        <div className="actor-strip">
          <span>主要角色</span>
          <strong>社團幹部</strong>
          <span>分析角色</span>
          <strong>課外活動組老師</strong>
          <strong>場地管理員</strong>
          <strong>一般學生</strong>
        </div>
      </section>

      <section className="section section-navy" id="requirements">
        <div className="section-heading">
          <span className="section-index">02</span>
          <div>
            <p className="kicker">需求成果</p>
            <h2>高優先需求直接回應訪談中的核心流程。</h2>
          </div>
        </div>

        <div className="requirements-grid">
          {requirements.map((item) => (
            <article className="requirement-card" key={item.id}>
              <div className="requirement-meta">
                <span>{item.id}</span>
                <span>{item.priority}</span>
              </div>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
              <div className="source-chip">需求來源 · {item.source}</div>
            </article>
          ))}
        </div>

        <div className="evidence-row">
          <div>
            <span>INT-01</span>
            <p>活動申請、處理進度與待審核狀態。</p>
          </div>
          <div>
            <span>INT-02</span>
            <p>場地人工比對與重複借用風險。</p>
          </div>
          <div>
            <span>OBS-01</span>
            <p>通知方式與場地資訊更新問題。</p>
          </div>
          <div>
            <span>排序依據</span>
            <p>先完成社團幹部可直接操作的申請核心流程。</p>
          </div>
        </div>
      </section>

      <section className="section section-ivory" id="models">
        <div className="section-heading">
          <span className="section-index">03</span>
          <div>
            <p className="kicker">分析模型</p>
            <h2>角色、流程與資料狀態，對齊同一組需求。</h2>
          </div>
        </div>

        <div className="model-feature">
          <div className="model-copy">
            <span className="card-label">Use Case Diagram</span>
            <h3>誰使用系統，為了完成什麼目標？</h3>
            <p>
              使用案例圖以社團幹部為核心，串連建立活動申請、檢查場地衝突、送出申請與查詢狀態；課外活動組則對應待審核活動。
            </p>
            <div className="model-checks">
              <span>✓ 系統邊界</span>
              <span>✓ 參與者目標</span>
              <span>✓ FR-01～FR-08 對應</span>
            </div>
          </div>
          <figure className="model-image">
            <img
              src="/models/use-case-diagram.png"
              alt="校園社團活動與場地智慧管理平台使用案例圖"
            />
            <figcaption>0720 / use_case_diagram.png</figcaption>
          </figure>
        </div>

        <div className="process-compare">
          <article>
            <div className="process-heading">
              <span>AS-IS</span>
              <h3>現況：人工確認鏈</h3>
            </div>
            <figure>
              <img src="/models/as-is-process.png" alt="現況流程圖" />
            </figure>
            <p>申請送出後，課外活動組人工比對場地並通知結果，資訊可能延遲或遺漏。</p>
          </article>
          <div className="process-arrow" aria-hidden="true">
            →
          </div>
          <article>
            <div className="process-heading">
              <span>TO-BE</span>
              <h3>目標：系統先行檢查</h3>
            </div>
            <figure>
              <img src="/models/to-be-process.png" alt="目標流程圖" />
            </figure>
            <p>系統先驗證資料與場地時段，通過後建立紀錄並顯示待審核狀態。</p>
          </article>
        </div>

        <article className="use-case">
          <div className="use-case-title">
            <span>UC-01</span>
            <div>
              <p>完整使用案例描述</p>
              <h3>建立活動申請</h3>
            </div>
          </div>
          <div className="use-case-grid">
            <div>
              <b>前置條件</b>
              <p>使用者已登入，且具有活動申請權限。</p>
            </div>
            <div>
              <b>成功結果</b>
              <p>系統建立新申請，狀態為「待審核」。</p>
            </div>
            <div>
              <b>最低保證</b>
              <p>建立失敗時，不新增任何活動資料。</p>
            </div>
            <div>
              <b>業務規則</b>
              <p>同一場地於相同時間不可重複借用。</p>
            </div>
          </div>
          <ol className="use-case-flow">
            <li>開啟申請頁面</li>
            <li>輸入活動資料</li>
            <li>檢查必填欄位</li>
            <li>檢查場地衝突</li>
            <li>建立申請</li>
            <li>更新為待審核</li>
          </ol>
        </article>
      </section>

      <Prototype />

      <section className="section section-light" id="traceability">
        <div className="section-heading">
          <span className="section-index">05</span>
          <div>
            <p className="kicker">需求、模型與實作追溯</p>
            <h2>從需求來源一路追到畫面與驗收。</h2>
          </div>
        </div>

        <div className="trace-chain" aria-label="完整追溯關係">
          {[
            ["需求來源", "INT-01／INT-02"],
            ["功能需求", "FR-01～FR-07"],
            ["使用案例", "UC-01～UC-04"],
            ["目標流程", "T-01～T-07"],
            ["畫面行為", "表單／衝突／狀態"],
            ["驗收", "AC／MAT"],
          ].map(([label, value], index) => (
            <div className="trace-node" key={label}>
              <span>{label}</span>
              <strong>{value}</strong>
              {index < 5 && <b aria-hidden="true">→</b>}
            </div>
          ))}
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>需求</th>
                <th>使用案例</th>
                <th>目標流程</th>
                <th>畫面或操作</th>
                <th>驗收條件</th>
              </tr>
            </thead>
            <tbody>
              {traceRows.map((row) => (
                <tr key={row[0]}>
                  {row.map((cell, index) => (
                    <td key={cell} data-label={["需求", "使用案例", "目標流程", "畫面或操作", "驗收條件"][index]}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="consistency-warning">
          <span>文件一致性提醒</span>
          <p>
            0720 的 <code>updated_code_agent_brief.md</code> 將 MAT-01～MAT-06
            記為通過，但 <code>actor_goal_matrix.md</code> 與
            <code>use_case_inventory.md</code> 仍記載「實際結果尚未測試／待實際測試」。
            因此期中影片應現場重做操作並保留證據，不直接把草稿狀態宣稱為最終通過。
          </p>
        </div>
      </section>

      <section className="section section-coral" id="next">
        <div className="section-heading">
          <span className="section-index">06</span>
          <div>
            <p className="kicker">目前限制與下一步</p>
            <h2>誠實標示未完成，讓期末工作有明確順序。</h2>
          </div>
        </div>

        <div className="next-grid">
          <article>
            <span>01</span>
            <h3>正式資料與場地規則</h3>
            <p>目前以 Mock Data 驗證衝突邏輯，正式資料庫尚未建立；場地緩衝時間仍待確認。</p>
          </article>
          <article>
            <span>02</span>
            <h3>完整行政審核</h3>
            <p>FR-08 已有核准、補件、退回原因與重新送出原型；正式簽核層級與指導老師簽核仍待確認。</p>
          </article>
          <article>
            <span>03</span>
            <h3>通知與場地管理</h3>
            <p>尚未串接 Email 或 LINE；場地管理員的通知時機與方式也尚未確認。</p>
          </article>
          <article>
            <span>04</span>
            <h3>需求與測試證據</h3>
            <p>FR-08～FR-10 仍有來源或驗收不足；MAT-01～MAT-06 應在影片中重新操作確認。</p>
          </article>
        </div>

        <div className="backlog">
          <div>
            <span>IMP-01</span>
            <p>活動申請表單</p>
            <strong>手動測試</strong>
          </div>
          <div>
            <span>IMP-02</span>
            <p>場地衝突判斷</p>
            <strong>手動測試</strong>
          </div>
          <div>
            <span>IMP-03</span>
            <p>建立待審核紀錄</p>
            <strong>手動測試</strong>
          </div>
          <div>
            <span>IMP-04</span>
            <p>查看申請狀態</p>
            <strong>手動測試</strong>
          </div>
        </div>
      </section>

      <section className="section video-section">
        <div className="section-heading">
          <span className="section-index">✓</span>
          <div>
            <p className="kicker">10 分鐘成果驗證影片</p>
            <h2>錄影前，依老師要求完成最後檢查。</h2>
          </div>
        </div>
        <div className="video-grid">
          <div className="video-checks">
            {[
              "說明問題、角色與本期範圍",
              "呈現至少 3 項高優先需求與來源",
              "解說使用案例與 AS-IS／TO-BE 模型",
              "實際操作正常與替代／例外情境",
              "展示資料與狀態變化",
              "說明需求到驗收的完整追溯",
              "誠實說明限制與下一步",
              "每位組員都有參與",
              "影片不超過 10 分鐘，連結可直接觀看",
            ].map((item) => (
              <label key={item}>
                <input type="checkbox" />
                <span>{item}</span>
              </label>
            ))}
          </div>
          <div className="team-card">
            <span className="card-label">GROUP 05</span>
            <h3>柯佳妘 × 王寶春</h3>
            <p>0720 文件記載：組員與分工「一人做一半」。影片中兩位組員都應參與說明。</p>
            <div className="team-rule">
              <strong>老師要求</strong>
              <span>每位組員需能說明自己負責的需求、模型、實作、測試或整合工作。</span>
            </div>
            <a
              href="https://github.com/412638123/TKU_114-3_SAD_Group05/tree/main/0714_User_Stories_Acceptance_Implementation"
              target="_blank"
              rel="noreferrer"
            >
              開啟文件記載的 GitHub 位置 ↗
            </a>
          </div>
        </div>
      </section>

      <footer>
        <div>
          <span className="brand-mark">05</span>
          <p>
            <strong>校園社團活動與場地智慧管理平台</strong>
            <small>系統分析與設計 · 期中專案成果驗證</small>
          </p>
        </div>
        <p>內容依 0720 分析文件與期中專案報告說明整理。</p>
      </footer>
    </main>
  );
}
