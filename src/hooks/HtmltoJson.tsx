export const htmlToJson = (html: string): any => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const elements = [...doc.body.children];

  const jsonOutput: any = {};
  let currentKey = '';
  let nextElement: HTMLElement;

  for (let i = 0; i < elements.length; i++) {
    const el = elements[i] as HTMLElement;

    if (el.tagName === 'H1') {
      jsonOutput['document_title'] = el.textContent?.trim() || '';
      continue;
    }

    if (el.tagName === 'H2') {
      currentKey = el.textContent?.toLowerCase().replace(/\s+/g, '_') || `section_${i}`;
      nextElement = elements[i + 1] as HTMLElement;

      if (!nextElement) continue;

      if (nextElement.tagName === 'P') {
        jsonOutput[currentKey] = nextElement.textContent?.trim() || '';
        i++;
      } else if (nextElement.tagName === 'UL') {
        const items = [...nextElement.querySelectorAll('li')];
        const sectionObj: any = {};
        items.forEach((li) => {
          const [keyPart, ...rest] = li.innerHTML.split(':');
          const k = keyPart.replace(/<[^>]*>/g, '').trim().toLowerCase().replace(/\s+/g, '_');
          // Check for a select element
          const selectElem = li.querySelector('select[data-type="boolean"]');
          let v;
          if (selectElem) {
            const selectedValue = selectElem.querySelector('option:checked')?.getAttribute('value');
            v = selectedValue === 'true';
          } else {
            v = rest.join(':').replace(/<\/?[^>]+(>|$)/g, '').trim();
          }
          sectionObj[k] = v;
        });
        jsonOutput[currentKey] = sectionObj;
        i++;
      } else if (nextElement.tagName === 'TABLE') {
        const headers = [...nextElement.querySelectorAll('thead th')].map((th) =>
          th.textContent?.trim().toLowerCase().replace(/\s+/g, '_')
        );
        const rows = [...nextElement.querySelectorAll('tbody tr')];
        const rowData = rows.map((tr) => {
          const cells = [...tr.querySelectorAll('td')];
          const obj: any = {};
          cells.forEach((td, index) => {
            // Check if the cell contains a boolean select
            const selectElem = td.querySelector('select[data-type="boolean"]');
            let value;
            if (selectElem) {
              const selectedValue = selectElem.querySelector('option:checked')?.getAttribute('value');
              value = selectedValue === 'true';
            } else {
              const text = td.textContent?.trim();
              value = text === 'Yes' ? true : text === 'No' ? false : text;
            }
            obj[headers[index] || `col_${index}`] = value;
          });
          return obj;
        });
        jsonOutput[currentKey] = rowData;
        i++;
      }
    }
  }

  return jsonOutput;
};