const DATA_FILES={terms:"data/terms.json",fields:"data/erp_fields.json",processes:"data/processes.json",metrics:"data/metrics.json",actions:"data/operation_actions.json",scenarios:"data/business_scenarios.json",quizzes:"data/quizzes.json",learningPath:"data/learning_path.json",lessons:"data/lessons.json",cases:"data/cases.json",appVersion:"data/app_version.json"};const LOCAL_KEYS={terms:"erpLearning_user_terms",fields:"erpLearning_user_fields",metrics:"erpLearning_user_metrics",actions:"erpLearning_user_actions",scenarios:"erpLearning_user_scenarios",notes:"erpLearning_user_notes",masteredQuizzes:"erpLearning_mastered_quizzes",learningProgress:"erpLearning_learning_progress"};const moduleNames={dashboard:"首页",growthCenter:"电商知识成长中心",onlineCenter:"联网增强中心",terms:"电商术语库",fields:"ERP 字段解释器",processes:"业务流程地图",metrics:"指标口径库",actions:"运营动作库",scenarios:"业务场景分析库",quizzes:"业务练习题",calculator:"指标计算器",notes:"我的学习笔记",backup:"数据备份与同步"};let initialData={},localData={};const moduleConfigs={terms:{dataKey:"terms",localKey:"terms",listId:"termsList",formAreaId:"termsFormArea",searchId:"termsSearch",filterId:"termsFilter",resetId:"termsReset",titleField:"name",categoryField:"category",summaryField:"plain_explanation",idPrefix:"user-term",fields:[["name","术语名称","text"],["category","分类","text"],["plain_explanation","通俗解释","textarea"],["business_context","业务场景","textarea"],["related_erp_fields","相关 ERP 字段（逗号分隔）","text"],["related_metrics","相关指标（逗号分隔）","text"],["common_misunderstandings","容易误解的地方","textarea"],["analyst_view","数据分析师视角","textarea"],["example","例子","textarea"]]},fields:{dataKey:"fields",localKey:"fields",listId:"fieldsList",formAreaId:"fieldsFormArea",searchId:"fieldsSearch",filterId:"fieldsFilter",resetId:"fieldsReset",titleField:"field_name",categoryField:"module",summaryField:"plain_explanation",idPrefix:"user-field",fields:[["field_name","字段名","text"],["module","所属模块","text"],["plain_explanation","通俗解释","textarea"],["business_meaning","业务含义","textarea"],["source","常见来源","text"],["related_process","关联流程","text"],["related_metrics","关联指标（逗号分隔）","text"],["common_misunderstanding","容易误解的地方","textarea"],["analyst_view","分析师关注点","textarea"],["example","例子","textarea"]]},metrics:{dataKey:"metrics",localKey:"metrics",listId:"metricsList",formAreaId:"metricsFormArea",searchId:"metricsSearch",filterId:"metricsFilter",resetId:"metricsReset",titleField:"metric_name",categoryField:"category",summaryField:"plain_explanation",idPrefix:"user-metric",fields:[["metric_name","指标名称","text"],["category","分类","text"],["formula","计算公式","text"],["plain_explanation","通俗解释","textarea"],["business_meaning","业务含义","textarea"],["data_fields_needed","需要字段（逗号分隔）","text"],["common_pitfalls","常见口径坑","textarea"],["analysis_usage","分析时怎么用","textarea"],["example","例子","textarea"]]},actions:{dataKey:"actions",localKey:"actions",listId:"actionsList",formAreaId:"actionsFormArea",searchId:"actionsSearch",filterId:"actionsFilter",resetId:"actionsReset",titleField:"action_name",categoryField:"action_type",summaryField:"purpose",idPrefix:"user-action",fields:[["action_name","动作名称","text"],["action_type","动作类型","text"],["purpose","目的","textarea"],["affected_metrics","影响指标（逗号分隔）","text"],["possible_positive_effects","可能好处","textarea"],["possible_risks","可能风险","textarea"],["suitable_scenarios","适用场景","textarea"],["analyst_view","分析师关注点","textarea"],["example","例子","textarea"]]},scenarios:{dataKey:"scenarios",localKey:"scenarios",listId:"scenariosList",formAreaId:"scenariosFormArea",searchId:"scenariosSearch",filterId:"scenariosFilter",resetId:"scenariosReset",titleField:"scenario_title",categoryField:"scenario_type",summaryField:"scenario_description",idPrefix:"user-scenario",fields:[["scenario_title","场景标题","text"],["scenario_type","场景类型","text"],["scenario_description","场景描述","textarea"],["observed_data","看到的数据现象","textarea"],["possible_reasons","可能原因（逗号分隔）","text"],["related_terms","相关术语（逗号分隔）","text"],["related_metrics","相关指标（逗号分隔）","text"],["related_processes","相关流程（逗号分隔）","text"],["how_to_analyze","分析思路","textarea"],["next_actions","下一步看什么","textarea"]]}};const calculatorDefinitions={grossProfit:{label:"毛利",fields:[["sales","销售额"],["cost","成本"],["platformFee","平台费用"],["otherFee","其他费用"]],formula:"毛利 = 销售额 - 成本 - 平台费用 - 其他费用",calculate:v=>v.sales-v.cost-v.platformFee-v.otherFee,unit:"元",explain:"毛利越高，说明扣除直接成本和费用后的利润空间越大。"},grossMargin:{label:"毛利率",fields:[["grossProfit","毛利"],["sales","销售额"]],formula:"毛利率 = 毛利 / 销售额",calculate:v=>safeRate(v.grossProfit,v.sales),unit:"%",explain:"毛利率用于比较不同商品或活动的盈利能力。"},refundRate:{label:"退款率",fields:[["refund","退款金额"],["sales","销售额"]],formula:"退款率 = 退款金额 / 销售额",calculate:v=>safeRate(v.refund,v.sales),unit:"%",explain:"退款率升高会压低净销售额，也可能说明商品、物流或售后有问题。"},averageOrderValue:{label:"客单价",fields:[["sales","销售额"],["orders","订单数"]],formula:"客单价 = 销售额 / 订单数",calculate:v=>safeDivide(v.sales,v.orders),unit:"元/单",explain:"客单价用于观察每个订单的平均贡献。"},roi:{label:"ROI / 投产比",fields:[["sales","销售额"],["adCost","投流花费"]],formula:"ROI = 销售额 / 投流花费",calculate:v=>safeDivide(v.sales,v.adCost),unit:"",explain:"ROI 需要结合毛利和退款看，不能只看销售额。"},netSales:{label:"净销售额",fields:[["sales","销售额"],["refund","退款金额"]],formula:"净销售额 = 销售额 - 退款金额",calculate:v=>v.sales-v.refund,unit:"元",explain:"净销售额更接近实际留下来的销售成果。"},costRate:{label:"成本率",fields:[["cost","成本"],["sales","销售额"]],formula:"成本率 = 成本 / 销售额",calculate:v=>safeRate(v.cost,v.sales),unit:"%",explain:"成本率越高，商品利润空间通常越低。"}};document.addEventListener("DOMContentLoaded",async()=>{bindNavigation();bindBackupEvents();bindCalculatorEvents();bindSyncCenterEvents();await loadInitialData();loadLocalData();setupKnowledgeModules();renderAll();registerServiceWorker()});async function loadInitialData(){try{const entries=await Promise.all(Object.entries(DATA_FILES).map(async([key,path])=>{const response=await fetch(path);if(!response.ok)throw new Error(path+" 加载失败");return[key,await response.json()]}));initialData=Object.fromEntries(entries)}catch(error){showToast("初始 JSON 数据加载失败，请用本地服务器打开项目。",true);initialData={terms:[],fields:[],processes:[],metrics:[],actions:[],scenarios:[],quizzes:[],learningPath:[],lessons:[],cases:[],appVersion:{}};console.error(error)}}function loadLocalData(){localData={};Object.entries(LOCAL_KEYS).forEach(([key,storageKey])=>{localData[key]=key==="learningProgress"?getLearningProgress():readJson(storageKey,[])})}function getDefaultLearningProgress(){return{currentStage:"stage-1",currentStageUpdatedAt:new Date().toISOString(),completedLessons:[],completedDailyTasks:[],completedCases:[],masteryStatus:{},reviewItems:[],growthLogs:[],dailyTaskOverrides:{}}}function getLearningProgress(){const saved=readJson(LOCAL_KEYS.learningProgress,{});return{...getDefaultLearningProgress(),...saved}}function saveLearningProgress(progress){const next={...getDefaultLearningProgress(),...progress};localStorage.setItem(LOCAL_KEYS.learningProgress,JSON.stringify(next));localData.learningProgress=next;if(!(window&&window.__erpApplyingSyncData)){markLocalDataChanged()}}function readJson(key,fallback){try{const raw=localStorage.getItem(key);return raw?JSON.parse(raw):fallback}catch(error){console.warn(key+" 读取失败，已使用空数据。",error);return fallback}}function saveLocalData(key){localStorage.setItem(LOCAL_KEYS[key],JSON.stringify(localData[key]||[]));if(!(window&&window.__erpApplyingSyncData)){markLocalDataChanged()}}function bindNavigation(){document.querySelectorAll(".nav-button").forEach(button=>{button.addEventListener("click",()=>showModule(button.dataset.module))})}function showModule(moduleId){document.querySelectorAll(".module-section").forEach(section=>section.classList.toggle("active",section.id===moduleId));document.querySelectorAll(".nav-button").forEach(button=>button.classList.toggle("active",button.dataset.module===moduleId));document.getElementById("currentModuleName").textContent=moduleNames[moduleId]||"";renderAll()}function setupKnowledgeModules(){Object.values(moduleConfigs).forEach(config=>{buildForm(config);document.getElementById(config.searchId).addEventListener("input",()=>renderKnowledgeModule(config));document.getElementById(config.filterId).addEventListener("change",()=>renderKnowledgeModule(config));document.getElementById(config.resetId).addEventListener("click",()=>resetUserItems(config))});document.getElementById("processesSearch").addEventListener("input",renderProcesses);document.getElementById("quizzesFilter").addEventListener("change",renderQuizzes);document.getElementById("notesSearch").addEventListener("input",renderNotes);buildNotesForm()}function renderAll(){renderDashboard();renderGrowthCenter();renderOnlineCenter();Object.values(moduleConfigs).forEach(renderKnowledgeModule);renderProcesses();renderQuizzes();renderCalculatorForm();renderNotes();renderBackupSummary();renderSyncCenter()}function getCombinedItems(config){const initialItems=initialData[config.dataKey]||[];const userItems=(localData[config.localKey]||[]).filter(item=>!item.isDeleted).map(item=>({...item,isUser:true}));return[...initialItems,...userItems]}function buildForm(config){const area=document.getElementById(config.formAreaId);const fieldsHtml=config.fields.map(([name,label,type])=>{const full=type==="textarea"?" full":"";const control=type==="textarea"?`<textarea name="${name}" required></textarea>`:`<input type="text" name="${name}" required>`;return`<div class="form-field${full}"><label>${label}</label>${control}</div>`}).join("");area.innerHTML=`<form class="form-panel" id="${config.localKey}Form"><h3>新增${moduleNames[config.localKey]||"内容"}</h3><div class="form-grid">${fieldsHtml}</div><div class="form-actions"><button class="primary-button" type="submit">保存到本地</button></div></form>`;document.getElementById(`${config.localKey}Form`).addEventListener("submit",event=>{event.preventDefault();const formData=new FormData(event.currentTarget);const item={id:`${config.idPrefix}-${Date.now()}`};config.fields.forEach(([name])=>{const value=String(formData.get(name)||"").trim();item[name]=name.includes("related")||name.includes("possible")||name.includes("needed")?splitList(value):value});localData[config.localKey].unshift(item);saveLocalData(config.localKey);event.currentTarget.reset();renderKnowledgeModule(config);renderDashboard();showToast("已保存到本地浏览器")})}function renderKnowledgeModule(config){const list=document.getElementById(config.listId);const search=document.getElementById(config.searchId).value.trim().toLowerCase();const filter=document.getElementById(config.filterId).value;const allItems=getCombinedItems(config);fillFilter(config.filterId,allItems.map(item=>item[config.categoryField]),filter);const filtered=allItems.filter(item=>(!search||JSON.stringify(item).toLowerCase().includes(search))&&(!filter||item[config.categoryField]===filter));if(filtered.length===0){list.innerHTML=`<div class="empty">没有找到匹配内容，可以调整搜索词或新增自己的记录。</div>`;return}list.innerHTML=filtered.map(item=>renderKnowledgeCard(item,config)).join("");list.querySelectorAll("[data-delete]").forEach(button=>{button.addEventListener("click",()=>deleteUserItem(config,button.dataset.delete))})}function renderKnowledgeCard(item,config){const details=Object.entries(item).filter(([key])=>!["id","isUser","type","title","name","createdAt","updatedAt","deletedAt","deviceId","revision","isDeleted"].includes(key)).map(([key,value])=>`<p><strong>${translateField(key)}：</strong>${formatValue(value)}</p>`).join("");const deleteButton=item.isUser?`<button class="danger-button" data-delete="${item.id}">删除本地记录</button>`:"";return`<article class="card"><span class="badge ${item.isUser?"user-badge":""}">${item.isUser?"本地新增":item[config.categoryField]}</span><h3>${escapeHtml(item[config.titleField])}</h3><p>${escapeHtml(item[config.summaryField]||"")}</p><details><summary>展开详情</summary><div class="detail-list">${details}</div></details>${deleteButton}</article>`}function deleteUserItem(config,id){if(!confirm("确定删除这条本地新增记录吗？"))return;localData[config.localKey]=localData[config.localKey].filter(item=>item.id!==id);saveLocalData(config.localKey);renderKnowledgeModule(config);renderDashboard()}function resetUserItems(config){if(!confirm("只会清空本模块本地新增数据，不影响初始 JSON 示例数据。确定继续吗？"))return;localData[config.localKey]=[];saveLocalData(config.localKey);renderKnowledgeModule(config);renderDashboard();showToast("已重置本模块本地新增数据")}function renderDashboard(){const terms=getCombinedItems(moduleConfigs.terms),fields=getCombinedItems(moduleConfigs.fields),metrics=getCombinedItems(moduleConfigs.metrics),actions=getCombinedItems(moduleConfigs.actions),scenarios=getCombinedItems(moduleConfigs.scenarios),notes=localData.notes||[],mastered=localData.masteredQuizzes||[],dayIndex=new Date().getDate(),pick=arr=>arr.length?arr[dayIndex%arr.length]:null,todayTerm=pick(terms),todayField=pick(fields),todayMetric=pick(metrics),todayAction=pick(actions),todayProcess=pick(initialData.processes||[]),todayQuiz=pick(initialData.quizzes||[]),stage=(initialData.learningPath||[])[0];document.getElementById("dashboardContent").innerHTML=`<div class="stat-grid">${statCard("术语",terms.length)}${statCard("ERP 字段",fields.length)}${statCard("指标",metrics.length)}${statCard("运营动作",actions.length)}${statCard("已掌握题",mastered.length)}${statCard("业务场景",scenarios.length)}${statCard("学习笔记",notes.length)}</div><div class="dashboard-grid"><div class="card"><h3>今日建议学习路径</h3><ol><li>先学一个术语：${todayTerm?todayTerm.name:"暂无"}</li><li>再看一个 ERP 字段：${todayField?todayField.field_name:"暂无"}</li><li>再理解一个流程：${todayProcess?todayProcess.process_name:"暂无"}</li><li>再看一个运营动作：${todayAction?todayAction.action_name:"暂无"}</li><li>最后做一道练习题：${todayQuiz?todayQuiz.question:"暂无"}</li></ol></div><div class="card"><h3>当前学习阶段建议</h3><p><strong>${stage?stage.stage_name:"暂无学习路径"}</strong></p><p>${stage?stage.goal:"请检查 learning_path.json"}</p></div><div class="card"><h3>今日数据指标</h3><p>${todayMetric?todayMetric.metric_name+"："+todayMetric.formula:"暂无"}</p></div><div class="card"><h3>最近新增的学习笔记</h3>${notes.slice(0,3).map(note=>`<p>${escapeHtml(note.date)}：${escapeHtml(note.problem)}</p>`).join("")||"<p>还没有本地笔记。</p>"}</div><div class="card"><h3>数据备份提醒</h3><p>本项目不会自动云同步。建议每周导出一次本地数据 JSON，并保存到你自己的设备。</p></div></div>`}function statCard(label,value){return`<div class="stat-card"><span>${label}</span><strong>${value}</strong></div>`}function renderProcesses(){const keyword=document.getElementById("processesSearch").value.trim().toLowerCase();const processes=(initialData.processes||[]).filter(process=>!keyword||JSON.stringify(process).toLowerCase().includes(keyword));const list=document.getElementById("processesList");list.innerHTML=processes.map(process=>`<article class="card"><h3>${process.process_name}</h3><p>${process.description}</p><details><summary>查看流程节点</summary>${process.nodes.map((node,index)=>`<div class="card"><span class="badge">${index+1}</span><h3>${node.node_name}</h3><p>${node.explanation}</p><details><summary>节点详情</summary><div class="detail-list"><p><strong>涉及角色：</strong>${node.responsible_role}</p><p><strong>相关字段：</strong>${formatValue(node.related_erp_fields)}</p><p><strong>相关指标：</strong>${formatValue(node.related_metrics)}</p><p><strong>常见问题：</strong>${node.possible_problems}</p><p><strong>分析师视角：</strong>${node.analyst_view}</p></div></details></div>`).join("")}</details></article>`).join("")||`<div class="empty">没有找到匹配流程。</div>`}function renderQuizzes(){const filter=document.getElementById("quizzesFilter").value;fillFilter("quizzesFilter",(initialData.quizzes||[]).map(item=>item.difficulty),filter,"全部难度");const mastered=new Set(localData.masteredQuizzes||[]);const quizzes=(initialData.quizzes||[]).filter(item=>!filter||item.difficulty===filter);document.getElementById("quizzesList").innerHTML=quizzes.map(item=>`<article class="card"><span class="badge">${item.difficulty}</span><h3>${item.question}</h3><p>${item.scenario}</p><ul>${item.options.map(option=>`<li>${option}</li>`).join("")}</ul><details><summary>查看答案</summary><p><strong>正确答案：</strong>${item.answer}</p><p>${item.explanation}</p></details><button class="${mastered.has(item.id)?"secondary-button":"primary-button"}" data-master="${item.id}">${mastered.has(item.id)?"已掌握":"标记已掌握"}</button></article>`).join("");document.querySelectorAll("[data-master]").forEach(button=>{button.addEventListener("click",()=>toggleMasteredQuiz(button.dataset.master))})}function toggleMasteredQuiz(id){const mastered=new Set(localData.masteredQuizzes||[]);mastered.has(id)?mastered.delete(id):mastered.add(id);localData.masteredQuizzes=Array.from(mastered);saveLocalData("masteredQuizzes");renderQuizzes();renderDashboard()}function bindCalculatorEvents(){const select=document.getElementById("calculatorType");select.innerHTML=Object.entries(calculatorDefinitions).map(([key,item])=>`<option value="${key}">${item.label}</option>`).join("");select.addEventListener("change",renderCalculatorForm);document.getElementById("calculateButton").addEventListener("click",calculateMetric)}function renderCalculatorForm(){const key=document.getElementById("calculatorType").value||"grossProfit";const definition=calculatorDefinitions[key];document.getElementById("calculatorInputs").innerHTML=definition.fields.map(([name,label])=>`<div class="form-field"><label>${label}</label><input type="number" step="0.01" min="0" data-calc-field="${name}" placeholder="请输入数字"></div>`).join("")}function calculateMetric(){const key=document.getElementById("calculatorType").value;const definition=calculatorDefinitions[key];const values={};document.querySelectorAll("[data-calc-field]").forEach(input=>values[input.dataset.calcField]=Number(input.value||0));const result=definition.calculate(values);const display=definition.unit==="%"?result.toFixed(2)+"%":result.toFixed(2)+(definition.unit?" "+definition.unit:"");document.getElementById("calculatorResult").innerHTML=`<h3>计算结果：${display}</h3><p><strong>公式：</strong>${definition.formula}</p><p><strong>业务解释：</strong>${definition.explain}</p><p><strong>口径提醒：</strong>请确认金额是否含退款、平台费用、活动优惠，以及时间范围是否一致。</p>`}function buildNotesForm(){document.getElementById("notesFormArea").innerHTML=`<form class="form-panel" id="noteForm"><h3>新增学习笔记</h3><div class="form-grid"><div class="form-field"><label>日期</label><input type="date" name="date" required></div><div class="form-field"><label>今天遇到的术语</label><input type="text" name="terms" required></div><div class="form-field"><label>今天遇到的 ERP 字段</label><input type="text" name="fields" required></div><div class="form-field full"><label>今天遇到的业务问题</label><textarea name="problem" required></textarea></div><div class="form-field full"><label>我的理解</label><textarea name="understanding" required></textarea></div><div class="form-field full"><label>还没弄懂的地方</label><textarea name="unknown" required></textarea></div><div class="form-field full"><label>后续要查什么</label><textarea name="next" required></textarea></div></div><div class="form-actions"><button class="primary-button" type="submit">保存笔记</button></div></form>`;document.querySelector("#noteForm input[name='date']").valueAsDate=new Date;document.getElementById("noteForm").addEventListener("submit",event=>{event.preventDefault();const formData=new FormData(event.currentTarget);localData.notes.unshift({id:"note-"+Date.now(),date:formData.get("date"),terms:formData.get("terms"),fields:formData.get("fields"),problem:formData.get("problem"),understanding:formData.get("understanding"),unknown:formData.get("unknown"),next:formData.get("next")});saveLocalData("notes");event.currentTarget.reset();renderNotes();renderDashboard();showToast("笔记已保存到本地")})}function renderNotes(){const keyword=document.getElementById("notesSearch").value.trim().toLowerCase();const notes=(localData.notes||[]).filter(note=>!note.isDeleted&&(!keyword||JSON.stringify(note).toLowerCase().includes(keyword)));document.getElementById("notesList").innerHTML=notes.map(note=>`<article class="card"><span class="badge">${note.date}</span><h3>${escapeHtml(note.problem)}</h3><p><strong>术语：</strong>${escapeHtml(note.terms)}</p><p><strong>ERP 字段：</strong>${escapeHtml(note.fields)}</p><details><summary>查看完整笔记</summary><div class="detail-list"><p><strong>我的理解：</strong>${escapeHtml(note.understanding)}</p><p><strong>没弄懂：</strong>${escapeHtml(note.unknown)}</p><p><strong>后续要查：</strong>${escapeHtml(note.next)}</p></div></details><button class="danger-button" data-delete-note="${note.id}">删除笔记</button></article>`).join("")||`<div class="empty">还没有学习笔记。</div>`;document.querySelectorAll("[data-delete-note]").forEach(button=>button.addEventListener("click",()=>deleteNote(button.dataset.deleteNote)))}function deleteNote(id){if(!confirm("确定删除这条笔记吗？"))return;localData.notes=localData.notes.filter(note=>note.id!==id);saveLocalData("notes");renderNotes();renderDashboard()}function bindBackupEvents(){document.getElementById("exportButton").addEventListener("click",exportLocalData);document.getElementById("importFile").addEventListener("change",importLocalData);document.getElementById("clearLocalButton").addEventListener("click",clearLocalData)}function exportLocalData(){const backup={app:"ecommerce-erp-business-learning-pwa",exported_at:new Date().toISOString(),data:{}};Object.keys(LOCAL_KEYS).forEach(key=>{backup.data[key]=key==="learningProgress"?getLearningProgress():(localData[key]||[])});const blob=new Blob([JSON.stringify(backup,null,2)],{type:"application/json"});const url=URL.createObjectURL(blob);const link=document.createElement("a");link.href=url;link.download=`erp-learning-backup-${new Date().toISOString().slice(0,10)}.json`;link.click();URL.revokeObjectURL(url)}function importLocalData(event){const file=event.target.files[0];if(!file)return;if(!confirm("导入会覆盖当前浏览器中的本地用户数据，请确认你已经备份。"))return;const reader=new FileReader;reader.onload=()=>{try{const backup=JSON.parse(reader.result);Object.keys(LOCAL_KEYS).forEach(key=>{if(key==="learningProgress"){saveLearningProgress(backup.data&&backup.data.learningProgress?backup.data.learningProgress:getDefaultLearningProgress());return}localData[key]=backup.data&&Array.isArray(backup.data[key])?backup.data[key]:[];saveLocalData(key)});showToast("导入成功，页面数据已刷新");renderAll()}catch(error){showToast("导入失败，请确认文件格式正确。",true)}};reader.readAsText(file,"utf-8")}function clearLocalData(){if(!confirm("确定清空本项目所有本地用户数据吗？初始 JSON 示例数据不会受影响。"))return;Object.values(LOCAL_KEYS).forEach(key=>localStorage.removeItem(key));loadLocalData();renderAll();showToast("本地用户数据已清空")}function renderBackupSummary(){const labels={terms:"本地术语",fields:"本地 ERP 字段",metrics:"本地指标",actions:"本地运营动作",scenarios:"本地业务场景",notes:"学习笔记",masteredQuizzes:"已掌握题目",learningProgress:"学习进度"};const valueOf=key=>key==="learningProgress"?`${(getLearningProgress().completedLessons||[]).length} 节课程`:(localData[key]||[]).length;document.getElementById("backupSummary").innerHTML=Object.keys(LOCAL_KEYS).map(key=>`<div class="stat-card"><span>${labels[key]||key}</span><strong>${valueOf(key)}</strong></div>`).join("")}function fillFilter(selectId,values,currentValue,allLabel="全部分类"){const select=document.getElementById(selectId);const unique=Array.from(new Set(values.filter(Boolean))).sort();select.innerHTML=`<option value="">${allLabel}</option>`+unique.map(value=>`<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`).join("");select.value=currentValue||""}function splitList(value){return value.split(/[,，]/).map(item=>item.trim()).filter(Boolean)}function formatValue(value){return Array.isArray(value)?value.map(escapeHtml).join("、"):escapeHtml(String(value??""))}function translateField(key){const map={name:"名称",category:"分类",plain_explanation:"通俗解释",business_context:"业务场景",related_erp_fields:"相关 ERP 字段",related_metrics:"相关指标",common_misunderstandings:"容易误解",analyst_view:"分析师视角",example:"例子",field_name:"字段名",module:"模块",business_meaning:"业务含义",source:"来源",related_process:"关联流程",common_misunderstanding:"容易误解",metric_name:"指标名称",formula:"公式",data_fields_needed:"需要字段",common_pitfalls:"口径坑",analysis_usage:"分析用途",action_name:"动作名称",action_type:"动作类型",purpose:"目的",affected_metrics:"影响指标",possible_positive_effects:"可能好处",possible_risks:"可能风险",suitable_scenarios:"适用场景",scenario_title:"场景标题",scenario_type:"场景类型",scenario_description:"场景描述",observed_data:"数据现象",possible_reasons:"可能原因",related_terms:"相关术语",related_processes:"相关流程",how_to_analyze:"分析思路",next_actions:"下一步"};return map[key]||key}function safeDivide(a,b){return b===0?0:a/b}function safeRate(a,b){return b===0?0:a/b*100}function escapeHtml(value){return String(value).replace(/[&<>"]/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[char]))}function showToast(message,isError=false){const toast=document.getElementById("toast");toast.textContent=message;toast.style.background=isError?"#991b1b":"#111827";toast.classList.add("show");setTimeout(()=>toast.classList.remove("show"),2600)}function registerServiceWorker(){if("serviceWorker"in navigator)navigator.serviceWorker.register("service-worker.js").catch(error=>console.warn("Service worker 注册失败",error))}

const SYNC_FILE_NAME = "erp-learning-sync.json";
const SYNC_STORAGE_KEYS = {
  deviceId: "erpLearning_device_id",
  deviceName: "erpLearning_device_name",
  token: "erpLearning_github_token",
  gistId: "erpLearning_gist_id",
  fileName: "erpLearning_gist_file_name",
  lastSyncAt: "erpLearning_last_sync_at",
  remoteUpdatedAt: "erpLearning_remote_updated_at",
  localUpdatedAt: "erpLearning_local_updated_at",
  autoSyncEnabled: "erpLearning_auto_sync_enabled",
  syncLogs: "erpLearning_sync_logs",
  conflictLogs: "erpLearning_conflict_logs",
  learningProgress: "erpLearning_learning_progress",
  userCategories: "erpLearning_user_categories",
  userSettings: "erpLearning_user_settings"
};
const SYNC_ARRAY_MAP = [
  ["terms", "userTerms", "term"],
  ["fields", "userErpFields", "erpField"],
  ["metrics", "userMetrics", "metric"],
  ["actions", "userOperationActions", "operationAction"],
  ["scenarios", "userBusinessScenarios", "businessScenario"],
  ["notes", "userNotes", "note"]
];
let autoSyncTimer = null;

function getOrCreateDeviceId() {
  let id = localStorage.getItem(SYNC_STORAGE_KEYS.deviceId);
  if (!id) {
    id = "device-" + Date.now() + "-" + Math.random().toString(16).slice(2);
    localStorage.setItem(SYNC_STORAGE_KEYS.deviceId, id);
  }
  return id;
}
function getDeviceName() {
  return localStorage.getItem(SYNC_STORAGE_KEYS.deviceName) || "未命名设备";
}
function saveDeviceName(name) {
  localStorage.setItem(SYNC_STORAGE_KEYS.deviceName, name || "未命名设备");
}
function loadSyncConfig() {
  return {
    token: localStorage.getItem(SYNC_STORAGE_KEYS.token) || "",
    gistId: localStorage.getItem(SYNC_STORAGE_KEYS.gistId) || "",
    deviceName: getDeviceName(),
    fileName: localStorage.getItem(SYNC_STORAGE_KEYS.fileName) || SYNC_FILE_NAME,
    autoSyncEnabled: localStorage.getItem(SYNC_STORAGE_KEYS.autoSyncEnabled) === "true"
  };
}
function saveSyncConfig() {
  const token = document.getElementById("syncTokenInput").value.trim();
  const gistId = document.getElementById("syncGistIdInput").value.trim();
  const deviceName = document.getElementById("syncDeviceNameInput").value.trim() || "未命名设备";
  const fileName = document.getElementById("syncFileNameInput").value.trim() || SYNC_FILE_NAME;
  localStorage.setItem(SYNC_STORAGE_KEYS.token, token);
  localStorage.setItem(SYNC_STORAGE_KEYS.gistId, gistId);
  saveDeviceName(deviceName);
  localStorage.setItem(SYNC_STORAGE_KEYS.fileName, fileName);
  showToast("同步配置已保存到当前浏览器");
  updateSyncStatus("未命名设备");
}
function clearSyncConfig() {
  if (!confirm("确定清除当前浏览器中的 GitHub Token、Gist ID 和设备名称吗？")) return;
  [SYNC_STORAGE_KEYS.token, SYNC_STORAGE_KEYS.gistId, SYNC_STORAGE_KEYS.deviceName, SYNC_STORAGE_KEYS.fileName].forEach(key => localStorage.removeItem(key));
  fillSyncConfigForm();
  updateSyncStatus("同步配置已清除");
}
function validateSyncConfig(config) {
  if (!config.token) return { ok: false, message: "GitHub Token 为空。请先在同步中心填写你自己的 token。" };
  if (!config.gistId) return { ok: false, message: "Gist ID 为空。请先填写用于同步的 Gist ID。" };
  if (!config.fileName) return { ok: false, message: "Gist 文件名为空。默认应为 erp-learning-sync.json。" };
  return { ok: true, message: "未知错误" };
}
function collectLocalProjectData() {
  const deviceId = getOrCreateDeviceId();
  const now = new Date().toISOString();
  const data = {
    userTerms: [], userErpFields: [], userMetrics: [], userOperationActions: [], userBusinessScenarios: [], userNotes: [], quizMastered: [],
    learningProgress: getLearningProgress(),
    userCategories: readJson(SYNC_STORAGE_KEYS.userCategories, []),
    userSettings: { ...readJson(SYNC_STORAGE_KEYS.userSettings, {}), autoSyncEnabled: localStorage.getItem(SYNC_STORAGE_KEYS.autoSyncEnabled) === "true" },
    syncLogs: readJson(SYNC_STORAGE_KEYS.syncLogs, []),
    conflictLogs: readJson(SYNC_STORAGE_KEYS.conflictLogs, [])
  };
  SYNC_ARRAY_MAP.forEach(([localKey, syncKey, type]) => {
    data[syncKey] = (localData[localKey] || []).map(item => normalizeSyncItem(item, type, deviceId, now));
  });
  data.quizMastered = (localData.masteredQuizzes || []).map(item => normalizeQuizMastered(item, deviceId, now));
  return createSyncDocument(data);
}
function saveProjectDataToLocal(syncDocument) {
  const data = normalizeSyncDocument(syncDocument).data;
  window.__erpApplyingSyncData = true;
  try {
    localData.terms = data.userTerms || [];
    localData.fields = data.userErpFields || [];
    localData.metrics = data.userMetrics || [];
    localData.actions = data.userOperationActions || [];
    localData.scenarios = data.userBusinessScenarios || [];
    localData.notes = data.userNotes || [];
    localData.masteredQuizzes = (data.quizMastered || []).filter(item => !item.isDeleted).map(item => item.quizId || item.id);
    ["terms", "fields", "metrics", "actions", "scenarios", "notes", "masteredQuizzes"].forEach(saveLocalData);
    saveLearningProgress(data.learningProgress || getDefaultLearningProgress());
    localStorage.setItem(SYNC_STORAGE_KEYS.userCategories, JSON.stringify(data.userCategories || []));
    localStorage.setItem(SYNC_STORAGE_KEYS.userSettings, JSON.stringify(data.userSettings || {}));
    localStorage.setItem(SYNC_STORAGE_KEYS.syncLogs, JSON.stringify((data.syncLogs || []).slice(0, 100)));
    localStorage.setItem(SYNC_STORAGE_KEYS.conflictLogs, JSON.stringify((data.conflictLogs || []).slice(0, 100)));
  } finally {
    window.__erpApplyingSyncData = false;
  }
  renderAll();
}
function getLocalUpdatedAt() {
  return localStorage.getItem(SYNC_STORAGE_KEYS.localUpdatedAt) || "当前同步状态";
}
function markLocalDataChanged() {
  localStorage.setItem(SYNC_STORAGE_KEYS.localUpdatedAt, new Date().toISOString());
}
async function testGistConnection() {
  const config = loadSyncConfig();
  const check = validateSyncConfig(config);
  if (!check.ok) throw new Error(check.message);
  const response = await fetch("https://api.github.com/gists/" + encodeURIComponent(config.gistId), { headers: createGistHeaders(config.token) });
  if (response.status === 401) throw new Error("GitHub Token 无效，请重新生成或检查复制是否完整。");
  if (response.status === 403) throw new Error("Token 权限不足或 GitHub API 暂时限制，请确认 token 有 Gist 写权限。");
  if (response.status === 404) throw new Error("Gist 不存在，请检查 Gist ID。");
  if (!response.ok) throw new Error("GitHub API 返回异常，状态码 " + response.status + "。");
  addSyncLog("测试连接", "成功", "Gist 可以访问");
  updateSyncStatus("当前同步状态");
  showToast("GitHub Gist 连接成功");
}
async function fetchGistData() {
  const config = loadSyncConfig();
  const check = validateSyncConfig(config);
  if (!check.ok) throw new Error(check.message);
  const response = await fetch("https://api.github.com/gists/" + encodeURIComponent(config.gistId), { headers: createGistHeaders(config.token) });
  if (response.status === 401) throw new Error("GitHub Token ???");
  if (response.status === 403) throw new Error("Token 权限不足，建议只授予 Gist 写权限后重试。");
  if (response.status === 404) throw new Error("Gist 不存在，请检查 Gist ID。");
  if (!response.ok) throw new Error("拉取 Gist 失败，状态码 " + response.status + "。");
  const gist = await response.json();
  const file = gist.files && gist.files[config.fileName];
  if (!file || !file.content) return createSyncDocument({});
  try {
    const parsed = JSON.parse(file.content);
    localStorage.setItem(SYNC_STORAGE_KEYS.remoteUpdatedAt, parsed.updatedAt || "未知");
    return normalizeSyncDocument(parsed);
  } catch (error) {
    throw new Error("Gist 文件不是有效 JSON，请检查 erp-learning-sync.json 内容。");
  }
}
async function updateGistData(syncDocument) {
  const config = loadSyncConfig();
  const check = validateSyncConfig(config);
  if (!check.ok) throw new Error(check.message);
  const response = await fetch("https://api.github.com/gists/" + encodeURIComponent(config.gistId), {
    method: "PATCH",
    headers: createGistHeaders(config.token),
    body: JSON.stringify(createGistFilePayload(syncDocument))
  });
  if (response.status === 401) throw new Error("GitHub Token 无效，无法上传。");
  if (response.status === 403) throw new Error("Token 权限不足，无法写入 Gist。");
  if (response.status === 404) throw new Error("Gist 不存在，无法上传。");
  if (!response.ok) throw new Error("拉取 Gist 失败，状态码 " + response.status + "。");
  localStorage.setItem(SYNC_STORAGE_KEYS.lastSyncAt, new Date().toISOString());
  localStorage.setItem(SYNC_STORAGE_KEYS.remoteUpdatedAt, syncDocument.updatedAt || "未知");
}
function createGistFilePayload(syncDocument) {
  const config = loadSyncConfig();
  return { files: { [config.fileName || SYNC_FILE_NAME]: { content: JSON.stringify(syncDocument, null, 2) } } };
}
function mergeProjectData(localDocument, remoteDocument) {
  const localDoc = normalizeSyncDocument(localDocument);
  const remoteDoc = normalizeSyncDocument(remoteDocument);
  const mergedData = { ...localDoc.data, ...remoteDoc.data };
  const conflicts = [];
  ["userTerms", "userErpFields", "userMetrics", "userOperationActions", "userBusinessScenarios", "userNotes", "quizMastered", "userCategories"].forEach(key => {
    const result = mergeArrayById(localDoc.data[key] || [], remoteDoc.data[key] || []);
    mergedData[key] = result.items;
    conflicts.push(...result.conflicts);
  });
  mergedData.learningProgress = mergeLearningProgress(localDoc.data.learningProgress, remoteDoc.data.learningProgress);
  mergedData.userSettings = { ...(remoteDoc.data.userSettings || {}), ...(localDoc.data.userSettings || {}) };
  mergedData.conflictLogs = [...conflicts, ...(localDoc.data.conflictLogs || []), ...(remoteDoc.data.conflictLogs || [])].slice(0, 100);
  mergedData.syncLogs = [...(localDoc.data.syncLogs || []), ...(remoteDoc.data.syncLogs || [])].slice(0, 100);
  return createSyncDocument(mergedData, Math.max(Number(localDoc.syncVersion || 1), Number(remoteDoc.syncVersion || 1)) + 1);
}
function mergeArrayById(localArray, remoteArray) {
  const map = new Map();
  const conflicts = [];
  [...remoteArray, ...localArray].forEach(item => {
    if (!item || !item.id) return;
    if (!map.has(item.id)) {
      map.set(item.id, item);
      return;
    }
    const current = map.get(item.id);
    const resolved = resolveItemConflict(item, current);
    if (JSON.stringify(stripVolatileFields(item)) !== JSON.stringify(stripVolatileFields(current))) {
      conflicts.push(createConflictLog(item, current, resolved));
    }
    map.set(item.id, resolved);
  });
  return { items: Array.from(map.values()), conflicts };
}
function resolveItemConflict(localItem, remoteItem) {
  const localTime = Date.parse(localItem.updatedAt || localItem.createdAt || 0) || 0;
  const remoteTime = Date.parse(remoteItem.updatedAt || remoteItem.createdAt || 0) || 0;
  if (localTime !== remoteTime) return localTime > remoteTime ? localItem : remoteItem;
  return Number(localItem.revision || 0) >= Number(remoteItem.revision || 0) ? localItem : remoteItem;
}
function createConflictLog(localItem, remoteItem, resolvedItem) {
  return { id: "conflict-" + Date.now() + "-" + Math.random().toString(16).slice(2), type: "conflict", createdAt: new Date().toISOString(), itemId: localItem.id || remoteItem.id, localUpdatedAt: localItem.updatedAt || "", remoteUpdatedAt: remoteItem.updatedAt || "", result: "已保留 updatedAt 较新的版本", resolvedDeviceId: resolvedItem.deviceId || "未知设备" };
}
async function normalSync() {
  try {
    updateSyncStatus("正在普通同步...");
    const localDoc = collectLocalProjectData();
    const remoteDoc = await fetchGistData();
    const merged = mergeProjectData(localDoc, remoteDoc);
    addSyncLog("普通同步", "成功", "已合并本地和云端数据");
    merged.data.syncLogs = readJson(SYNC_STORAGE_KEYS.syncLogs, []);
    saveProjectDataToLocal(merged);
    await updateGistData(merged);
    updateSyncStatus("当前同步状态");
    showToast("当前同步状态");
  } catch (error) {
    addSyncLog("未知错误", "未知", sanitizeError(error));
    updateSyncStatus(sanitizeError(error));
    showToast(sanitizeError(error), true);
  }
}
async function forceUploadToCloud() {
  if (!confirm("强制上传会用当前设备数据覆盖 Gist 云端数据。请确认你已经备份。")) return;
  try {
    const localDoc = collectLocalProjectData();
    addSyncLog("强制上传", "成功", "当前设备数据已覆盖云端");
    localDoc.data.syncLogs = readJson(SYNC_STORAGE_KEYS.syncLogs, []);
    await updateGistData(localDoc);
    updateSyncStatus("当前同步状态");
    showToast("当前同步状态");
  } catch (error) {
    addSyncLog("未知错误", "未知", sanitizeError(error));
    updateSyncStatus(sanitizeError(error));
    showToast(sanitizeError(error), true);
  }
}
async function forceDownloadFromCloud() {
  if (!confirm("强制拉取会用 Gist 云端数据覆盖当前设备本地用户数据。请确认你已经备份。")) return;
  try {
    const remoteDoc = await fetchGistData();
    addSyncLog("强制拉取", "成功", "云端数据已覆盖当前设备");
    remoteDoc.data.syncLogs = readJson(SYNC_STORAGE_KEYS.syncLogs, []);
    saveProjectDataToLocal(remoteDoc);
    localStorage.setItem(SYNC_STORAGE_KEYS.lastSyncAt, new Date().toISOString());
    updateSyncStatus("当前同步状态");
    showToast("当前同步状态");
  } catch (error) {
    addSyncLog("未知错误", "未知", sanitizeError(error));
    updateSyncStatus(sanitizeError(error));
    showToast(sanitizeError(error), true);
  }
}
function updateSyncStatus(message) {
  localStorage.setItem("erpLearning_sync_status", message || "未配置");
  renderSyncCenter();
}
function addSyncLog(action, result, message) {
  const logs = readJson(SYNC_STORAGE_KEYS.syncLogs, []);
  logs.unshift({ id: "log-" + Date.now(), time: new Date().toISOString(), action, result, message: message || "" });
  localStorage.setItem(SYNC_STORAGE_KEYS.syncLogs, JSON.stringify(logs.slice(0, 100)));
}
function exportLocalBackup() { exportLocalData(); }
function importLocalBackup(event) { importLocalData(event); }
function clearLocalUserData() { clearLocalData(); }
function startAutoSync() {
  stopAutoSync();
  autoSyncTimer = setInterval(runAutoSyncIfNeeded, 5 * 60 * 1000);
}
function stopAutoSync() {
  if (autoSyncTimer) clearInterval(autoSyncTimer);
  autoSyncTimer = null;
}
function shouldAutoSync() {
  const config = loadSyncConfig();
  if (!config.autoSyncEnabled) return false;
  if (!validateSyncConfig(config).ok) return false;
  const localUpdatedAt = localStorage.getItem(SYNC_STORAGE_KEYS.localUpdatedAt) || "";
  const lastSyncAt = localStorage.getItem(SYNC_STORAGE_KEYS.lastSyncAt) || "";
  return !!localUpdatedAt && localUpdatedAt > lastSyncAt;
}
function runAutoSyncIfNeeded() {
  if (shouldAutoSync()) normalSync();
}
function bindSyncCenterEvents() {
  if (!document.getElementById("syncCenter")) return;
  document.getElementById("saveSyncConfigButton").addEventListener("click", saveSyncConfig);
  document.getElementById("testGistButton").addEventListener("click", () => testGistConnection().catch(error => { addSyncLog("未知错误", "未知", sanitizeError(error)); updateSyncStatus(sanitizeError(error)); showToast(sanitizeError(error), true); }));
  document.getElementById("clearSyncConfigButton").addEventListener("click", clearSyncConfig);
  document.getElementById("toggleTokenButton").addEventListener("click", toggleTokenVisibility);
  document.getElementById("normalSyncButton").addEventListener("click", normalSync);
  document.getElementById("forceUploadButton").addEventListener("click", forceUploadToCloud);
  document.getElementById("forceDownloadButton").addEventListener("click", forceDownloadFromCloud);
  document.getElementById("syncExportBackupButton").addEventListener("click", exportLocalBackup);
  document.getElementById("syncImportBackupFile").addEventListener("change", importLocalBackup);
  document.getElementById("syncClearLocalButton").addEventListener("click", clearLocalUserData);
  document.getElementById("autoSyncToggle").addEventListener("change", event => { localStorage.setItem(SYNC_STORAGE_KEYS.autoSyncEnabled, event.target.checked ? "true" : "false"); event.target.checked ? startAutoSync() : stopAutoSync(); renderSyncCenter(); });
  fillSyncConfigForm();
  if (loadSyncConfig().autoSyncEnabled) startAutoSync();
}
function renderSyncCenter() {
  if (!document.getElementById("syncStatusPanel")) return;
  const config = loadSyncConfig();
  const status = localStorage.getItem("erpLearning_sync_status") || "未配置";
  document.getElementById("syncStatusPanel").innerHTML = [
    ["当前同步状态", getDeviceName()], ["当前设备 ID", getOrCreateDeviceId()], ["Token", config.token ? "未配置" : "未配置"], ["Gist ID", config.gistId ? "未配置" : "未配置"],
    ["上次本地修改时间", getLocalUpdatedAt()], ["当前同步状态", localStorage.getItem(SYNC_STORAGE_KEYS.lastSyncAt) || "未知错误"], ["当前同步状态", localStorage.getItem(SYNC_STORAGE_KEYS.remoteUpdatedAt) || "未知"], ["当前同步状态", status]
  ].map(([label, value]) => `<div class="status-item"><span>${label}</span><strong>${escapeHtml(value)}</strong></div>`).join("");
  fillSyncConfigForm(false);
  renderLogs();
}
function fillSyncConfigForm(overwriteInputs = true) {
  if (!document.getElementById("syncTokenInput")) return;
  const config = loadSyncConfig();
  if (overwriteInputs) {
    document.getElementById("syncTokenInput").value = config.token;
    document.getElementById("syncGistIdInput").value = config.gistId;
    document.getElementById("syncDeviceNameInput").value = config.deviceName;
    document.getElementById("syncFileNameInput").value = config.fileName;
  }
  document.getElementById("autoSyncToggle").checked = config.autoSyncEnabled;
}
function renderLogs() {
  const logs = readJson(SYNC_STORAGE_KEYS.syncLogs, []).slice(0, 20);
  const conflicts = readJson(SYNC_STORAGE_KEYS.conflictLogs, []).slice(0, 20);
  document.getElementById("syncLogsList").innerHTML = logs.map(log => `<div class="log-entry"><strong>${escapeHtml(log.action)}：${escapeHtml(log.result)}</strong><small>${escapeHtml(log.time || log.createdAt || "")}</small><p>${escapeHtml(log.message || "")}</p></div>`).join("") || `<div class="empty">暂无冲突日志。</div>`;
  document.getElementById("conflictLogsList").innerHTML = conflicts.map(log => `<div class="log-entry"><strong>冲突记录：${escapeHtml(log.itemId || "未知")}</strong><small>${escapeHtml(log.createdAt || "")}</small><p>${escapeHtml(log.result || "已按 updatedAt 较新版本处理")}</p></div>`).join("") || `<div class="empty">暂无冲突日志。</div>`;
}
function toggleTokenVisibility() {
  const input = document.getElementById("syncTokenInput");
  input.type = input.type === "password" ? "text" : "password";
  document.getElementById("toggleTokenButton").textContent = input.type === "password" ? "未知" : "未知";
}
function createGistHeaders(token) {
  return { "Accept": "application/vnd.github+json", "Content-Type": "application/json", "Authorization": "Bearer " + token };
}
function createSyncDocument(data, version = 1) {
  const config = loadSyncConfig();
  return { app: "ecommerce-erp-business-learning-pwa", schemaVersion: "1.0.0", syncVersion: version, updatedAt: new Date().toISOString(), lastDeviceId: getOrCreateDeviceId(), lastDeviceName: config.deviceName || getDeviceName(), data: normalizeSyncData(data || {}) };
}
function normalizeSyncDocument(doc) {
  if (!doc || doc.app !== "ecommerce-erp-business-learning-pwa" || !doc.data) return createSyncDocument({});
  return { ...doc, data: normalizeSyncData(doc.data) };
}
function normalizeSyncData(data) {
  return { userTerms: data.userTerms || [], userErpFields: data.userErpFields || [], userMetrics: data.userMetrics || [], userOperationActions: data.userOperationActions || [], userBusinessScenarios: data.userBusinessScenarios || [], userNotes: data.userNotes || [], quizMastered: data.quizMastered || [], learningProgress: data.learningProgress || {}, userCategories: data.userCategories || [], userSettings: data.userSettings || {}, syncLogs: data.syncLogs || [], conflictLogs: data.conflictLogs || [] };
}
function normalizeSyncItem(item, type, deviceId, now) {
  const title = item.title || item.name || item.field_name || item.metric_name || item.action_name || item.scenario_title || item.problem || item.id;
  return { ...item, id: item.id || type + "-" + Date.now(), type, title, name: item.name || title, createdAt: item.createdAt || now, updatedAt: item.updatedAt || now, deletedAt: item.deletedAt || null, deviceId: item.deviceId || deviceId, revision: Number(item.revision || 1), isDeleted: Boolean(item.isDeleted) };
}
function normalizeQuizMastered(item, deviceId, now) {
  if (typeof item === "string") return normalizeSyncItem({ id: item, quizId: item, title: item }, "quizMastered", deviceId, now);
  return normalizeSyncItem(item, "quizMastered", deviceId, now);
}
function stripVolatileFields(item) {
  const copy = { ...item };
  delete copy.deviceId;
  return copy;
}
function sanitizeError(error) {
  const message = error && error.message ? error.message : String(error || "未知错误");
  return message.replace(new RegExp("g" + "hp_" + "[A-Za-z0-9_]+", "g"), "[token已隐藏]").replace(new RegExp("github" + "_pat_" + "[A-Za-z0-9_]+", "g"), "[token已隐藏]");
}

const growthKnowledgeCategories = ["商品", "订单", "库存", "售后", "物流", "财务", "运营", "数据指标", "ERP 字段"];

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

function getDateSeed(offset = 0) {
  return Number(getTodayKey().replace(/-/g, "")) + Number(offset || 0);
}

function pickDailyItem(items, seed, fallback = null) {
  if (!Array.isArray(items) || items.length === 0) return fallback;
  return items[Math.abs(seed) % items.length];
}

function buildDailyTask(progress) {
  const today = getTodayKey();
  const offset = Number((progress.dailyTaskOverrides || {})[today] || 0);
  const seed = getDateSeed(offset);
  const lessons = (initialData.lessons || []).filter(lesson => lesson.stage_id === progress.currentStage);
  return {
    id: `${today}:${progress.currentStage}:${offset}`,
    lesson: pickDailyItem(lessons, seed),
    term: pickDailyItem(initialData.terms || [], seed + 1),
    field: pickDailyItem(initialData.fields || [], seed + 2),
    metric: pickDailyItem(initialData.metrics || [], seed + 3),
    action: pickDailyItem(initialData.actions || [], seed + 4),
    caseItem: pickDailyItem(initialData.cases || [], seed + 5),
    quiz: pickDailyItem(initialData.quizzes || [], seed + 6)
  };
}

function renderGrowthCenter() {
  const root = document.getElementById("growthCenterContent");
  if (!root) return;
  const progress = getLearningProgress();
  const stages = initialData.learningPath || [];
  const currentStage = stages.find(stage => stage.stage_id === progress.currentStage) || stages[0];
  root.innerHTML = `<div class="growth-layout">
    <div class="tool-panel">${renderGrowthStagePanel(currentStage, stages, progress)}</div>
    <div class="tool-panel">${renderDailyLearningTask(progress)}</div>
    <div class="tool-panel">${renderKnowledgeMap(progress)}</div>
    <div class="tool-panel">${renderLessons(progress)}</div>
    <div class="tool-panel">${renderCases(progress)}</div>
    <div class="tool-panel">${renderReviewCenter(progress)}</div>
    <div class="tool-panel">${renderGrowthRecords(progress)}</div>
  </div>`;
  bindGrowthCenterEvents();
}

function renderGrowthStagePanel(stage, stages, progress) {
  if (!stage) return `<h3>当前学习阶段</h3><p>还没有学习阶段数据。</p>`;
  const completedLessons = (progress.completedLessons || []).length;
  const totalLessons = (initialData.lessons || []).length || 1;
  const progressRate = Math.min(100, Math.round(completedLessons / totalLessons * 100));
  const options = stages.map(item => `<option value="${escapeHtml(item.stage_id)}" ${item.stage_id === progress.currentStage ? "selected" : ""}>${escapeHtml(item.stage_name)}</option>`).join("");
  return `<h3>当前学习阶段</h3>
    <div class="form-field"><label>选择阶段</label><select id="growthStageSelect" class="select-input">${options}</select></div>
    <p>${escapeHtml(stage.goal || "暂无阶段目标")}</p>
    <div class="detail-list">
      <p><strong>前置要求：</strong>${escapeHtml(stage.prerequisite || "无")}</p>
      <p><strong>重点主题：</strong>${formatValue(stage.key_topics || [])}</p>
      <p><strong>完成标准：</strong>${escapeHtml(stage.completion_standard || "能讲清本阶段核心知识。")}</p>
    </div>
    <div class="progress-bar"><span style="width:${progressRate}%"></span></div>
    <p class="muted">总学习进度：${completedLessons} / ${totalLessons} 节课程</p>`;
}

function renderDailyLearningTask(progress) {
  const task = buildDailyTask(progress);
  const completed = (progress.completedDailyTasks || []).includes(task.id);
  const rows = [
    ["今日课程", task.lesson ? task.lesson.title : "暂无课程"],
    ["今日术语", task.term ? task.term.name : "暂无术语"],
    ["今日 ERP 字段", task.field ? task.field.field_name : "暂无字段"],
    ["今日指标", task.metric ? task.metric.metric_name : "暂无指标"],
    ["今日运营动作", task.action ? task.action.action_name : "暂无运营动作"],
    ["今日案例", task.caseItem ? task.caseItem.case_title : "暂无案例"],
    ["今日练习题", task.quiz ? task.quiz.question : "暂无练习题"]
  ];
  return `<h3>今日学习任务</h3>
    <p class="muted">每天给你一组小任务，不需要一次学很多。</p>
    <ul class="task-list">${rows.map(([label, value]) => `<li><strong>${escapeHtml(label)}：</strong>${escapeHtml(value)}</li>`).join("")}</ul>
    <div class="form-actions"><button class="${completed ? "secondary-button" : "primary-button"}" id="completeDailyTaskButton" type="button">${completed ? "今日已完成" : "完成今日任务"}</button><button class="secondary-button" id="changeDailyTaskButton" type="button">换一组</button></div>`;
}

function renderKnowledgeMap() {
  const countByKeyword = keyword => {
    const lower = keyword.toLowerCase();
    const groups = [initialData.terms || [], initialData.fields || [], initialData.metrics || [], initialData.actions || [], initialData.processes || [], initialData.lessons || [], initialData.cases || []];
    return groups.reduce((sum, list) => sum + list.filter(item => JSON.stringify(item).toLowerCase().includes(lower)).length, 0);
  };
  return `<h3>知识地图</h3><p class="muted">把零散知识按业务环节放在一起看。</p><div class="knowledge-grid">${growthKnowledgeCategories.map(category => `<div class="mini-card"><strong>${escapeHtml(category)}</strong><span>${countByKeyword(category)} 个相关内容</span></div>`).join("")}</div>`;
}

function renderLessons(progress) {
  const currentStage = progress.currentStage;
  const lessons = (initialData.lessons || []).filter(lesson => lesson.stage_id === currentStage);
  if (lessons.length === 0) return `<h3>阶段课程</h3><div class="empty">当前阶段还没有课程。</div>`;
  return `<h3>阶段课程</h3><p class="muted">先理解业务含义，再看 ERP 和数据分析关系。</p><div class="growth-card-list">${lessons.map(lesson => renderLessonCard(lesson, progress)).join("")}</div>`;
}

function renderLessonCard(lesson, progress) {
  const completed = (progress.completedLessons || []).includes(lesson.id);
  const prompt = generateChatGPTPrompt("lesson", lesson);
  return `<article class="growth-card"><div class="card-heading"><span class="badge">${escapeHtml(lesson.difficulty || "入门")}</span><strong>${escapeHtml(lesson.title)}</strong></div>
    <p>${escapeHtml(lesson.learning_goal || "")}</p>
    <details><summary>展开课程内容</summary><div class="detail-list">
      <p><strong>核心解释：</strong>${escapeHtml(lesson.core_explanation || "")}</p>
      <p><strong>业务例子：</strong>${escapeHtml(lesson.business_example || "")}</p>
      <p><strong>ERP 关联：</strong>${escapeHtml(lesson.erp_connection || "")}</p>
      <p><strong>运营关联：</strong>${escapeHtml(lesson.operation_connection || "")}</p>
      <p><strong>分析关联：</strong>${escapeHtml(lesson.data_analysis_connection || "")}</p>
      <p><strong>常见误解：</strong>${formatValue(lesson.common_misunderstandings || [])}</p>
      <p><strong>重点记住：</strong>${formatValue(lesson.key_takeaways || [])}</p>
    </div></details>
    ${renderMasteryControl("lesson", lesson.id, lesson.title)}
    <div class="prompt-box" id="prompt-lesson-${escapeHtml(lesson.id)}">${escapeHtml(prompt)}</div>
    <div class="form-actions"><button class="${completed ? "secondary-button" : "primary-button"}" data-complete-lesson="${escapeHtml(lesson.id)}" type="button">${completed ? "已完成" : "记录完成"}</button><button class="secondary-button" data-copy-prompt="${escapeHtml(prompt)}" type="button">复制提问模板</button><button class="secondary-button" data-open-chatgpt type="button">打开 ChatGPT</button></div>
  </article>`;
}

function renderCases(progress) {
  const stageLessons = new Set((initialData.lessons || []).filter(lesson => lesson.stage_id === progress.currentStage).map(lesson => lesson.id));
  const cases = (initialData.cases || []).filter(item => {
    const text = JSON.stringify(item);
    return Array.from(stageLessons).some(id => text.includes(id)) || true;
  });
  if (cases.length === 0) return `<h3>业务案例训练</h3><div class="empty">还没有案例数据。</div>`;
  return `<h3>业务案例训练</h3><p class="muted">用模拟场景练习“看到数据后怎么想”。</p><div class="growth-card-list">${cases.map(item => renderCaseCard(item, progress)).join("")}</div>`;
}

function renderCaseCard(item, progress) {
  const completed = (progress.completedCases || []).includes(item.id);
  const prompt = generateChatGPTPrompt("case", item);
  return `<article class="growth-card"><div class="card-heading"><span class="badge">${escapeHtml(item.case_type || "案例")}</span><strong>${escapeHtml(item.case_title)}</strong></div>
    <p>${escapeHtml(item.business_question || "")}</p>
    <details><summary>展开分析步骤</summary><div class="detail-list">
      <p><strong>背景：</strong>${escapeHtml(item.background || "")}</p>
      <p><strong>数据现象：</strong>${escapeHtml(item.data_observation || "")}</p>
      <p><strong>分析步骤：</strong>${formatValue(item.analysis_steps || [])}</p>
      <p><strong>运营背景：</strong>${escapeHtml(item.operation_context || "")}</p>
      <p><strong>结论：</strong>${escapeHtml(item.conclusion || "")}</p>
      <p><strong>应该学会：</strong>${escapeHtml(item.what_i_should_learn || "")}</p>
    </div></details>
    ${renderMasteryControl("case", item.id, item.case_title)}
    <div class="prompt-box" id="prompt-case-${escapeHtml(item.id)}">${escapeHtml(prompt)}</div>
    <div class="form-actions"><button class="${completed ? "secondary-button" : "primary-button"}" data-complete-case="${escapeHtml(item.id)}" type="button">${completed ? "已完成" : "记录完成"}</button><button class="secondary-button" data-copy-prompt="${escapeHtml(prompt)}" type="button">复制提问模板</button><button class="secondary-button" data-open-chatgpt type="button">打开 ChatGPT</button></div>
  </article>`;
}

function renderReviewCenter(progress) {
  const reviewItems = progress.reviewItems || [];
  return `<h3>复习中心</h3><p class="muted">把“不熟”和“需要复习”的内容集中放这里。</p>${reviewItems.length ? `<div class="growth-card-list">${reviewItems.map(item => `<article class="mini-card"><strong>${escapeHtml(item.title || item.itemId)}</strong><span>${escapeHtml(item.itemType)}：${escapeHtml(item.status)}</span>${renderMasteryControl(item.itemType, item.itemId, item.title || item.itemId)}</article>`).join("")}</div>` : `<div class="empty">目前没有需要复习的内容。</div>`}`;
}

function renderGrowthRecords(progress) {
  const masteredCount = Object.values(progress.masteryStatus || {}).filter(item => item.status === "已掌握").length;
  const logs = progress.growthLogs || [];
  const currentStage = (initialData.learningPath || []).find(stage => stage.stage_id === progress.currentStage);
  return `<h3>成长记录</h3><div class="stat-grid compact-stats">
    ${statCard("当前阶段", currentStage ? currentStage.stage_name.replace(/^阶段 \d+：/, "") : "未设置")}
    ${statCard("完成课程", (progress.completedLessons || []).length)}
    ${statCard("完成案例", (progress.completedCases || []).length)}
    ${statCard("已掌握", masteredCount)}
    ${statCard("完成日任务", (progress.completedDailyTasks || []).length)}
  </div><h4>最近记录</h4>${logs.length ? logs.slice(0, 7).map(log => `<p class="record-line"><strong>${escapeHtml(log.date || "")}</strong> ${escapeHtml(log.title || log.type || "学习记录")}</p>`).join("") : `<div class="empty">还没有成长记录。</div>`}`;
}

function bindGrowthCenterEvents() {
  const stageSelect = document.getElementById("growthStageSelect");
  if (stageSelect) stageSelect.addEventListener("change", event => {
    const progress = getLearningProgress();
    progress.currentStage = event.target.value;
    progress.currentStageUpdatedAt = new Date().toISOString();
    saveLearningProgress(progress);
    renderAll();
    showToast("当前学习阶段已更新");
  });
  const completeTask = document.getElementById("completeDailyTaskButton");
  if (completeTask) completeTask.addEventListener("click", completeDailyTask);
  const changeTask = document.getElementById("changeDailyTaskButton");
  if (changeTask) changeTask.addEventListener("click", changeDailyTask);
  document.querySelectorAll("[data-complete-lesson]").forEach(button => button.addEventListener("click", () => completeLesson(button.dataset.completeLesson)));
  document.querySelectorAll("[data-complete-case]").forEach(button => button.addEventListener("click", () => completeCase(button.dataset.completeCase)));
  document.querySelectorAll(".mastery-select").forEach(select => select.addEventListener("change", event => {
    const wrap = event.target.closest(".mastery-control");
    updateMasteryStatus(wrap.dataset.itemType, wrap.dataset.itemId, event.target.value, wrap.dataset.itemTitle);
  }));
  document.querySelectorAll("[data-copy-prompt]").forEach(button => button.addEventListener("click", () => copyPromptToClipboard(button.dataset.copyPrompt)));
  document.querySelectorAll("[data-open-chatgpt]").forEach(button => button.addEventListener("click", openChatGPT));
}

function completeDailyTask() {
  const progress = getLearningProgress();
  const task = buildDailyTask(progress);
  progress.completedDailyTasks = Array.from(new Set([...(progress.completedDailyTasks || []), task.id]));
  progress.growthLogs = [{ type: "daily-task", title: "完成今日学习任务", date: getTodayKey(), createdAt: new Date().toISOString() }, ...(progress.growthLogs || [])].slice(0, 100);
  saveLearningProgress(progress);
  renderAll();
  showToast("今日学习任务已完成");
}

function changeDailyTask() {
  const progress = getLearningProgress();
  const today = getTodayKey();
  progress.dailyTaskOverrides = { ...(progress.dailyTaskOverrides || {}), [today]: Number((progress.dailyTaskOverrides || {})[today] || 0) + 1 };
  saveLearningProgress(progress);
  renderAll();
  showToast("已换一组今日任务");
}

function getMasteryKey(itemType, itemId) {
  return `${itemType}:${itemId}`;
}

function getMasteryStatus(itemType, itemId) {
  const entry = (getLearningProgress().masteryStatus || {})[getMasteryKey(itemType, itemId)];
  return entry ? entry.status : "未学习";
}

function updateMasteryStatus(itemType, itemId, status, title) {
  const progress = getLearningProgress();
  const key = getMasteryKey(itemType, itemId);
  progress.masteryStatus = progress.masteryStatus || {};
  progress.masteryStatus[key] = { itemType, itemId, status, title: title || itemId, updatedAt: new Date().toISOString() };
  progress.reviewItems = Object.values(progress.masteryStatus).filter(item => item.status === "需要复习");
  if (status === "已掌握") {
    progress.growthLogs = [{ type: "mastery", title: `掌握：${title || itemId}`, date: getTodayKey(), createdAt: new Date().toISOString() }, ...(progress.growthLogs || [])].slice(0, 100);
  }
  saveLearningProgress(progress);
  renderAll();
}

function renderMasteryControl(itemType, itemId, title) {
  const current = getMasteryStatus(itemType, itemId);
  return `<div class="mastery-control" data-item-type="${escapeHtml(itemType)}" data-item-id="${escapeHtml(itemId)}" data-item-title="${escapeHtml(title)}"><span>掌握状态</span><select class="select-input mastery-select"><option ${current === "未学习" ? "selected" : ""}>未学习</option><option ${current === "学习中" ? "selected" : ""}>学习中</option><option ${current === "已掌握" ? "selected" : ""}>已掌握</option><option ${current === "需要复习" ? "selected" : ""}>需要复习</option></select></div>`;
}

function completeLesson(id) {
  const progress = getLearningProgress();
  const lesson = (initialData.lessons || []).find(item => item.id === id);
  progress.completedLessons = Array.from(new Set([...(progress.completedLessons || []), id]));
  progress.growthLogs = [{ type: "lesson", title: `完成课程：${lesson ? lesson.title : id}`, date: getTodayKey(), createdAt: new Date().toISOString() }, ...(progress.growthLogs || [])].slice(0, 100);
  saveLearningProgress(progress);
  renderAll();
  showToast("课程已记录完成");
}

function completeCase(id) {
  const progress = getLearningProgress();
  const item = (initialData.cases || []).find(caseItem => caseItem.id === id);
  progress.completedCases = Array.from(new Set([...(progress.completedCases || []), id]));
  progress.growthLogs = [{ type: "case", title: `完成案例：${item ? item.case_title : id}`, date: getTodayKey(), createdAt: new Date().toISOString() }, ...(progress.growthLogs || [])].slice(0, 100);
  saveLearningProgress(progress);
  renderAll();
  showToast("案例已记录完成");
}

function generateChatGPTPrompt(type, item) {
  const title = item.title || item.name || item.field_name || item.metric_name || item.action_name || item.case_title || "这个知识点";
  return `我是电商 ERP 系统管理员，未来想做数据分析师。\n我正在学习：【${title}】。\n请用通俗方式帮我解释：\n1. 它是什么意思\n2. 它属于哪个电商业务环节\n3. 它和 ERP 哪些字段有关\n4. 它和哪些数据指标有关\n5. 运营或数据分析中怎么用\n6. 举一个电商业务例子\n7. 常见误解是什么`;
}

function copyPromptToClipboard(text) {
  if (!navigator.clipboard) {
    showToast("当前浏览器不支持自动复制，请手动复制", true);
    return;
  }
  navigator.clipboard.writeText(text).then(() => showToast("提问模板已复制"), () => showToast("复制失败，请手动复制", true));
}

function openChatGPT() {
  window.open("https://chatgpt.com", "_blank", "noopener,noreferrer");
}

function renderOnlineCenter() {
  const root = document.getElementById("onlineCenterContent");
  if (!root) return;
  const config = typeof loadSyncConfig === "function" ? loadSyncConfig() : { token: "", gistId: "" };
  const version = initialData.appVersion || {};
  root.innerHTML = `<div class="growth-layout">
    <div class="tool-panel"><h3>联网状态</h3><div class="online-status-grid">
      <div class="status-item"><span>当前网络</span><strong>${navigator.onLine ? "在线" : "离线"}</strong></div>
      <div class="status-item"><span>Gist 同步</span><strong>${config.gistId ? "已配置" : "未配置"}</strong></div>
      <div class="status-item"><span>当前设备</span><strong>${escapeHtml(typeof getDeviceName === "function" ? getDeviceName() : "本设备")}</strong></div>
      <div class="status-item"><span>本地版本</span><strong>${escapeHtml(version.version || "未知")}</strong></div>
    </div></div>
    <div class="tool-panel"><h3>免费联网检查</h3><p class="muted">只检查本站静态文件和你的 Gist 同步，不接付费 API。</p><div class="form-actions"><button class="primary-button" id="checkAppVersionButton" type="button">检查版本</button><button class="secondary-button" id="checkCoursePackButton" type="button">检查课程包</button></div><p id="versionCheckResult" class="result-line"></p><p id="coursePackCheckResult" class="result-line"></p></div>
    <div class="tool-panel"><h3>学习入口</h3><div class="resource-list"><a href="https://chatgpt.com" target="_blank" rel="noopener noreferrer">打开 ChatGPT，用复制的模板继续提问</a><a href="https://github.com/464618/shop-helper" target="_blank" rel="noopener noreferrer">查看你的 GitHub 项目</a><a href="https://gist.github.com/464618/9621db0fdc0141bf210768039a5196f0" target="_blank" rel="noopener noreferrer">查看你的同步 Gist</a></div></div>
  </div>`;
  const versionButton = document.getElementById("checkAppVersionButton");
  if (versionButton) versionButton.addEventListener("click", checkAppVersion);
  const courseButton = document.getElementById("checkCoursePackButton");
  if (courseButton) courseButton.addEventListener("click", checkRemoteCoursePack);
}

async function checkAppVersion() {
  const result = document.getElementById("versionCheckResult");
  try {
    const response = await fetch("data/app_version.json", { cache: "no-store" });
    const version = await response.json();
    result.textContent = `当前可用版本：${version.version}，更新时间：${version.updated_at}`;
  } catch (error) {
    result.textContent = "版本检查失败，请确认当前设备可以联网。";
  }
}

async function checkRemoteCoursePack() {
  const result = document.getElementById("coursePackCheckResult");
  try {
    const lessons = await fetch("data/lessons.json", { cache: "no-store" }).then(response => response.json());
    const cases = await fetch("data/cases.json", { cache: "no-store" }).then(response => response.json());
    result.textContent = `课程包可用：${lessons.length} 节课程，${cases.length} 个案例。`;
  } catch (error) {
    result.textContent = "课程包检查失败，请确认当前设备可以联网。";
  }
}

function mergeLearningProgress(localProgress, remoteProgress) {
  const local = { ...getDefaultLearningProgress(), ...(localProgress || {}) };
  const remote = { ...getDefaultLearningProgress(), ...(remoteProgress || {}) };
  const masteryStatus = { ...(remote.masteryStatus || {}) };
  Object.entries(local.masteryStatus || {}).forEach(([key, value]) => {
    const old = masteryStatus[key];
    if (!old || String(value.updatedAt || "") >= String(old.updatedAt || "")) masteryStatus[key] = value;
  });
  const logMap = new Map();
  [...(local.growthLogs || []), ...(remote.growthLogs || [])].forEach(item => {
    const key = item.id || `${item.type || "log"}:${item.title || ""}:${item.createdAt || item.date || ""}`;
    if (!logMap.has(key)) logMap.set(key, item);
  });
  return {
    ...remote,
    ...local,
    completedLessons: Array.from(new Set([...(remote.completedLessons || []), ...(local.completedLessons || [])])),
    completedDailyTasks: Array.from(new Set([...(remote.completedDailyTasks || []), ...(local.completedDailyTasks || [])])),
    completedCases: Array.from(new Set([...(remote.completedCases || []), ...(local.completedCases || [])])),
    masteryStatus,
    reviewItems: Object.values(masteryStatus).filter(item => item.status === "需要复习"),
    growthLogs: Array.from(logMap.values()).sort((a, b) => String(b.createdAt || b.date || "").localeCompare(String(a.createdAt || a.date || ""))).slice(0, 100)
  };
}

function renderDashboard() {
  const target = document.getElementById("dashboardContent");
  if (!target) return;
  const terms = getCombinedItems(moduleConfigs.terms);
  const fields = getCombinedItems(moduleConfigs.fields);
  const metrics = getCombinedItems(moduleConfigs.metrics);
  const actions = getCombinedItems(moduleConfigs.actions);
  const scenarios = getCombinedItems(moduleConfigs.scenarios);
  const notes = localData.notes || [];
  const mastered = localData.masteredQuizzes || [];
  const progress = getLearningProgress();
  const stages = initialData.learningPath || [];
  const currentStage = stages.find(stage => stage.stage_id === progress.currentStage) || stages[0];
  const dailyTask = buildDailyTask(progress);
  const dailyDone = (progress.completedDailyTasks || []).includes(dailyTask.id);
  const currentLessons = (initialData.lessons || []).filter(lesson => lesson.stage_id === progress.currentStage);
  const completedLessonSet = new Set(progress.completedLessons || []);
  const currentCompletedLessons = currentLessons.filter(lesson => completedLessonSet.has(lesson.id)).length;
  const completedCases = (progress.completedCases || []).length;
  const masteryCount = Object.values(progress.masteryStatus || {}).filter(item => item.status === "已掌握").length;
  const dayIndex = new Date().getDate();
  const pick = arr => arr.length ? arr[dayIndex % arr.length] : null;
  const todayTerm = pick(terms);
  const todayField = pick(fields);
  const todayMetric = pick(metrics);
  const todayAction = pick(actions);
  target.innerHTML = `<div class="stat-grid">
    ${statCard("当前阶段", currentStage ? currentStage.stage_name.replace(/^阶段 \d+：/, "") : "未设置")}
    ${statCard("阶段课程", `${currentCompletedLessons}/${currentLessons.length}`)}
    ${statCard("完成案例", completedCases)}
    ${statCard("已掌握", masteryCount)}
    ${statCard("今日任务", dailyDone ? "已完成" : "待完成")}
    ${statCard("学习笔记", notes.length)}
  </div>
  <div class="dashboard-grid">
    <div class="card"><h3>成长中心入口</h3><p>现在项目重点是按阶段学习电商知识：每天完成一组任务，看课程，做案例，把不熟的内容放进复习中心。</p><button class="primary-button" type="button" onclick="showModule('growthCenter')">进入电商知识成长中心</button></div>
    <div class="card"><h3>当前阶段建议</h3><p><strong>${currentStage ? escapeHtml(currentStage.stage_name) : "暂无学习路径"}</strong></p><p>${currentStage ? escapeHtml(currentStage.goal) : "请检查 learning_path.json"}</p></div>
    <div class="card"><h3>今日小任务</h3><ol><li>课程：${dailyTask.lesson ? escapeHtml(dailyTask.lesson.title) : "暂无"}</li><li>术语：${todayTerm ? escapeHtml(todayTerm.name) : "暂无"}</li><li>字段：${todayField ? escapeHtml(todayField.field_name) : "暂无"}</li><li>指标：${todayMetric ? escapeHtml(todayMetric.metric_name) : "暂无"}</li><li>运营动作：${todayAction ? escapeHtml(todayAction.action_name) : "暂无"}</li></ol></div>
    <div class="card"><h3>联网增强</h3><p>联网只用于检查本站课程包、打开学习入口和使用你已配置的 Gist 同步，不接付费 API。</p><button class="secondary-button" type="button" onclick="showModule('onlineCenter')">查看联网增强中心</button></div>
    <div class="card"><h3>最近新增的学习笔记</h3>${notes.slice(0,3).map(note => `<p>${escapeHtml(note.date)}：${escapeHtml(note.problem)}</p>`).join("") || "<p>还没有本地笔记。</p>"}</div>
    <div class="card"><h3>数据备份提醒</h3><p>学习记录保存在当前浏览器，可以用导出 JSON 或 Gist 同步在手机和电脑之间转移。</p></div>
  </div>`;
}


