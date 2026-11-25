const MAIN_STYLES = {decimal:"1.",question:"Q1.",parenthesized:"(1)",roman:"I.",letters:"A."};
const PART_STYLES = {lower:"(a)",roman:"(i)",numeric:"(1)",upper:"(A)"};
const HEAD_FIELDS = {inst:"Institution",exam:"Examination",paper:"Paper or subject",time:"Time",full:"Full marks override",instr:"Instructions"};
const roman = value => {
  let result = "";
  for (const [count,letter] of [[1000,"M"],[900,"CM"],[500,"D"],[400,"CD"],[100,"C"],[90,"XC"],[50,"L"],[40,"XL"],[10,"X"],[9,"IX"],[5,"V"],[4,"IV"],[1,"I"]]) {
    while (value >= count) { result += letter; value -= count; }
  }
  return result;
};
function letters(i) {
  let label = "";
  for (; i > 0; i = Math.floor((i - 1) / 26)) label = String.fromCharCode(65 + (i - 1) % 26) + label;
  return label;
}
const number = (i,style) => ({decimal:i+".",question:"Q"+i+".",parenthesized:"("+i+")",roman:roman(i)+".",letters:letters(i)+"."})[style];
const subnumber = (i,style) => "(" + ({lower:letters(i).toLowerCase(),roman:roman(i).toLowerCase(),numeric:i,upper:letters(i)})[style] + ")";
const format = n => new Intl.NumberFormat("en",{maximumFractionDigits:8,useGrouping:false}).format(n);

export function restoreLayout(saved, questions) {
  const byId = new Map(questions.map(q => [q.id,q]));
  const seen = new Set(), groupIds = new Set();
  const used = Array.isArray(saved?.groups) ? saved.groups : [];
  let next = Number.isSafeInteger(saved?.next) && saved.next > 0 ? saved.next : 1;
  const groups = [];
  for (const group of used) {
    if (!group || typeof group.id !== "string" || groupIds.has(group.id) || !Array.isArray(group.parts)) continue;
    groupIds.add(group.id);
    const parts = [];
    for (const part of group.parts) {
      if (!part || !byId.has(part.id) || seen.has(part.id)) continue;
      seen.add(part.id);
      parts.push({id:part.id,marks:part.marks === null || (Number.isFinite(part.marks) && part.marks >= 0) ? part.marks : byId.get(part.id).marks ?? null});
    }
    if (parts.length) groups.push({id:group.id,section:typeof group.section === "string" ? group.section : "",parts});
  }
  for (const q of questions) {
    if (seen.has(q.id)) continue;
    while (groupIds.has("g"+next)) next++;
    groups.push({id:"g"+next++,section:"",parts:[{id:q.id,marks:q.marks ?? null}]});
  }
  return {groups,next,main:Object.hasOwn(MAIN_STYLES,saved?.main) ? saved.main : "decimal",
    part:Object.hasOwn(PART_STYLES,saved?.part) ? saved.part : "lower", restart:Boolean(saved?.restart)};
}

export function move(layout, source, target) {
  const sourceIndex = layout.groups.findIndex(g => g.id === source.group);
  const targetIndex = layout.groups.findIndex(g => g.id === target.group);
  if (sourceIndex < 0) return false;
  const from = layout.groups[sourceIndex], to = layout.groups[targetIndex];
  if (!source.part) {
    if (!to || from === to) return false;
    layout.groups.splice(sourceIndex,1);
    layout.groups.splice(layout.groups.indexOf(to) + Number(Boolean(target.after)),0,from);
    return true;
  }
  const partIndex = from.parts.findIndex(p => p.id === source.part);
  if (partIndex < 0 || source.part === target.part) return false;
  if (!to && !target.newGroup) return false;
  if (target.part && !to.parts.some(p => p.id === target.part)) return false;
  if (!to && from.parts.length === 1) return false;
  const [part] = from.parts.splice(partIndex,1);
  if (to) {
    const at = target.part ? to.parts.findIndex(p => p.id === target.part) + Number(Boolean(target.after)) : to.parts.length;
    to.parts.splice(at,0,part);
    if (!from.parts.length) {
      if (from.section && !to.section) to.section = from.section;
      layout.groups.splice(layout.groups.indexOf(from),1);
    }
  } else {
    while (layout.groups.some(g => g.id === "g"+layout.next)) layout.next++;
    layout.groups.splice(sourceIndex+1,0,{id:"g"+layout.next++,section:"",parts:[part]});
  }
  return true;
}

export function paperRows(layout) {
  let n = 0, sectionName = "";
  return layout.groups.map(group => {
    if (group.section.trim()) {
      sectionName = group.section.trim();
      if (layout.restart) n = 0;
    }
    return {...group,sectionName,label:number(++n,layout.main),parts:group.parts.map((part,i) =>
      ({...part,label:group.parts.length > 1 ? subnumber(i+1,layout.part) : ""}))};
  });
}

export function paperTotal(layout) {
  return layout.groups.reduce((sum,g) => sum + g.parts.reduce((s,p) => s+(p.marks ?? 0),0),0);
}

const TEX_ESCAPES = {"\\":"\\textbackslash{}","{":"\\{","}":"\\}","%":"\\%","$":"\\$","&":"\\&","#":"\\#","_":"\\_","^":"\\textasciicircum{}","~":"\\textasciitilde{}"};
const texText = text => String(text ?? "").replace(/[\\{}%$&#_^~]/g,c => TEX_ESCAPES[c]);

export function studioLatex(preamble, layout, head, byId) {
  const full = head.full.trim() || (layout.groups.some(g=>g.parts.some(p=>p.marks != null)) ? format(paperTotal(layout)) : "");
  const mathSets = ["R","N","Z","Q","C"].map(letter=>"\\providecommand{\\"+letter+"}{\\mathbb{"+letter+"}}");
  const lines = [preamble,...mathSets,"\\begin{document}","\\begin{center}",
    head.inst ? "{\\large\\bfseries "+texText(head.inst)+"}\\\\[2pt]" : "",
    head.exam ? "\\textbf{"+texText(head.exam)+"}\\\\[2pt]" : "",
    head.paper ? "\\textit{"+texText(head.paper)+"}" : "",
    "\\end{center}",
    "\\noindent\\textbf{"+texText(head.time)+"}\\hfill\\textbf{"+(full?"Full Marks: "+texText(full):"")+"}\\par",
    "\\noindent\\rule{\\linewidth}{0.6pt}",
    head.instr ? "\\begin{center}\\itshape "+texText(head.instr)+"\\end{center}" : ""];
  paperRows(layout).forEach(group => {
    if (group.section.trim()) lines.push("\\par\\medskip\\noindent\\textbf{"+texText(group.section.trim())+"}\\par\\nobreak");
    group.parts.forEach((part,i) => {
      const label = [i === 0 ? group.label : "",part.label].filter(Boolean).join("\\enspace ");
      const body = byId.get(part.id).tex.trim().replace(/(?:\\hfill\s*)?\\printedmarks\{[^}]*\}/g,"");
      lines.push("\\par\\smallskip\\noindent " + (label ? "\\textbf{"+label+"}\\enspace " : "\\hspace*{2em} ") +
        body + (part.marks == null ? "" : " \\hfill ["+format(part.marks)+"]") + "\\par");
    });
  });
  lines.push("\\end{document}");
  return lines.filter(Boolean).join("\n");
}

export function mountStudio(root, api) {
  const {questions,esc,renderMath,typeset,load,save,preamble,copy,download,overleaf,openDrawer} = api;
  const byId = new Map(questions.map(q=>[q.id,q]));
  const layout = restoreLayout(load("studio-layout-v1",null),questions);
  const head = {...api.defaultHead,...load("pvhead",{})};
  const sheet = root.querySelector("#studio-sheet"), rows = root.querySelector("#studio-rows");
  const status = root.querySelector("#studio-status");
  const options = (map,val) => Object.entries(map).map(([k,v])=>'<option value="'+esc(k)+'"'+(k===val?' selected':'')+'>'+esc(v)+'</option>').join("");
  const controls = root.querySelector("#studio-settings");
  if (matchMedia("(max-width:980px)").matches) controls.closest("details").open = false;
  let dragging, dropRow;
  controls.innerHTML = Object.entries(HEAD_FIELDS).map(([key,label]) =>
    '<label>'+label+(key==="instr" ? '<textarea rows="3" data-head="'+key+'">'+esc(head[key])+'</textarea>'
      : '<input type="text" data-head="'+key+'" value="'+esc(head[key])+'"'+(key==="full"?' placeholder="Automatic total"':'')+'>')+'</label>').join("")
    +'<div class="studio-numbering"><label>Question numbering<select data-setting="main">'+options(MAIN_STYLES,layout.main)+'</select></label>'
    +'<label>Part numbering<select data-setting="part">'+options(PART_STYLES,layout.part)+'</select></label></div>'
    +'<label class="studio-checkbox"><input type="checkbox" data-setting="restart" '+(layout.restart?'checked':'')+'> Restart numbering at each section</label>';
  const persist = () => save("studio-layout-v1",layout);
  const editInput = (type, label, value, key) => '<input data-'+key+' type="'+type+'" aria-label="'+esc(label)+'" value="'+esc(value ?? "")+'"'+(type==="number"?' min="0" step="any" inputmode="decimal"':'')+'>';
  function updateHeader() {
    for (const field of sheet.querySelectorAll("[data-paper-field]")) {
      const name = field.dataset.paperField;
      if (name === "full") {
        const auto = layout.groups.some(g=>g.parts.some(p=>p.marks != null)) ? format(paperTotal(layout)) : "";
        const full = head.full.trim() || auto;
        field.textContent = full ? "Full Marks: "+full : "";
      } else field.textContent = head[name];
    }
  }

  function render() {
    const data = paperRows(layout);
    const figures = new Set(questions.flatMap(q=>q.tex.match(/assets\/competitive\/[a-f0-9]{16}\.png/g) || []));
    root.querySelector("[data-studio-figures]").hidden = !figures.size;
    root.querySelector("[data-studio-figure-links]").innerHTML = [...figures].map((url,i)=>'<a href="'+esc(api.base+url)+'" download>Figure '+(i+1)+'</a>').join(" ");
    rows.innerHTML = data.map((group, index) => {
      const label = "Question " + group.label;
      const groupChoices = data.filter(g=>g.id!==group.id).map(g=>'<option value="'+esc(g.id)+'">Question '+esc(g.label)+(g.sectionName?' · '+esc(g.sectionName):'')+'</option>').join("");
      return '<li class="studio-group" data-group="'+esc(group.id)+'">'
        +'<div class="studio-editor studio-group-tools"><button type="button" draggable="true" data-drag="group" aria-label="Drag '+esc(label)+'">⠿ '+esc(label)+'</button>'
        +'<button type="button" data-group-step="-1" aria-label="Move '+esc(label)+' up"'+(!index?' disabled':'')+'>↑</button>'
        +'<button type="button" data-group-step="1" aria-label="Move '+esc(label)+' down"'+(index===data.length-1?' disabled':'')+'>↓</button>'
        +'<label class="studio-section-field"><span class="sr">Section heading before '+esc(label)+'</span><input data-section placeholder="Section heading (optional)" maxlength="100" value="'+esc(group.section)+'"></label></div>'
        +'<div class="studio-section-title" '+(group.section.trim()?'':'hidden')+'>'+esc(group.section.trim())+'</div>'
        +'<ol class="studio-parts">'+group.parts.map((part,i)=>{
          const description = label + (part.label?" part "+part.label:"");
          return '<li class="studio-part" data-part="'+esc(part.id)+'">'
            +'<span class="studio-question-number">'+(i===0?esc(group.label):"")+'</span>'
            +'<span class="studio-part-number">'+esc(part.label)+'</span>'
            +'<div class="qbody">'+renderMath(byId.get(part.id).tex)+'</div>'
            +'<div class="studio-paper-marks">'+(part.marks == null?'':'['+format(part.marks)+']')+'</div>'
            +'<div class="studio-editor studio-part-tools"><button type="button" draggable="true" data-drag="part" aria-label="Drag '+esc(description)+'">⠿</button>'
            +'<button type="button" data-part-step="-1" aria-label="Move '+esc(description)+' up"'+(!i?' disabled':'')+'>↑</button>'
            +'<button type="button" data-part-step="1" aria-label="Move '+esc(description)+' down"'+(i===group.parts.length-1?' disabled':'')+'>↓</button>'
            +'<label><span>Marks</span>'+editInput("number","Marks for "+description,part.marks,"marks")+'</label>'
            +'<label><span class="sr">Move '+esc(description)+' to another question</span><select data-move-part><option value="">Move to…</option>'
            +groupChoices+(group.parts.length>1?'<option value="new">New question</option>':'')+'</select></label></div></li>';
        }).join("")+'</ol>'
        +'<div class="studio-editor studio-dropzone" data-drop-end>Drop a part here to add it to '+esc(label)+'</div></li>';
    }).join("");
    root.querySelector("#studio-empty").hidden = Boolean(data.length);
    root.querySelectorAll("[data-studio-export]").forEach(button=>{button.disabled=!data.length;});
    updateHeader();
    typeset(rows);
  }

  function changePosition(from,to,focus) {
    if (!move(layout,from,to)) return;
    persist();
    render();
    if (focus) {
      const item = [...rows.querySelectorAll(focus.part?"[data-part]":"[data-group]")].find(node =>
        focus.part ? node.dataset.part===focus.part : node.dataset.group===focus.group);
      item?.querySelector(focus.part?"[data-drag=part]":"[data-drag=group]")?.focus();
    }
    status.textContent = from.part ? "Question part moved." : "Question moved.";
  }
  const address = (node,part=true) => {
    const group = node.closest("[data-group]");
    return group ? {group:group.dataset.group,part:part ? node.closest("[data-part]")?.dataset.part : undefined} : null;
  };
  root.addEventListener("input",e=>{
    const input=e.target;
    if (input.dataset.head) {
      head[input.dataset.head]=input.value;
      save("pvhead",head);
      updateHeader();
    } else if (input.matches("[data-section]")) {
      const group=layout.groups.find(g=>g.id===address(input).group);
      const heading=input.closest("[data-group]").querySelector(".studio-section-title");
      const hadSection=Boolean(group.section.trim());
      group.section=input.value;
      heading.textContent=input.value.trim();
      heading.hidden=!heading.textContent;
      if (layout.restart && hadSection!==Boolean(heading.textContent)) {
        const labels=paperRows(layout).map(g=>g.label);
        rows.querySelectorAll(".studio-group").forEach((el,i)=>{el.querySelector(".studio-question-number").textContent=labels[i];});
      }
      persist();
    } else if (input.matches("[data-marks]")) {
      if (!input.validity.valid) return;
      const {group,part}=address(input);
      const item=layout.groups.find(g=>g.id===group).parts.find(p=>p.id===part);
      item.marks=input.value==="" ? null : input.valueAsNumber;
      input.closest(".studio-part").querySelector(".studio-paper-marks").textContent=item.marks==null?"":"["+format(item.marks)+"]";
      persist(); updateHeader();
    }
  });
  root.addEventListener("change",e=>{
    const input=e.target;
    if (input.dataset.setting) {
      layout[input.dataset.setting]=input.type==="checkbox"?input.checked:input.value;
      persist(); render();
    } else if (input.matches("[data-move-part]") && input.value) {
      const from=address(input);
      changePosition(from,input.value==="new"?{newGroup:true}:{group:input.value},from);
    } else if (input.matches("[data-section]")) {
      const data=paperRows(layout);
      for (const select of rows.querySelectorAll("[data-move-part]")) {
        for (const option of select.options) {
          const group=data.find(g=>g.id===option.value);
          if (group) option.textContent="Question "+group.label+(group.sectionName?" · "+group.sectionName:"");
        }
      }
    }
  });
  root.addEventListener("click",e=>{
    const button=e.target.closest("button");
    if (!button) return;
    if (button.hasAttribute("data-group-step")) {
      const from=address(button,false), step=Number(button.dataset.groupStep);
      const i=layout.groups.findIndex(g=>g.id===from.group), other=layout.groups[i+step];
      if (other) changePosition(from,{group:other.id,after:step>0},from);
    }
    if (button.hasAttribute("data-part-step")) {
      const from=address(button), step=Number(button.dataset.partStep);
      const parts=layout.groups.find(g=>g.id===from.group).parts, i=parts.findIndex(p=>p.id===from.part);
      if (parts[i+step]) changePosition(from,{group:from.group,part:parts[i+step].id,after:step>0},from);
    }
    if (button.hasAttribute("data-studio-collection")) openDrawer();
    if (button.hasAttribute("data-studio-clean")) {
      const clean=root.classList.toggle("studio-clean");
      button.textContent=clean?"Edit paper":"Clean preview";
      button.setAttribute("aria-pressed",String(clean));
    }
    const action=button.dataset.studioExport;
    if (action==="print") window.print();
    if (["copy","download","overleaf"].includes(action)) {
      const tex=studioLatex(preamble,layout,head,byId);
      if (action==="copy") copy(tex);
      if (action==="download") download("vbmath-paper.tex",tex);
      if (action==="overleaf") overleaf(tex);
    }
  });
  function clearHighlight() {
    dropRow?.classList.remove("studio-drop-before","studio-drop-after");
    dropRow=null;
  }
  rows.addEventListener("dragstart",e=>{
    const handle=e.target.closest("[data-drag]");
    if (!handle || !e.dataTransfer) return;
    dragging=address(handle,handle.dataset.drag==="part");
    e.dataTransfer.setData("text/plain",dragging.part || dragging.group);
    e.dataTransfer.effectAllowed="move";
  });
  function dropTarget(e) {
    const node=dragging?.part ? e.target.closest("[data-part],[data-drop-end]") : e.target.closest("[data-group]");
    if (!node || !dragging) return null;
    const destination=address(node,Boolean(dragging.part));
    const rect=node.getBoundingClientRect();
    const after=e.clientY>rect.top+rect.height/2;
    return {node,destination:{...destination,after}};
  }
  rows.addEventListener("dragover",e=>{
    const target=dropTarget(e);
    if (!target) return;
    e.preventDefault();
    e.dataTransfer.dropEffect="move";
    clearHighlight();
    dropRow=target.node;
    dropRow.classList.add(target.destination.after?"studio-drop-after":"studio-drop-before");
  });
  rows.addEventListener("dragleave",e=>{if (!rows.contains(e.relatedTarget)) clearHighlight();});
  rows.addEventListener("dragend",()=>{clearHighlight();dragging=null;});
  rows.addEventListener("drop",e=>{
    const target=dropTarget(e);
    if (!target) return;
    e.preventDefault();
    const from=dragging;
    clearHighlight(); dragging=null;
    changePosition(from,target.destination,from);
  });
  render();
}
