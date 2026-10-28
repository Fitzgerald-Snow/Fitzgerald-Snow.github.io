(() => {
  const page = document.body.dataset.page;
  const e = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const list = value => Array.isArray(value) ? value.filter(item => item && typeof item === 'object') : [];
  const text = (tag, className, value) => value ? `<${tag} class="${className}">${e(value)}</${tag}>` : '';
  const url = value => {
    const href = String(value ?? '').trim();
    if (!href) return '';
    try { return ['http:', 'https:', 'file:', 'mailto:'].includes(new URL(href, location.href).protocol) ? e(href) : ''; }
    catch { return ''; }
  };
  const link = (label, href, external = false) => url(href) && String(label ?? '').trim() ? `<a${external ? ' class="ext"' : ''} href="${url(href)}">${e(label)}</a>` : '';
  const links = items => items.some(Boolean) ? `<div class="links mono">${items.join('')}</div>` : '';
  const row = (label, content, className = '') => `<div class="row ${className}">${text('div', 'when mono', label) || '<div></div>'}<div>${content}</div></div>`;
  const section = (id, title, content, className = '') => `<section class="section ${className}" id="${id}" aria-labelledby="${id}-title"><div class="section-head"><h2 id="${id}-title">${e(title)}</h2></div>${content}</section>`;

  function render(content) {
    const c = content;
    const p = c.profile ?? {};
    const nav = c.navigation ?? {};
    const headings = c.sections ?? {};
    const site = c.site ?? {};
    const w = c.writings ?? {};
    document.title = page === 'writings' ? `${w.title || 'Writings'} · ${p.nameEn || ''}` : [p.nameEn, p.nameZh].filter(Boolean).join(' · ');
    document.querySelector('meta[name="description"]').content = site.description || '';
    document.querySelector('.mast').innerHTML = `${link(site.title, 'index.html')}<nav class="mono" aria-label="Main navigation">${link(nav.research, page === 'home' ? '#research' : 'index.html#research')}${link(nav.writings, 'writings.html')}${link(nav.cv, p.cvUrl)}${link(nav.contact, p.email ? `mailto:${p.email}` : '')}</nav>`;
    document.querySelector('.mast > a')?.classList.add('wordmark');
    if (page === 'writings') document.querySelector('nav a[href="writings.html"]')?.setAttribute('aria-current', 'page');
    document.querySelector('footer').innerHTML = `<span>${e([p.nameEn, site.updated].filter(Boolean).join(' · '))}</span>`;

    if (page === 'writings') {
      document.querySelector('main').innerHTML = `<div class="writing-intro"><h1>${e(w.title)}</h1>${text('p', '', w.intro)}</div><div class="writing-list">${list(w.items).filter(item => item.title).map(item => row(item.type, `<h2>${link(item.title, item.fileUrl) || e(item.title)}</h2>${text('p', 'role mono', item.meta)}`)).join('')}</div><a class="back mono" href="index.html">${e(w.backLabel)}</a>`;
      return;
    }

    const research = list(c.research).filter(item => item.title).map(item => row(item.date, `<h3>${e(item.title)}</h3>${text('p', 'role mono', item.affiliation)}${text('p', 'desc', item.description)}${links([link('Code', item.codeUrl, true), link('Lab', item.labUrl, true)])}`)).join('');
    const small = c.smallProjects ?? {};
    const studies = list(small.items).filter(item => item.title || item.description);
    const smallRow = studies.length ? row(small.label, `<h3>${e(small.title)}</h3><ul class="studies">${studies.map(item => `<li>${text('strong', '', item.title)}${item.title && item.description ? ' ' : ''}${e(item.description)}</li>`).join('')}</ul>`) : '';
    const interests = list(c.interests).filter(item => item.topic || item.description).map(item => `<div class="row interest"><div class="topic">${e(item.topic)}</div><p>${e(item.description)}</p></div>`).join('');
    const elsewhere = c.elsewhere ?? {};
    const elsewhereCopy = String(elsewhere.description ?? '').trim() ? text('p', 'elsewhere-copy', elsewhere.description) : '';
    const elsewhereLinks = links(list(elsewhere.links).map(item => link(item.label, item.url, true)));
    const elsewhereSection = elsewhereCopy || elsewhereLinks ? section('elsewhere', headings.elsewhere, row(elsewhere.label, elsewhereCopy + elsewhereLinks), 'elsewhere') : '';
    const portrait = url(p.portraitUrl) ? `<img src="${url(p.portraitUrl)}" alt="${e(p.nameEn)}">` : '<span>Portrait</span>';
    document.querySelector('main').innerHTML = `<div class="hero"><div class="identity"><div><h1><span>${e(p.nameEn)}</span><span class="name-zh" lang="zh-Hans">${e(p.nameZh)}</span></h1>${text('p', 'institution', p.university)}<div class="contacts mono">${link('Email', p.email ? `mailto:${p.email}` : '')}${link('GitHub', p.github, true)}</div></div><div class="portrait">${portrait}</div></div>${text('p', 'intro', p.intro)}</div>${section('research', headings.research, research + smallRow)}${section('interests', headings.interests, interests)}${elsewhereSection}`;
    document.querySelector('.portrait img')?.addEventListener('error', event => { event.target.parentElement.innerHTML = '<span>Portrait</span>'; });
  }

  render(window.SITE_CONTENT);
  let previewAnchorAligned = false;
  window.addEventListener('message', event => {
    if (window.parent !== window && event.source === window.parent && event.data?.type === 'homepage-content-preview' && event.data.content?.profile) {
      render(event.data.content);
      if (!previewAnchorAligned && page === 'home' && event.data.focusSection === 'interests') {
        previewAnchorAligned = true;
        requestAnimationFrame(() => {
          const target = document.getElementById('interests');
          if (target) window.scrollBy(0, target.getBoundingClientRect().top - 28);
        });
      }
    }
  });
})();
