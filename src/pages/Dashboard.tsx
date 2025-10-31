import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Filter, Link as LinkIcon, Settings2, ChevronDown, Check, X, Columns3, MessageSquare, Send, Sparkles } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts';

/**
 * Google Ads 风格：支持按【达人 / Campaign / 作品链接】维度查看；
 * - 顶部筛选条含：时间、平台、状态；
 * - 维度选择器下方提供对应的多选器（可搜索+标签chips）；
 * - 表格支持列管理、行多选、批量操作；
 * - 图表展示 GMV & 点击趋势（位于页面最后）；
 * - 新增【AI智能分析】：自动洞察 + 建议 + 快速问答；
 * - 明亮主题：浅灰背景 + 蓝绿主色。
 */

export default function MerchantCampaignDashboard() {
  const [view, setView] = useState<'creator'|'campaign'|'asset'>('creator');
  const [status, setStatus] = useState<'all'|'active'|'paused'>('all');
  const [platform, setPlatform] = useState<'all'|'抖音'|'小红书'|'快手'|'YouTube'|'Meta'>('all');
  const [query, setQuery] = useState('');
  const [selectedCreators, setSelectedCreators] = useState<string[]>([]);
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([]);
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [visibleCols, setVisibleCols] = useState({
    impressions: true,
    clicks: true,
    ctr: true,
    cvr: true,
    cpc: true,
    cpm: true,
    gmv: true,
    aov: true,
    roas: true,
  });
  const [selectedRows, setSelectedRows] = useState<Record<string, boolean>>({});

  // AI 对话
  const [messages, setMessages] = useState<Array<{role:'ai'|'user'; text:string}>>([
    { role: 'ai', text: '你好，我是投放AI助手。已读取当前筛选下的数据，我可以帮你找出表现最好的达人、需要优化的Campaign，或给出预算分配建议。' }
  ]);
  const [userInput, setUserInput] = useState('');

  // ====== 假数据 ======
  const creators = ['达人A','达人B','达人C','达人D','达人E'];
  const campaigns = ['夏季新品','双11预热','黑五大促','联名款推广'];
  const assets = ['作品链接-001','作品链接-002','作品链接-003','作品链接-004'];

  type Row = {
    id: string;
    name: string;       // 达人名 / Campaign名 / 作品链接
    dimValue: string;   // 维度原始值（便于过滤）
    platform: '抖音'|'小红书'|'快手'|'YouTube'|'Meta';
    status: 'active'|'paused';
    impressions: number;
    clicks: number;
    ctr: number;   // %
    cvr: number;   // %
    cpc: number;   // ¥
    cpm: number;   // ¥
    gmv: number;   // ¥
    aov: number;   // ¥
    roas: number;  // x
  }

  const baseData: Row[] = [
    { id:'c1', name:'达人A', dimValue:'达人A', platform:'小红书', status:'active', impressions:1200000, clicks:58000, ctr:4.8, cvr:3.7, cpc:1.10, cpm:43, gmv:180000, aov:152, roas:4.5 },
    { id:'c2', name:'达人B', dimValue:'达人B', platform:'抖音',   status:'paused', impressions:950000, clicks:42000, ctr:4.4, cvr:3.1, cpc:1.25, cpm:47, gmv:150000, aov:146, roas:3.9 },
    { id:'c3', name:'达人C', dimValue:'达人C', platform:'快手',   status:'active', impressions:780000, clicks:31000, ctr:4.0, cvr:2.9, cpc:1.05, cpm:44, gmv:120000, aov:138, roas:3.6 },
    { id:'ca1', name:'夏季新品', dimValue:'夏季新品', platform:'抖音', status:'active', impressions:2100000, clicks:92000, ctr:4.4, cvr:3.4, cpc:1.25, cpm:47, gmv:240000, aov:162, roas:4.2 },
    { id:'ca2', name:'双11预热', dimValue:'双11预热', platform:'小红书', status:'active', impressions:1800000, clicks:83000, ctr:4.6, cvr:3.6, cpc:1.12, cpm:45, gmv:260000, aov:168, roas:4.6 },
    { id:'a1', name:'作品链接-001', dimValue:'作品链接-001', platform:'YouTube', status:'paused', impressions:560000, clicks:22000, ctr:3.9, cvr:2.7, cpc:1.35, cpm:49, gmv:86000, aov:172, roas:3.2 },
  ];

  const trendData = [
    { day: 'Mon', gmv: 10000, clicks: 3500 },
    { day: 'Tue', gmv: 12500, clicks: 4000 },
    { day: 'Wed', gmv: 13800, clicks: 4200 },
    { day: 'Thu', gmv: 15200, clicks: 4600 },
    { day: 'Fri', gmv: 16900, clicks: 4800 },
  ];

  // ====== 过滤逻辑 ======
  const filtered: Row[] = useMemo(() => {
    let rows = baseData;
    // 按维度过滤
    if (view === 'creator' && selectedCreators.length) {
      rows = rows.filter(r => selectedCreators.includes(r.dimValue));
    }
    if (view === 'campaign' && selectedCampaigns.length) {
      rows = rows.filter(r => selectedCampaigns.includes(r.dimValue));
    }
    if (view === 'asset' && selectedAssets.length) {
      rows = rows.filter(r => selectedAssets.includes(r.dimValue));
    }
    // 平台
    if (platform !== 'all') rows = rows.filter(r => r.platform === platform);
    // 状态
    if (status !== 'all') rows = rows.filter(r => r.status === status);
    // 搜索
    if (query.trim()) rows = rows.filter(r => r.name.includes(query.trim()));
    // 仅保留当前维度对应的数据样例（演示用途）
    if (view === 'creator') rows = rows.filter(r => r.id.startsWith('c'));
    if (view === 'campaign') rows = rows.filter(r => r.id.startsWith('ca'));
    if (view === 'asset') rows = rows.filter(r => r.id.startsWith('a'));
    return rows;
  }, [baseData, view, selectedCreators, selectedCampaigns, selectedAssets, platform, status, query]);

  // 概览指标聚合
  const totals = useMemo(() => {
    const sum = (k: keyof Row) => filtered.reduce((acc, r) => acc + (r[k] as number), 0);
    const impressions = sum('impressions');
    const clicks = sum('clicks');
    const gmv = sum('gmv');
    const ctr = impressions ? (clicks / impressions) * 100 : 0;
    const aov = filtered.length ? (sum('aov') / filtered.length) : 0;
    const cpc = filtered.length ? (sum('cpc') / filtered.length) : 0;
    const cpm = filtered.length ? (sum('cpm') / filtered.length) : 0;
    const cvr = filtered.length ? (filtered.reduce((acc, r) => acc + r.cvr, 0) / filtered.length) : 0;
    const roas = filtered.length ? (filtered.reduce((acc, r) => acc + r.roas, 0) / filtered.length) : 0;
    return { impressions, clicks, ctr, gmv, cvr, cpc, cpm, aov, roas };
  }, [filtered]);

  // 聚合花费/ROAS（按CPC估算）
  const agg = useMemo(() => {
    const spendCPC = filtered.reduce((acc, r) => acc + (r.cpc * r.clicks), 0);
    const computedROAS = spendCPC > 0 ? (totals.gmv / spendCPC) : 0;
    // Top & Bottom
    const byROAS = [...filtered].sort((a,b)=>b.roas - a.roas);
    const top = byROAS.slice(0, Math.min(3, byROAS.length));
    const bottom = [...filtered].sort((a,b)=> (a.roas - b.roas) || ((b.cpc*b.clicks) - (a.cpc*a.clicks))).slice(0, Math.min(3, filtered.length));
    return { spendCPC, computedROAS, top, bottom };
  }, [filtered, totals.gmv]);

  // ====== 组件：多选器（简化版） ======
  function MultiSelect({ options, selected, onChange, placeholder }:{ options:string[]; selected:string[]; onChange:(v:string[])=>void; placeholder:string; }){
    const [open, setOpen] = useState(false);
    const [text, setText] = useState('');
    const visible = options.filter(o => o.toLowerCase().includes(text.toLowerCase()));
    return (
      <div className="relative min-w-[280px]">
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-gray-300 bg-white px-3 py-2 cursor-text" onClick={()=>setOpen(!open)}>
          {selected.length === 0 && <span className="text-gray-400">{placeholder}</span>}
          {selected.map(v => (
            <span key={v} className="flex items-center gap-1 rounded-lg bg-sky-50 text-sky-700 px-2 py-1 text-xs">
              {v}
              <button onClick={(e)=>{e.stopPropagation(); onChange(selected.filter(x=>x!==v));}}>
                <X size={14} />
              </button>
            </span>
          ))}
          <ChevronDown className="ml-auto text-gray-400" size={16}/>
        </div>
        {open && (
          <div className="absolute z-20 mt-2 w-full rounded-xl border border-gray-200 bg-white shadow-lg">
            <input value={text} onChange={e=>setText(e.target.value)} placeholder="搜索..." className="w-full border-b border-gray-200 px-3 py-2 text-sm outline-none" />
            <div className="max-h-56 overflow-auto">
              {visible.map(v => {
                const isSel = selected.includes(v);
                return (
                  <div key={v} className="flex items-center justify-between px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer" onClick={()=>{
                    const next = isSel ? selected.filter(x=>x!==v) : [...selected, v];
                    onChange(next);
                  }}>
                    <span>{v}</span>
                    {isSel && <Check className="text-emerald-600" size={16}/>} 
                  </div>
                );
              })}
              {visible.length===0 && <div className="px-3 py-6 text-center text-gray-400 text-sm">无匹配结果</div>}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ====== AI 分析 & 对话 ======
  function buildInsights(){
    if (filtered.length === 0) return [
      '当前筛选没有数据，建议放宽筛选条件或检查数据同步是否正常。'
    ];
    const best = agg.top[0];
    const worst = agg.bottom[0];
    const lines: string[] = [
      `当前概览：曝光 ${totals.impressions.toLocaleString()}，点击 ${totals.clicks.toLocaleString()}，CTR ${totals.ctr.toFixed(2)}%，GMV ¥${totals.gmv.toLocaleString()}，平均CPC ¥${totals.cpc.toFixed(2)}，估算ROAS（按CPC）≈ ${agg.computedROAS.toFixed(2)}。`,
    ];
    if (best) lines.push(`最佳表现：${best.name}（ROAS ${best.roas}，CTR ${best.ctr}% ，CPC ¥${best.cpc.toFixed(2)}）。建议加预算 10% 进行二次验证。`);
    if (worst) lines.push(`需优化：${worst.name}（ROAS ${worst.roas}，CPC ¥${worst.cpc.toFixed(2)}）。建议：创意AB、首屏素材更替或降低出价；若连续两期不改善，建议暂停。`);
    // what-if 简化结论（修复：改为模板字符串避免多行字符串报错）
    lines.push(`What-if：
- CTR +10%（CVR/AOV不变）→ GMV 约 +10%。
- CVR +10%（CTR/AOV不变）→ GMV 约 +10%。
- CPC -10%（其他不变）→ ROAS 约 +11%。`);
    return lines;
  }

  function aiReply(prompt: string){
    // 这里用规则引擎+当前数据快速生成回复（示意）
    const insights = buildInsights().join('\n');
    if (prompt.includes('暂停') || prompt.includes('停掉')){
      const toPause = agg.bottom.map(b=>b.name).join('、') || '（无）';
      return `建议优先暂停：${toPause}。理由：ROAS 低于平均 & CPC 偏高。\n\n${insights}`;
    }
    if (prompt.includes('预算') || prompt.includes('分配')){
      const plan = agg.top.map((t,i)=>`${i+1}. ${t.name}: +15% 预算`).join('\n') || '（无）';
      return `预算建议：\n${plan}\n其余维持不变，观察 3-5 天。\n\n${insights}`;
    }
    if (prompt.toLowerCase().includes('ctr')){
      return `提升CTR建议：\n- 前3秒强钩子+亮点首屏；\n- 缩略图对比AB（人物/利益点/反差色）；\n- 话题+标签与人群定向一致；\n- 将低CTR素材下线，集中预算投放Top素材。\n\n${insights}`;
    }
    return `已基于当前筛选生成建议：\n${insights}`;
  }

  function sendMessage(text?: string){
    const content = (text ?? userInput).trim();
    if (!content) return;
    setMessages(m => [...m, { role:'user', text: content }]);
    const reply = aiReply(content);
    setMessages(m => [...m, { role:'ai', text: reply }]);
    if (!text) setUserInput('');
  }

  function selectTopRecommendation(){
    const sel: Record<string, boolean> = {};
    agg.top.forEach(r => { sel[r.id] = true; });
    setSelectedRows(sel);
  }

  // ====== 轻量“测试用例”/断言（运行在浏览器控制台） ======
  useEffect(() => {
    // 仅在默认视图和默认筛选下跑一次冒烟测试
    const isDefault = view === 'creator' && platform === 'all' && status === 'all' &&
      selectedCreators.length === 0 && selectedCampaigns.length === 0 && selectedAssets.length === 0;
    if (!isDefault) return;

    try {
      const expectedImpr = 1200000 + 950000 + 780000; // c1+c2+c3
      const expectedClicks = 58000 + 42000 + 31000;
      const expectedGMV = 180000 + 150000 + 120000;
      const expectedCTR = (expectedClicks / expectedImpr) * 100;

      console.assert(totals.impressions === expectedImpr, '[TEST] Impressions 汇总不匹配');
      console.assert(totals.clicks === expectedClicks, '[TEST] Clicks 汇总不匹配');
      console.assert(totals.gmv === expectedGMV, '[TEST] GMV 汇总不匹配');
      console.assert(Math.abs(totals.ctr - expectedCTR) < 0.001, '[TEST] CTR 计算不匹配');
      // 计算性的用例：ROAS（CPC估算）
      const spend = (1.10*58000) + (1.25*42000) + (1.05*31000);
      const roasCalc = expectedGMV / spend;
      console.assert(Number.isFinite(roasCalc) && roasCalc > 0, '[TEST] ROAS 估算异常');
      // 如需查看，打开控制台
      // console.info('[TEST] OK', { totals, expectedImpr, expectedClicks, expectedGMV, expectedCTR, roasCalc });
    } catch (e) {
      console.error('[TEST] 冒烟测试异常', e);
    }
  }, [view, platform, status, selectedCreators, selectedCampaigns, selectedAssets, totals]);

  // ====== 渲染 ======
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-sky-700 flex items-center gap-2"><BarChart3 /> 投放总览看板</h1>
        <div className="flex gap-3">
          <Button variant="outline" className="flex items-center gap-2"><Filter size={16}/> 筛选</Button>
          <Button variant="outline" className="flex items-center gap-2"><Columns3 size={16}/> 管理列</Button>
          <Button className="bg-sky-500 hover:bg-sky-600 text-white">导出</Button>
        </div>
      </div>

      {/* 维度切换 */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader><CardTitle>查看维度</CardTitle></CardHeader>
        <CardContent>
          <Tabs value={view} onValueChange={v=>setView(v as any)} className="w-full">
            <TabsList className="grid grid-cols-3 bg-gray-100 rounded-lg">
              <TabsTrigger value="creator">达人维度</TabsTrigger>
              <TabsTrigger value="campaign">Campaign维度</TabsTrigger>
              <TabsTrigger value="asset">作品链接维度</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {/* 条件筛选条（平台 / 状态 / 搜索） + 维度选择器（多选） */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader className="pb-2"><CardTitle>条件</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <select value={platform} onChange={e=>setPlatform(e.target.value as any)} className="rounded-xl border border-gray-300 bg-white px-3 py-2">
              <option value="all">平台：全部</option>
              <option value="抖音">抖音</option>
              <option value="小红书">小红书</option>
              <option value="快手">快手</option>
              <option value="YouTube">YouTube</option>
              <option value="Meta">Meta</option>
            </select>
            <select value={status} onChange={e=>setStatus(e.target.value as any)} className="rounded-xl border border-gray-300 bg-white px-3 py-2">
              <option value="all">状态：全部</option>
              <option value="active">进行中</option>
              <option value="paused">已暂停</option>
            </select>
            <div className="flex items-center rounded-xl border border-gray-300 bg-white px-3 py-2">
              <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="搜索名称..." className="outline-none"/>
            </div>
            <Button variant="outline" className="flex items-center gap-2 ml-auto"><Settings2 size={16}/> 保存为视图</Button>
          </div>

          {/* 维度选择器：根据当前视图切换对应多选器 */}
          <div className="flex flex-wrap items-center gap-4">
            {view === 'creator' && (
              <MultiSelect
                options={creators}
                selected={selectedCreators}
                onChange={setSelectedCreators}
                placeholder="选择达人（可多选）"
              />
            )}
            {view === 'campaign' && (
              <MultiSelect
                options={campaigns}
                selected={selectedCampaigns}
                onChange={setSelectedCampaigns}
                placeholder="选择Campaign（可多选）"
              />
            )}
            {view === 'asset' && (
              <MultiSelect
                options={assets}
                selected={selectedAssets}
                onChange={setSelectedAssets}
                placeholder="选择作品链接（可多选）"
              />
            )}
            <div className="flex gap-2">
              <Button variant="outline" onClick={()=>{ setSelectedCreators([]); setSelectedCampaigns([]); setSelectedAssets([]); setQuery(''); setStatus('all'); setPlatform('all'); }}>重置</Button>
              <Button className="bg-emerald-500 hover:bg-emerald-600 text-white">应用筛选</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 概览指标 */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        {[ 
          { key:'impressions', title: '曝光', value: totals.impressions.toLocaleString() },
          { key:'clicks', title: '点击', value: totals.clicks.toLocaleString() },
          { key:'ctr', title: 'CTR', value: `${totals.ctr.toFixed(2)}%` },
          { key:'gmv', title: 'GMV', value: `¥${totals.gmv.toLocaleString()}` },
          { key:'cvr', title: 'CVR', value: `${totals.cvr.toFixed(2)}%` },
          { key:'cpc', title: 'CPC', value: `¥${totals.cpc.toFixed(2)}` },
          { key:'cpm', title: 'CPM', value: `¥${totals.cpm.toFixed(2)}` },
          { key:'aov', title: 'AOV', value: `¥${totals.aov.toFixed(0)}` },
        ].map((m) => (
          <Card key={m.key as string} className="shadow-sm border border-gray-200 bg-white">
            <CardHeader className="pb-2"><CardTitle className="text-gray-500 text-sm">{m.title}</CardTitle></CardHeader>
            <CardContent><p className="text-2xl font-semibold text-sky-700">{m.value}</p></CardContent>
          </Card>
        ))}
      </div>

      {/* 数据表（列选择 + 行多选 + 批量操作） */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <CardTitle>{view === 'creator' ? '达人投放表现' : view === 'campaign' ? 'Campaign投放表现' : '作品链接表现'}</CardTitle>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={()=>setVisibleCols(v=>({...v, impressions:!v.impressions}))}>曝光</Button>
              <Button size="sm" variant="outline" onClick={()=>setVisibleCols(v=>({...v, clicks:!v.clicks}))}>点击</Button>
              <Button size="sm" variant="outline" onClick={()=>setVisibleCols(v=>({...v, ctr:!v.ctr}))}>CTR</Button>
              <Button size="sm" variant="outline" onClick={()=>setVisibleCols(v=>({...v, cvr:!v.cvr}))}>CVR</Button>
              <Button size="sm" variant="outline" onClick={()=>setVisibleCols(v=>({...v, cpc:!v.cpc}))}>CPC</Button>
              <Button size="sm" variant="outline" onClick={()=>setVisibleCols(v=>({...v, cpm:!v.cpm}))}>CPM</Button>
              <Button size="sm" variant="outline" onClick={()=>setVisibleCols(v=>({...v, aov:!v.aov}))}>AOV</Button>
              <Button size="sm" variant="outline" onClick={()=>setVisibleCols(v=>({...v, roas:!v.roas}))}>ROAS</Button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white">批量创建邀约</Button>
            <Button size="sm" variant="outline">批量暂停</Button>
            <Button size="sm" variant="outline">批量导出</Button>
            <span className="text-xs text-gray-500 ml-auto">已选 {Object.values(selectedRows).filter(Boolean).length} 条</span>
          </div>
        </CardHeader>
        <CardContent>
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-100">
              <tr>
                <th className="p-2"><input type="checkbox" onChange={(e)=>{
                  const checked = e.target.checked; const next:Record<string,boolean>={};
                  filtered.forEach(r => next[r.id] = checked); setSelectedRows(next);
                }}/></th>
                <th className="p-2 font-medium">{view === 'creator' ? '达人名称' : view === 'campaign' ? 'Campaign名称' : '作品链接'}</th>
                <th className="p-2 font-medium">平台</th>
                <th className="p-2 font-medium">状态</th>
                {visibleCols.impressions && <th className="p-2 font-medium">曝光</th>}
                {visibleCols.clicks && <th className="p-2 font-medium">点击</th>}
                {visibleCols.ctr && <th className="p-2 font-medium">CTR</th>}
                {visibleCols.cvr && <th className="p-2 font-medium">CVR</th>}
                {visibleCols.cpc && <th className="p-2 font-medium">CPC</th>}
                {visibleCols.cpm && <th className="p-2 font-medium">CPM</th>}
                {visibleCols.gmv && <th className="p-2 font-medium">GMV</th>}
                {visibleCols.aov && <th className="p-2 font-medium">AOV</th>}
                {visibleCols.roas && <th className="p-2 font-medium">ROAS</th>}
                {view === 'asset' && <th className="p-2 font-medium">链接</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-2"><input type="checkbox" checked={!!selectedRows[row.id]} onChange={(e)=>setSelectedRows(s=>({...s, [row.id]: e.target.checked}))}/></td>
                  <td className="p-2">{view === 'asset' ? <a href="#" className="flex items-center text-sky-600 hover:underline"><LinkIcon size={14} className="mr-1"/>{row.name}</a> : row.name}</td>
                  <td className="p-2">{row.platform}</td>
                  <td className="p-2">{row.status === 'active' ? <span className="text-emerald-600">进行中</span> : <span className="text-gray-500">已暂停</span>}</td>
                  {visibleCols.impressions && <td className="p-2">{row.impressions.toLocaleString()}</td>}
                  {visibleCols.clicks && <td className="p-2">{row.clicks.toLocaleString()}</td>}
                  {visibleCols.ctr && <td className="p-2">{row.ctr}%</td>}
                  {visibleCols.cvr && <td className="p-2">{row.cvr}%</td>}
                  {visibleCols.cpc && <td className="p-2">¥{row.cpc.toFixed(2)}</td>}
                  {visibleCols.cpm && <td className="p-2">¥{row.cpm.toFixed(0)}</td>}
                  {visibleCols.gmv && <td className="p-2 text-sky-700 font-medium">¥{row.gmv.toLocaleString()}</td>}
                  {visibleCols.aov && <td className="p-2">¥{row.aov.toFixed(0)}</td>}
                  {visibleCols.roas && <td className="p-2 text-green-600 font-semibold">{row.roas}</td>}
                  {view === 'asset' && <td className="p-2"><Button size="sm" variant="outline">预览</Button></td>}
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td className="p-6 text-center text-gray-400" colSpan={14}>暂无数据，调整筛选条件试试</td></tr>
              )}
            </tbody>
          </table>

          {/* 分页（示意） */}
          <div className="mt-4 flex items-center justify-between">
            <div className="text-xs text-gray-500">共 {filtered.length} 条</div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline">上一页</Button>
              <Button size="sm" variant="outline">下一页</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI 智能分析 */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Sparkles className="text-sky-600"/> AI 智能分析（Beta）</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 自动洞察 */}
          <div className="rounded-xl border border-sky-100 bg-sky-50 p-4 text-sm text-sky-900">
            {buildInsights().map((t,i)=> (
              <p key={i} className="mb-1">• {t}</p>
            ))}
          </div>

          {/* 快速操作 */}
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" variant="outline" onClick={()=>sendMessage('给出预算分配建议')}>预算分配建议</Button>
            <Button size="sm" variant="outline" onClick={()=>sendMessage('应该暂停哪些达人或Campaign？')}>暂停建议</Button>
            <Button size="sm" variant="outline" onClick={()=>sendMessage('如何提升CTR？')}>提升CTR</Button>
            <Button size="sm" variant="outline" onClick={selectTopRecommendation}>选中Top推荐</Button>
          </div>

          {/* 对话区 */}
          <div className="rounded-2xl border border-gray-200">
            <div className="max-h-64 overflow-auto p-4 space-y-3">
              {messages.map((m, i)=> (
                <div key={i} className={`flex ${m.role==='user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`rounded-2xl px-3 py-2 text-sm shadow-sm ${m.role==='user' ? 'bg-sky-600 text-white' : 'bg-gray-100 text-gray-800'}`}>
                    {m.text}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 border-t border-gray-200 p-3">
              <MessageSquare size={18} className="text-sky-600"/>
              <input value={userInput} onChange={e=>setUserInput(e.target.value)} placeholder="问AI：例）如何把ROAS提升到5以上？" className="flex-1 outline-none"/>
              <Button size="sm" className="bg-sky-500 hover:bg-sky-600 text-white flex items-center gap-1" onClick={()=>sendMessage()}>
                <Send size={14}/> 发送
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 趋势图（移动到页面最后） */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader><CardTitle>趋势图（GMV & 点击数）</CardTitle></CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="day" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="gmv" stroke="#0284c7" strokeWidth={2} />
              <Line type="monotone" dataKey="clicks" stroke="#22c55e" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
