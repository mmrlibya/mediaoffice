(() => {
  const form = document.querySelector('#coverageForm');
  const status = document.querySelector('#status');
  const manual = document.querySelector('#manual');
  const recipient = 'mediaoffice@mmr.id.ly';
  const field = name => form.elements.namedItem(name);
  const media = [...form.querySelectorAll('[name="media"]')];

  function toggle(id, visible) {
    const group = document.getElementById(id);
    group.hidden = !visible;
    group.querySelectorAll('input,select,textarea').forEach(input => input.disabled = !visible);
  }

  function updateSchedule() {
    const part = key => document.getElementById('activity-' + key);
    const year = part('year').value;
    const month = part('month').value;
    const day = part('day');
    const limit = month ? new Date(Date.UTC(Number(year || 2026), Number(month), 0)).getUTCDate() : 31;
    for (const option of day.options) {
      option.hidden = option.disabled = Number(option.value) > limit;
    }
    if (Number(day.value) > limit) day.value = '';
    const pad = value => value.padStart(2, '0');
    field('date').value = year && month && day.value ? [year, pad(month), pad(day.value)].join('-') : '';
    const hour = part('hour').value;
    const minute = part('minute').value;
    const period = part('period').value;
    field('time').value = hour && minute && period ? hour + ':' + minute + ' ' + period : '';
  }

  function update() {
    updateSchedule();
    const action = field('action').selectedIndex;
    toggle('previous', action > 0);
    toggle('activity', action < 2);
    toggle('urgent', action < 2 && field('priority').selectedIndex === 1);
    media[0].setCustomValidity(!media[0].disabled && !media.some(input => input.checked)
      ? 'اختر نوع التغطية المطلوبة' : '');
  }
  form.addEventListener('input', () => {
    update();
    status.textContent = '';
    manual.hidden = true;
    document.querySelector('#deliveryOptions').hidden = true;
  });
  window.addEventListener('pageshow', update);
  update();

  function compose() {
    update();
    if (!form.reportValidity()) return null;
    const subject = [field('action').value, field('org').value.trim(), field('title').value.trim()].join(' | ');
    const lines = ['السيد مدير مكتب الإعلام والتواصل', 'تحية طيبة،', ''];
    for (const input of form.querySelectorAll('[name]')) {
      if (input.disabled || !input.value.trim()) continue;
      if (input.name === 'media') {
        if (input === media[0]) lines.push('التغطية المطلوبة: ' + media.filter(item => item.checked).map(item => item.value).join('، '));
        continue;
      }
      const label = input.dataset.label || input.labels[0].firstChild.textContent.trim();
      lines.push(label + ': ' + input.value.trim());
    }
    return {subject, body: lines.join('\r\n')};
  }
  async function copyRequest() {
    const message = compose();
    if (!message) return;
    const text = 'إلى: ' + recipient + '\nالموضوع: ' + message.subject + '\n\n' + message.body;
    try {
      await navigator.clipboard.writeText(text);
      status.textContent = 'نُسخ نص الطلب. يمكنك لصقه في بريدك وإضافة المرفقات ثم إرساله.';
    } catch {
      manual.hidden = false;
      manual.value = text;
      manual.focus();
      manual.select();
      status.textContent = 'حدّدنا نص الطلب لتنسخه إلى بريدك.';
    }
  }
  document.querySelector('#copy').addEventListener('click', copyRequest);
  form.addEventListener('submit', event => {
    event.preventDefault();
    const message = compose();
    if (!message) return;
    manual.value = 'إلى: ' + recipient + '\nالموضوع: ' + message.subject + '\n\n' + message.body;
    manual.hidden = false;
    document.querySelector('#deliveryOptions').hidden = false;
    status.textContent = 'الرسالة جاهزة للمراجعة. اختر بريدك أو انسخ النص، ثم أضف المرفقات وأرسل الطلب من حسابك.';
    manual.focus();
  });

  function openDraft(inGmail) {
    const message = compose();
    if (!message) return;
    let url;
    if (inGmail) {
      url = new URL('https://mail.google.com/mail/');
      url.search = new URLSearchParams({view: 'cm', fs: '1', to: recipient, su: message.subject, body: message.body});
    } else {
      url = 'mailto:' + recipient + '?subject=' + encodeURIComponent(message.subject) + '&body=' + encodeURIComponent(message.body);
    }
    window.open(String(url), '_blank', 'noopener,noreferrer');
    status.textContent = 'إذا لم تفتح مسودة البريد أو ظهر النص ناقصاً، استخدم «نسخ نص الطلب» والصقه في رسالة من بريدك.';
  }
  document.querySelector('#gmailDraft').addEventListener('click', () => openDraft(true));
  document.querySelector('#appDraft').addEventListener('click', () => openDraft(false));
})();
