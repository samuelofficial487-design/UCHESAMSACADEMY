/* Frontend JS: fetch events from serverless function and handle contact form. 
   On Netlify the events endpoint is at '/.netlify/functions/events' and contact at '/.netlify/functions/contact'.
   When hosted as static (GitHub Pages), fallback events are used.
*/
const eventsContainer = document.getElementById('eventsList');
const statusEl = document.getElementById('formStatus');

const fallbackEvents = [
  {
    "id":"Morning Assembly:",
    "title":"Morning Assembly",
    "month":"January",
    "time":"8:00 AM",
    "description":"Daily school assembly for announcment, prayers, and moral instruction at UCHE SAM'S ACADEMY."
  },
  {
    "id":"Mid-term-test",
    "title":"Mid-term Examination",
    "month":"March",
    "date":"2026-03-15",
    "description":"Mid-term academic assessment for all students at UCHE SAM'S ACADEMY."
  },
  {
    "id":"Inter-house-sports",
    "title":"Inter-housesports",
    "month":"June",
    "date":"2026-07-20",
    "description":"Annual Inter-house sports commpetition promoting teamwork and physical fitness."
  },
  {
    "id":"Cultural-day",
    "title":"Cultural Day Celebration",
    "month":"July",
    "date":"2026-08-18",
    "description":"A to celebrate Nigerian Culture, traditions, and student talents."
  },
  {
    "id":"Graduation",
    "title":"Graduation & Prize Giving Day",
    "month":"October",
    "date":"2026-10-10",
    "description":"Graduation ceremony and award presentation for outstanding students."
  }
];

async function loadEvents(){
  // try serverless function first
  try {
    const res = await fetch('/.netlify/functions/events', {cache: 'no-store'});
    if (!res.ok) throw new Error('No events function');
    const data = await res.json();
    renderEvents(data.events || data);
  } catch (err) {
    // fallback to static list
    renderEvents(fallbackEvents);
  }
}

function renderEvents(events){
  eventsContainer.innerHTML = '';
  events.sort((a,b)=> new Date(a.date) - new Date(b.date));
  events.forEach(ev=>{
    const div = document.createElement('article');
    div.className = 'event-card';
    div.innerHTML = `<h3>${escapeHtml(ev.title)}</h3>
      <div class="event-meta">${ev.month} • ${new Date(ev.date).toLocaleDateString()}</div>
      <p>${escapeHtml(ev.description)}</p>`;
    eventsContainer.appendChild(div);
  });
}

function escapeHtml(s){ return String(s).replace(/[&<>"']/g, c=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c])); }

// contact form
document.getElementById('contactForm').addEventListener('submit', async function(e){
  e.preventDefault();
  statusEl.textContent = 'Sending...';
  const payload = {
    name: document.getElementById('name').value,
    email: document.getElementById('email').value,
    message: document.getElementById('message').value,
  };
  try {
    const res = await fetch('/.netlify/functions/contact', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const txt = await res.text();
      throw new Error(txt || 'Failed');
    }
    const json = await res.json();
    statusEl.textContent = json.message || 'Message sent. Thank you!';
    document.getElementById('contactForm').reset();
  } catch (err){
    // If serverless not available (e.g. GitHub Pages), show a helpful message
    statusEl.textContent = 'Could not send via server. Save your message and email us at info@igniters.example';
  }
  setTimeout(()=> statusEl.textContent = '', 5000);
});

window.addEventListener('load', loadEvents);
