(() => {
  const reading = document.querySelector('.ai-reading');
  if (!reading) return;
  const sections = reading.querySelectorAll('.ai-section');
  const tools = reading.querySelector('.ai-reading__tools');
  tools.hidden = false;
  tools.querySelector('[data-ai-expand]').addEventListener('click', () => {
    sections.forEach((section) => { section.open = true; });
  });
  tools.querySelector('[data-ai-collapse]').addEventListener('click', () => {
    sections.forEach((section) => { section.open = false; });
  });
  function openLinkedSection() {
    const section = Array.from(sections).find((item) => `#${item.id}` === location.hash);
    if (section) {
      section.open = true;
      section.scrollIntoView({ block: 'start' });
    }
  }
  window.addEventListener('hashchange', openLinkedSection);
  openLinkedSection();
  let beforePrint;
  window.addEventListener('beforeprint', () => {
    beforePrint = Array.from(sections, (section) => section.open);
    sections.forEach((section) => { section.open = true; });
  });
  window.addEventListener('afterprint', () => {
    if (beforePrint) sections.forEach((section, index) => { section.open = beforePrint[index]; });
  });
})();
