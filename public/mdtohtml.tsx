// // -----------------------------------------------------------version 1-----------------------------------------------------------
// // import markdownIt from 'markdown-it';

// // const pngFileRegex = /(?<![^\s>])([a-zA-Z0-9\/_.\-\s()]+\.png)(?![^<]*<\/a>)/g;

// // export const mdToHtml = (markdown: string, currentUserId: string): string => {
// //   const md = new markdownIt({ html: true });
// //   let html = md.render(markdown);
// //   const parser = new DOMParser();
// //   const doc = parser.parseFromString(html, 'text/html');
// //   const tables = doc.querySelectorAll('table');

// //   tables.forEach((table) => {
// //     const headers = table.querySelectorAll('thead tr th');
// //     let stepIndex = -1;
// //     let resultIndex = -1;
// //     let evidenceIndex = -1;
// //     let usersIndex = -1;

// //     headers.forEach((th, index) => {
// //       const text = th.textContent?.trim().toLowerCase();
// //       if (text === 'step #') stepIndex = index;
// //       if (text === 'result') resultIndex = index;
// //       if (text === 'evidence') evidenceIndex = index;
// //       if (text === 'user') usersIndex = index;
// //     });

// //     const rows = table.querySelectorAll('tbody tr');
// //     const rowResults: (string | null)[] = Array.from(rows).map((row) => {
// //       const cells = row.querySelectorAll('td');
// //       if (resultIndex === -1 || !cells[resultIndex]) return null;

// //       const cell = cells[resultIndex];
// //       const checkedRadio = cell.querySelector('input[type="radio"]:checked') as HTMLInputElement;
// //       const value = checkedRadio?.value?.toLowerCase() || cell.textContent?.trim().toLowerCase() || '';
// //       return value === 'pass' || value === 'fail' ? value : null;
// //     });

// //     let previousCompleted = true; // First row is enabled if assigned to the current user
// //     rows.forEach((row, rowIndex) => {
// //       row.setAttribute('data-row-index', rowIndex.toString());
// //       const cells = row.querySelectorAll('td');
// //       const stepText = cells[stepIndex !== -1 ? stepIndex : 0]?.textContent?.trim() || '';
// //       const stepNum = stepText ? stepText.padStart(2, '0') : `0${rowIndex + 1}`.padStart(2, '0');

// //       let savedUserValue: string | null = null;
// //       if (usersIndex !== -1 && cells[usersIndex]) {
// //         const selectEl = cells[usersIndex].querySelector('select');
// //         if (selectEl instanceof HTMLSelectElement) {
// //           savedUserValue = selectEl.value.trim();
// //         } else {
// //           savedUserValue = cells[usersIndex].textContent?.trim() || null;
// //         }
// //       }

// //       const isRowAssignedToCurrentUser = savedUserValue === currentUserId.toString().trim();
// //       const isRowEnabled = rowIndex === 0
// //         ? isRowAssignedToCurrentUser
// //         : previousCompleted && isRowAssignedToCurrentUser;

// //       const isCompletedNow = rowResults[rowIndex] === 'pass' || rowResults[rowIndex] === 'fail';
// //       previousCompleted = isCompletedNow;

// //       // File input
// //       if (evidenceIndex !== -1 && cells[evidenceIndex]) {
// //         const fileContainer = cells[evidenceIndex].querySelector('.file-name-container')?.outerHTML || '';
// //         cells[evidenceIndex].innerHTML = `
// //           <input type="file" multiple ${isRowEnabled ? '' : 'disabled'} />
// //           ${fileContainer}
// //         `;
// //       }

// //       // Radio buttons
// //       if (resultIndex !== -1 && cells[resultIndex]) {
// //         const savedValue = rowResults[rowIndex];
// //         const radioName = `result-${stepNum}`;
// //         cells[resultIndex].innerHTML = `
// //           <label><input type="radio" name="${radioName}" value="pass" ${savedValue === 'pass' ? 'checked' : ''} ${isRowEnabled ? '' : 'disabled'}> Pass</label>
// //           <label><input type="radio" name="${radioName}" value="fail" ${savedValue === 'fail' ? 'checked' : ''} ${isRowEnabled ? '' : 'disabled'}> Fail</label>
// //         `;
// //       }

// //       // User dropdown
// //       if (usersIndex !== -1 && cells[usersIndex]) {
// //         const userOptions = [
// //           { value: '1', label: 'User-01' },
// //           { value: '2', label: 'User-02' },
// //           { value: '3', label: 'User-03' },
// //           { value: '4', label: 'User-04' },
// //           { value: '5', label: 'User-05' },
// //           { value: '6', label: 'User-06' },
// //         ];
// //         const optionsHTML = userOptions.map(opt => `
// //           <option value="${opt.value}" ${savedUserValue === opt.value ? 'selected' : ''}>${opt.label}</option>
// //         `).join('');
// //         cells[usersIndex].innerHTML = `<select ${isRowEnabled ? '' : 'disabled'}>${optionsHTML}</select>`;
// //       }

// //       row.style.opacity = isRowEnabled || rowResults[rowIndex] === 'pass' ? '1' : '0.6';
// //       row.style.pointerEvents = isRowEnabled ? 'auto' : 'none';
// //     });
// //   });

// //   doc.body.innerHTML += `
// //     <script>
// //       document.querySelectorAll('input[type="radio"]').forEach(radio => {
// //         radio.addEventListener('change', function () {
// //           const currentRow = this.closest('tr');
// //           const rowIndex = parseInt(currentRow.getAttribute('data-row-index'));
// //           const rows = Array.from(document.querySelectorAll('tbody tr'));
// //           const nextRow = rows[rowIndex + 1];
// //           if (nextRow) {
// //             const nextUserSelect = nextRow.querySelector('select');
// //             if (nextUserSelect) {
// //               nextRow.style.opacity = '1';
// //               nextRow.style.pointerEvents = 'auto';
// //               nextRow.querySelectorAll('input, select').forEach(el => el.removeAttribute('disabled'));
// //             }
// //           }
// //         });
// //       });
// //     </script>
// //   `;

// //   return doc.body.innerHTML;
// // };



// // -----------------------------------------------------------version 2-----------------------------------------------------------
// // This version processes markdown tables to convert specific columns into interactive elements like radio buttons and buttons.
// import markdownIt from 'markdown-it';

// export const mdToHtml = (markdown: string): string => {
//   const md = new markdownIt({ html: true });
//   let html = md.render(markdown);
//   const parser = new DOMParser();
//   const doc = parser.parseFromString(html, 'text/html');
//   const tables = doc.querySelectorAll('table');

//   let testScriptCounter = 0;   // stays outside forEach
//   let currentTS = '';          // remembers current TS id

//   tables.forEach((table) => {
//     const getTableTitle = (table: HTMLTableElement): string => {
//       let prev = table.previousElementSibling;
//       while (prev) {
//         const text = prev.textContent?.trim().toLowerCase();
//         if (text?.includes('test script')) {
//           testScriptCounter++;
//           currentTS = `TS${testScriptCounter}`;
//           return currentTS;
//         }
//         prev = prev.previousElementSibling;
//       }
//       // if no "Test Script" found, reuse current TS id
//       return currentTS || `TS${++testScriptCounter}`;
//     };

//     const title = getTableTitle(table).replace(/\s+/g, '_');
//     // const title = getTableTitle(table).replace(/\s+/g, '_'); // safe key
//     table.setAttribute('data-title', title);

//     const headers = table.querySelectorAll('thead tr th');
//     let actualIndex = -1;
//     let pfIndex = -1;
//     let initDateIndex = -1;
//     let userIndex = -1;
//     let attachmentIndex = -1;
//     let prereqIndex = -1;

//     headers.forEach((th, index) => {
//       const text: any = th.textContent?.trim().toLowerCase();
//       if (text.includes('actual result')) actualIndex = index;
//       if (text.includes('pass/fail')) pfIndex = index;
//       if (text.includes('initial/date') || text.includes('signature & date')) initDateIndex = index;
//       if (text.includes('test user') || text.includes('name and title')) userIndex = index;
//       if (text.includes('attachment')) attachmentIndex = index;
//       if (text.includes('setup met')) prereqIndex = index; // Pre-Requisite / Setup Met?
//     });

//     const rows = table.querySelectorAll('tbody tr');
//     rows.forEach((row, rowIndex) => {
//       const cells = row.querySelectorAll('td');

//       // Pre-Requisite / Setup Met? → Yes/No radios
//       if (prereqIndex !== -1 && cells[prereqIndex]) {
//         const radioName = `prereq-${title}-${rowIndex}`;
//         cells[prereqIndex].innerHTML = `
//           <label><input type="radio" name="${radioName}" value="yes"> Yes</label>
//           <label><input type="radio" name="${radioName}" value="no"> No</label>
//         `;
//       }

//       // Actual Result → Radio
//       if (actualIndex !== -1 && cells[actualIndex]) {
//         const radioName = `actual-${title}-${rowIndex}`;
//         cells[actualIndex].innerHTML = `
//           <label><input type="radio" name="${radioName}" value="yes"> Yes</label>
//           <label><input type="radio" name="${radioName}" value="no"> No</label>
//         `;
//       }

//       // Pass/Fail → Radio
//       if (pfIndex !== -1 && cells[pfIndex]) {
//         const radioName = `pf-result-${title}-${rowIndex}`;
//         cells[pfIndex].innerHTML = `
//           <label><input type="radio" name="${radioName}" value="pass"> Pass</label>
//           <label><input type="radio" name="${radioName}" value="fail"> Fail</label>
//         `;
//       }

//       // Initial/Date → Button
//       if (initDateIndex !== -1 && cells[initDateIndex]) {
//         cells[initDateIndex].innerHTML = `
//           <button type="button" class="signoff-btn" onclick="handleInitDate('${title}', ${rowIndex})">Sign Off</button>
//         `;
//       }

//       // Test User → Dropdown (static data for now)
//       if (userIndex !== -1 && cells[userIndex]) {
//         const selectName = `user-${title}-${rowIndex}`;
//         const users = [
//           { id: "1", name: "Mounika M", role: "Author" },
//           { id: "2", name: "Madhav D", role: "Reviewer" },
//           { id: "3", name: "Rakesh Potru", role: "QA" },
//           { id: "4", name: "Muni P", role: "QA" },
//           { id: "5", name: "Sushma A", role: "QA" },
//           { id: "6", name: "Sanath Kumar", role: "QA" },
//         ];
//         const optionsHTML = users
//           .map(u => `<option value="${u.id}">${u.name}</option>`)
//           .join("");

//         // add data-selected-user for tracking (empty initially)
//         cells[userIndex].innerHTML = `<select name="${selectName}" data-selected-user="">${optionsHTML}</select>`;
//       }

//       // Attachment → Multiple file upload
//       if (attachmentIndex !== -1 && cells[attachmentIndex]) {
//         const fileInputId = `attach-${title}-${rowIndex}`;
//         cells[attachmentIndex].innerHTML = `
//           <input type="file" id="${fileInputId}" name="${fileInputId}" multiple />
//         `;
//       }
//     });
//   });

//   // Inject handler
//   doc.body.innerHTML += `
//     <script>
//       function handleInitDate(title, rowIndex) {
//         const today = new Date().toLocaleDateString();
//         const cell = document.querySelector(
//           'table[data-title="'+title+'"] tbody tr:nth-child('+(rowIndex+1)+') td:last-child'
//         );
//         if(cell) {
//           cell.innerHTML = "BK " + today;
//         }
//       }
//     </script>
//   `;

//   return doc.body.innerHTML;
// };


import MarkdownIt from 'markdown-it';

export const mdToHtml = (markdown: string): string => {
  const md = new MarkdownIt({ html: true, tables: true });
  const html = md.render(markdown);
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const tables = doc.querySelectorAll('table');

  let testScriptCounter = 0;
  let currentTestScript = '';

  // Helper function to normalize header text
  const normalizeText = (text?: string | null): string =>
    (text ?? '').toLowerCase().replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();

  tables.forEach((table) => {
    // Determine table title based on preceding "Test Script" text
    const getTableTitle = (tableElement: HTMLTableElement): string => {
      let prev = tableElement.previousElementSibling;
      while (prev) {
        if (normalizeText(prev.textContent).includes('test script')) {
          testScriptCounter += 1;
          currentTestScript = `TS${testScriptCounter}`;
          return currentTestScript;
        }
        prev = prev.previousElementSibling;
      }
      return currentTestScript || `TS${++testScriptCounter}`;
    };

    const title = getTableTitle(table).replace(/\s+/g, '_');
    table.setAttribute('data-title', title);

    const headers = table.querySelectorAll('thead tr th');
    const indices = {
      actualResult: -1,
      passFail: -1,
      initialDate: -1,
      testUser: -1,
      evidence: -1,
      prerequisite: -1,
    };

    // Identify column indices with more flexible matching
    headers.forEach((th, index) => {
      const text = normalizeText(th.textContent);
      if (text.includes('actual result')) indices.actualResult = index;
      if (text.includes('pass') && text.includes('fail')) indices.passFail = index; // Match "Observation (Pass/Fail)"
      if (text.includes('date') || text.includes('checked by')) indices.initialDate = index; // Match "Checked by/ Date"
      if (text.includes('test user') || text.includes('checked by')) indices.testUser = index; // Match "Checked by/ Date"
      if (text.includes('attachment') || text.includes('evidence')) indices.evidence = index;
      if (text.includes('setup met')) indices.prerequisite = index;
    });

    const rows = table.querySelectorAll('tbody tr');
    rows.forEach((row, rowIndex) => {
      row.setAttribute('data-row-index', rowIndex.toString());
      const cells = row.querySelectorAll('td');

      // Prerequisite (Setup Met) - Yes/No radios
      if (indices.prerequisite !== -1 && cells[indices.prerequisite]) {
        const radioName = `prereq-${title}-${rowIndex}`;
        cells[indices.prerequisite].innerHTML = `
          <label><input type="radio" name="${radioName}" value="yes"> Yes</label>
          <label><input type="radio" name="${radioName}" value="no"> No</label>
        `;
      }

      // Actual Result - Yes/No radios with reason div
      if (indices.actualResult !== -1 && cells[indices.actualResult]) {
        const radioName = `ar-yesno-${title}-${rowIndex}`;
        cells[indices.actualResult].innerHTML = `
          <label><input type="radio" name="${radioName}" value="yes"> Yes</label>
          <label><input type="radio" name="${radioName}" value="no"> No</label>
          <div data-reason-name="reason-${title}-${rowIndex}" style="display:none;" contenteditable="true"></div>
        `;
      }

      // Pass/Fail - Radio buttons
      if (indices.passFail !== -1 && cells[indices.passFail]) {
        const radioName = `pf-result-${title}-${rowIndex}`;
        cells[indices.passFail].innerHTML = `
          <label><input type="radio" name="${radioName}" value="pass"> Pass</label>
          <label><input type="radio" name="${radioName}" value="fail"> Fail</label>
        `;
      }

      // Initial/Date - Sign-off button
      if (indices.initialDate !== -1 && cells[indices.initialDate]) {
        cells[indices.initialDate].innerHTML = `
          <button type="button" class="signoff-btn" data-title="${title}" data-row-index="${rowIndex}">Sign Off</button>
        `;
      }

      // Test User - Dropdown
      if (indices.testUser !== -1 && cells[indices.testUser]) {
        const selectName = `user-${title}-${rowIndex}`;
        const users = [
          { id: '2', name: 'Phani G', role: 'Author' },
          { id: '3', name: 'Mounika M', role: 'Author' },
          { id: '4', name: 'Madhav D', role: 'Reviewer' },
          { id: '7', name: 'Sushma A', role: 'Reviewer' },
          { id: '9', name: 'Bhavana A', role: 'Reviewer' },
          { id: '5', name: 'Rakesh Potru', role: 'Executor' },
          { id: '6', name: 'Muni P', role: 'Executor' },
          { id: '8', name: 'Sanath Kumar', role: 'Author' },
          { id: '10', name: 'Sowjanya N', role: 'signoff' },
          { id: '11', name: 'Prabhu K', role: 'signoff' },
          { id: '12', name: 'Vasanthi VK', role: 'signoff' },
        ];
        const optionsHTML = users
          .map((user) => `<option value="${user.id}">${user.name}</option>`)
          .join('');
        cells[indices.testUser].innerHTML = `
        <select name="${selectName}" data-selected-user="">
          <option value="" selected disabled>-- Select User --</option>
          ${optionsHTML}
        </select>
        `;
      }
          // <button type="button" class="snip-btn" data-title="${title}" data-row-index="${rowIndex}">Snip</button> 
      // Evidence - File input
      if (indices.evidence !== -1 && cells[indices.evidence]) {
        const fileInputId = `evidence-${title}-${rowIndex}`;
        cells[indices.evidence].innerHTML = `
          <input type="file" id="${fileInputId}" name="${fileInputId}" />
          <button type="button" class="snip-btn" data-title="${title}" data-row-index="${rowIndex}">Snip</button>
        `;
      }
    });
  });

  return doc.body.innerHTML;
};