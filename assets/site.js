(function(){
  function $(s,r){return (r||document).querySelector(s)}
  function $$(s,r){return [].slice.call((r||document).querySelectorAll(s))}
  /* Form delivery: posts to the endpoint in <meta name="ile-form-endpoint"> (a Google Apps Script web app).
     Without an endpoint (the claude.ai preview), forms validate and show a preview notice instead. */
  var ENDPOINT=(document.querySelector('meta[name="ile-form-endpoint"]')||{}).content||'';
  var LIVE=/^https:\/\//.test(ENDPOINT);
  function send(kind,data){
    if(!LIVE) return Promise.resolve('preview');
    var body=JSON.stringify(Object.assign({form:kind,page:location.pathname},data));
    return fetch(ENDPOINT,{method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain;charset=utf-8'},body:body}).then(function(){return 'sent'});
  }
  function busy(btn,on,label){if(!btn)return;if(on){btn.dataset.label=btn.textContent;btn.textContent=label||'Sending…';btn.disabled=true}else{btn.textContent=btn.dataset.label||btn.textContent;btn.disabled=false}}
  function botTrap(f){var h=f.querySelector('input[name="company_website"]');return h&&h.value}
  document.querySelectorAll('.preview-note').forEach(function(n){if(LIVE)n.hidden=true});

  function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}

  /* Mobile menu */
  var mb=$('.menu-btn'), dr=$('.drawer');
  if(mb&&dr){mb.addEventListener('click',function(){var o=dr.classList.toggle('open');mb.setAttribute('aria-expanded',String(o));mb.textContent=o?'Close':'Menu'})}

  /* Info tips: tapping the icon shows its text without ticking the box */
  $('.tip').forEach(function(t){
    t.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();var open=t.classList.toggle('open');$('.tip.open').forEach(function(o){if(o!==t)o.classList.remove('open')});if(!open)t.blur()});
    t.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();t.click()}if(e.key==='Escape'){t.classList.remove('open');t.blur()}});
    t.addEventListener('blur',function(){t.classList.remove('open')});
  });

  /* Year */
  $$('[data-year]').forEach(function(e){e.textContent=new Date().getFullYear()});

  /* Copy buttons */
  $$('[data-copy]').forEach(function(b){
    b.addEventListener('click',function(){
      var t=b.dataset.copy, out=$('#copy-status'), label=b.textContent;
      function done(ok){ if(out) out.textContent=ok?('Copied '+t):('Select and copy: '+t); if(ok){b.textContent='Copied';setTimeout(function(){b.textContent=label},1600)} }
      try{navigator.clipboard.writeText(t).then(function(){done(true)},function(){done(false)})}catch(e){done(false)}
    });
  });

  /* Newsletter (footer) */
  $$('.news-form').forEach(function(f){
    f.addEventListener('submit',function(e){
      e.preventDefault();
      var em=f.querySelector('input[type=email]'), msg=f.parentNode.querySelector('.news-msg');
      if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em.value.trim())){msg.className='news-msg form-msg';msg.textContent='Please enter a valid email address.';em.focus();return}
      var btn=f.querySelector('button');busy(btn,true,'Subscribing…');
      send('newsletter',{email:em.value.trim(),consent_email:'yes',submitted_at:new Date().toISOString()}).then(function(r){
        busy(btn,false);msg.className='news-msg form-ok';
        msg.textContent=r==='sent'?'Thank you. You are on the list for the Ilé Journal.':'Thank you. (Preview: sign-ups are saved once the live site is connected.)';f.reset();
      }).catch(function(){busy(btn,false);msg.className='news-msg form-msg';msg.textContent='We could not save that just now. Please try again in a moment.'});
    });
  });

  /* Family preview */
  var dev=$('#device');
  if(dev){
    var views={
      mum:{who:'Mrs Funmi Adeyemi',sub:'Lekki, Lagos · Steady Beat',items:[['Blood pressure logged','132/84, lower than last week','Mon 08:10'],['Evening tablets taken','Confirmed by Mrs Adeyemi','Mon 19:05'],['Live session','Eating well at owambe parties','Wed 19:00'],['Message from Ada','"Well done on your readings, Mummy"','Thu 09:15']]},
      ada:{who:"Mum's week",sub:'Shared with Ada in London',items:[['Mum logged her blood pressure','132/84, down from 141/90','Mon 08:10'],['Medicines confirmed','Evening tablets ticked','Mon 19:05'],['Mum joined a live session','Steady Beat with a cardiologist','Wed 19:00'],['Nurse replied privately','Your question about ankle swelling','Thu 11:42']]}
    };
    var body=$('#device-body'), btns=$$('.seg button',dev);
    function render(k){var v=views[k];
      body.innerHTML='<div class="who"><span class="av" aria-hidden="true">FA</span><div><b>'+esc(v.who)+'</b><small>'+esc(v.sub)+'</small></div><span class="status-dot">Steady</span></div><ul class="timeline">'+
        v.items.map(function(i){return '<li><div><b>'+esc(i[0])+'</b><small>'+esc(i[1])+'</small></div><time>'+esc(i[2])+'</time></li>'}).join('')+'</ul>';
      btns.forEach(function(b){b.setAttribute('aria-pressed',String(b.dataset.view===k))});
    }
    btns.forEach(function(b){b.addEventListener('click',function(){render(b.dataset.view)})});
    render('ada');
  }

  /* Circles sub-navigation highlight */
  var sub=$$('.subnav a');
  if(sub.length&&'IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){sub.forEach(function(a){a.classList.toggle('on',a.getAttribute('href')==='#'+e.target.id)})}})},{rootMargin:'-40% 0px -55% 0px'});
    $$('.circle').forEach(function(s){io.observe(s)});
  }

  /* Myth or fact */
  var ml=$('#myth-list');
  if(ml){
    var myths=[
      ['If I feel fine, my blood pressure must be fine.','High blood pressure usually has no symptoms. The only way to know is to check it regularly, at a clinic, a pharmacy or at home.'],
      ['Once my readings are normal, I can stop my tablets.','Normal readings often mean the medicine is working. Stopping suddenly can make blood pressure or sugar rise again. Talk to your doctor before changing anything.'],
      ['Bitter leaf or herbal mixtures can replace diabetes medicine.','Some foods can be part of a healthy diet, but no herb has been shown to replace prescribed diabetes treatment. Some mixtures can harm the kidneys or liver.'],
      ['A stroke is caused by a spiritual attack.','A stroke happens when blood flow to part of the brain is blocked or a blood vessel bursts. High blood pressure is the biggest risk factor. Fast hospital treatment saves lives.'],
      ['Walking will wear out my painful knees.','For most people with arthritis, gentle regular movement eases pain and keeps joints working. A physiotherapist can show you what is safe for you.'],
      ['Menopause symptoms are just something women must endure.','Hot flushes, poor sleep and mood changes can be treated. Lifestyle changes and medical treatments help many women. It is worth talking to a doctor.']
    ];
    ml.innerHTML=myths.map(function(m,i){return '<button type="button" class="myth" aria-expanded="false" id="myth-'+i+'"><span class="q">“'+esc(m[0])+'”</span><span class="hint">Myth or fact? Reveal →</span><span class="v">Myth</span><span class="a">'+esc(m[1])+'</span></button>'}).join('');
    ml.addEventListener('click',function(e){var b=e.target.closest('.myth');if(b)b.setAttribute('aria-expanded',String(b.getAttribute('aria-expanded')!=='true'))});
  }

  /* Journal filters */
  var jl=$('#journal-list');
  if(jl){
    var fb=$$('.filters button'), q=$('#journal-search'), cards=$$('.card',jl), empty=$('#journal-empty'), cat='All';
    function apply(){var term=(q.value||'').trim().toLowerCase(), n=0;
      cards.forEach(function(c){var ok=(cat==='All'||c.dataset.cat===cat)&&(!term||c.textContent.toLowerCase().indexOf(term)>-1);c.hidden=!ok;if(ok)n++});
      empty.hidden=n>0;}
    fb.forEach(function(b){b.addEventListener('click',function(){cat=b.dataset.cat;fb.forEach(function(x){x.setAttribute('aria-pressed',String(x===b))});apply()})});
    q.addEventListener('input',apply);
  }

  /* Share link on articles */
  var sh=$('#share-link');
  if(sh){sh.addEventListener('click',function(){var u=location.href,s=$('#share-status');try{navigator.clipboard.writeText(u).then(function(){s.textContent='Link copied'},function(){s.textContent=u})}catch(e){s.textContent=u}})}

  /* Join form */
  var form=$('#join-form');
  if(form){
    var steps=$$('fieldset.step',form), marks=$$('.stepper span',form), err=$('#form-error'), back=$('#btn-back'), next=$('#btn-next'), submit=$('#btn-submit'), role=$('#f-role'), cur=1;
    var names={first_name:'first name',last_name:'last name',email:'email',whatsapp:'WhatsApp number',country:'country',city:'city',role:'how you are joining',relationship:'who you look after',loved_one_location:'where they live',profession:'profession',licence_number:'licence number',organisation:'organisation',organisation_type:'organisation type',contact_preference:'contact preference',heard_from:'how you heard about us'};
    var params=new URLSearchParams(location.search), pre=params.get('circle');
    if(pre){var box=form.querySelector('input[name=circles][value="'+pre+'"]');if(box)box.checked=true}
    var need=params.get('need');
    if(need){var nb=form.querySelector('input[name=needs][value="'+need+'"]');if(nb)nb.checked=true;if(need==='Updates for family abroad'){role.value='carer-abroad';sync()}}
    function show(n){cur=n;steps.forEach(function(s){s.hidden=Number(s.dataset.step)!==n});marks.forEach(function(m,i){m.className=i+1<n?'done':i+1===n?'on':''});back.hidden=n===1;next.hidden=n===3;submit.hidden=n!==3;err.hidden=true}
    function sync(){$$('[data-for]',form).forEach(function(g){var on=g.dataset.for.split(' ').indexOf(role.value)>-1;g.hidden=!on;$$('[data-req]',g).forEach(function(f){f.required=on})})}
    role.addEventListener('change',sync);
    function check(n){var miss=[],first=null;
      $$('input[required],select[required]',steps[n-1]).forEach(function(f){if(f.closest('[hidden]'))return;
        var bad=f.type==='checkbox'?!f.checked:!f.value.trim();
        if(!bad&&f.type==='email')bad=!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value.trim());
        f.setAttribute('aria-invalid',String(bad));
        if(bad){miss.push(f.type==='checkbox'?'the required agreements':(names[f.name]||f.name));if(!first)first=f}});
      if(miss.length){err.textContent='Please complete: '+miss.filter(function(v,i,a){return a.indexOf(v)===i}).join(', ')+'.';err.hidden=false;if(first)first.focus();return false}
      return true}
    next.addEventListener('click',function(){if(check(cur)){show(cur+1);form.scrollIntoView({behavior:'smooth',block:'start'})}});
    back.addEventListener('click',function(){show(cur-1)});
    form.addEventListener('submit',function(e){e.preventDefault();if(!check(3))return;
      var fd=new FormData(form),d={};fd.forEach(function(v,k){if(v==='')return;d[k]=d[k]?[].concat(d[k],v):v});d.submitted_at=new Date().toISOString();
      if(botTrap(form))return;
      var jbtn=$('#btn-submit');busy(jbtn,true);
      send('join',d).then(function(r){busy(jbtn,false);
      if(r==='sent')$('#thanks-note').textContent='Our team will message you on WhatsApp within two working days with your circle invitation. Here is what you shared:';
      var rows=[['Name',(d.first_name||'')+' '+(d.last_name||'')],['Email',d.email],['WhatsApp',d.whatsapp],['Location',[d.city,d.country].filter(Boolean).join(', ')],['Joining as',role.options[role.selectedIndex].text],['Circles',[].concat(d.circles||'None chosen').join(', ')],['Most helpful',[].concat(d.needs||'Not chosen').join(', ')],['Contact by',d.contact_preference]];
      $('#summary').innerHTML=rows.map(function(r){return '<dt>'+esc(r[0])+'</dt><dd>'+esc(r[1]||'')+'</dd>'}).join('');
      $('#thanks-name').textContent=d.first_name||'';
      form.hidden=true;var t=$('#thanks');t.hidden=false;t.focus();
      }).catch(function(){busy(jbtn,false);err.textContent='We could not send your form just now. Please try again, or WhatsApp us on 0902 221 1116.';err.hidden=false});});
    show(1);
  }

  /* Request care form */
  var rf=$('#request-form');
  if(rf){
    var rerr=$('#request-error'), radios=$$('input[name=service]',rf);
    var labels={'care-at-home':'Care at home','specialist':'See a specialist','hmo':'Health insurance (HMO) advice','ambulance':'Planned ambulance transfer','app':'Ilé family app waiting list','not-sure':'Not sure yet'};
    function syncSvc(){var v=(rf.querySelector('input[name=service]:checked')||{}).value;$$('[data-show]',rf).forEach(function(el){el.hidden=el.dataset.show!==v})}
    radios.forEach(function(r){r.addEventListener('change',syncSvc)});
    var pre=new URLSearchParams(location.search).get('service');
    if(pre){var pr=rf.querySelector('input[name=service][value="'+pre+'"]');if(pr){pr.checked=true;syncSvc()}}
    rf.addEventListener('submit',function(e){
      e.preventDefault();var miss=[],first=null;
      if(!rf.querySelector('input[name=service]:checked')){miss.push('the service you need');first=radios[0]}
      [['r-for','who it is for'],['r-area','where they live'],['r-name','your name'],['r-phone','your WhatsApp number'],['r-email','your email'],['r-country','your country']].forEach(function(p){var f=$('#'+p[0]);var bad=!f.value.trim()||(f.type==='email'&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value.trim()));f.setAttribute('aria-invalid',String(bad));if(bad){miss.push(p[1]);if(!first)first=f}});
      var c=$('#r-consent');if(!c.checked){miss.push('your agreement');if(!first)first=c}
      if(miss.length){rerr.textContent='Please add '+miss.join(', ')+'.';rerr.hidden=false;first.focus();return}
      rerr.hidden=true;
      var fd=new FormData(rf),d={};fd.forEach(function(v,k){if(v!=='')d[k]=v});d.submitted_at=new Date().toISOString();
      if(botTrap(rf))return;
      d.service_label=labels[d.service];
      var rbtn=rf.querySelector('button[type=submit]');busy(rbtn,true);
      send('request',d).then(function(r){busy(rbtn,false);
      if(r==='sent')$('#request-note').textContent='Our team will call or WhatsApp you within one working day to talk through what is needed and confirm the price.';
      var rows=[['Service',labels[d.service]+(d.specialist_type?' · '+d.specialist_type:'')],['For',d.for_whom],['Where',[d.area,d.area_detail].filter(Boolean).join(' · ')],['When',d.timing],['Your name',d.name],['WhatsApp',d.whatsapp],['Email',d.email]];
      $('#request-summary').innerHTML=rows.map(function(r){return '<dt>'+esc(r[0])+'</dt><dd>'+esc(r[1]||'')+'</dd>'}).join('');
      rf.hidden=true;var dn=$('#request-done');dn.hidden=false;dn.focus();
      }).catch(function(){busy(rbtn,false);rerr.textContent='We could not send your request just now. Please try again, or WhatsApp us on 0902 221 1116.';rerr.hidden=false});
    });
  }
  /* Job application form */
  var af=$('#apply-form');
  if(af){
    var aerr=$('#apply-error'), aradios=$$('input[name=role]',af);
    var roles={'community-lead':'Community Lead','care-operations':'Head of Care Operations','technology':'Head of Technology','lead-nurse':'Lead Nurse','circle-lead':'Consultant: lead a circle','other':'Another role or general interest'};
    function syncRole(){var v=(af.querySelector('input[name=role]:checked')||{}).value;$$('[data-show]',af).forEach(function(el){el.hidden=el.dataset.show.split(' ').indexOf(v)<0})}
    aradios.forEach(function(r){r.addEventListener('change',syncRole)});
    var pre2=new URLSearchParams(location.search).get('role');
    if(pre2){var pr2=af.querySelector('input[name=role][value="'+pre2+'"]');if(pr2){pr2.checked=true;syncRole()}}
    function readFile(file){return new Promise(function(res,rej){var r=new FileReader();r.onload=function(){res(String(r.result).split(',')[1])};r.onerror=rej;r.readAsDataURL(file)})}
    af.addEventListener('submit',function(e){
      e.preventDefault();var miss=[],first=null;
      if(!af.querySelector('input[name=role]:checked')){miss.push('the role');first=aradios[0]}
      [['a-years','your experience'],['a-current','your current role'],['a-why','why Ilé'],['a-name','your name'],['a-email','your email'],['a-phone','your phone number'],['a-loc','where you are based']].forEach(function(p){var f=$('#'+p[0]);var bad=!f.value.trim()||(f.type==='email'&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value.trim()));f.setAttribute('aria-invalid',String(bad));if(bad){miss.push(p[1]);if(!first)first=f}});
      var cv=$('#a-cv'),file=cv.files&&cv.files[0];
      if(!file){miss.push('your CV');cv.setAttribute('aria-invalid','true');if(!first)first=cv}
      else if(file.size>4*1024*1024){aerr.textContent='Your CV is larger than 4 MB. Please upload a smaller file, or email it to ilecircleafrica@gmail.com.';aerr.hidden=false;cv.focus();return}
      else cv.setAttribute('aria-invalid','false');
      var c=$('#a-consent');if(!c.checked){miss.push('your agreement');if(!first)first=c}
      if(miss.length){aerr.textContent='Please add '+miss.join(', ')+'.';aerr.hidden=false;first.focus();return}
      aerr.hidden=true;
      if(botTrap(af))return;
      var fd=new FormData(af),d={};fd.forEach(function(v,k){if(v!==''&&k!=='cv')d[k]=v});d.submitted_at=new Date().toISOString();
      d.role_label=roles[d.role];
      var abtn=af.querySelector('button[type=submit]');busy(abtn,true);
      (LIVE?readFile(file):Promise.resolve('')).then(function(b64){
        if(b64){d.cv_name=file.name;d.cv_type=file.type||'application/octet-stream';d.cv_data=b64}
        return send('apply',d);
      }).then(function(r){busy(abtn,false);
        if(r==='sent')$('#apply-note').textContent='We have your application and CV. We reply to everyone within two weeks.';
        var rows=[['Role',d.role_label+(d.circle?' · '+d.circle:'')],['Experience',d.experience+' years'],['Current role',d.current_role],['Name',d.name],['Email',d.email],['CV',file.name]];
        $('#apply-summary').innerHTML=rows.map(function(r){return '<dt>'+esc(r[0])+'</dt><dd>'+esc(r[1]||'')+'</dd>'}).join('');
        af.hidden=true;var dn=$('#apply-done');dn.hidden=false;dn.focus();
      }).catch(function(){busy(abtn,false);aerr.textContent='We could not send your application just now. Please try again, or email it to ilecircleafrica@gmail.com.';aerr.hidden=false});
    });
  }
})();
