// // export const htmlWithPermissions = (
// //   htmlString: string,
// //   currentUserId: string,
// //   formState?: {
// //     radio: Record<string, string>,
// //     select: Record<string, string>,
// //     checkbox: Record<string, string>,
// //     reasons: Record<string, string>,
// //     evidenceFiles?: Record<string, any>,
// //     initialFiles?: Record<string, any>
// //   }
// // ) => {
// //   const parser = new DOMParser();
// //   const doc = parser.parseFromString(htmlString, 'text/html');
// //   const tables = doc.querySelectorAll('table');
// //   if (!tables.length) return htmlString;

// //   tables.forEach((table) => {
// //     const title = table.getAttribute("data-title") || "TS";

// //     const rows = Array.from(table.querySelectorAll('tbody tr'));
// //     const headerCells = Array.from(table.querySelectorAll('thead th'));

// //     const pfIndex = headerCells.findIndex(th => th.textContent?.trim().toLowerCase() === 'pass/fail');
// //     const actualResultIndex = headerCells.findIndex(th => th.textContent?.trim().toLowerCase().includes('actual result'));
// //     const attachmentIndex = headerCells.findIndex(th => th.textContent?.trim().toLowerCase().includes('attachment'));
// //     const userIndex = headerCells.findIndex(th => th.textContent?.trim().toLowerCase().includes('test user'));
// //     const initialDateIndex = headerCells.findIndex(th => th.textContent?.trim().toLowerCase().includes('initial/date'));

// //     // Check row completeness
// //     const isRowCompleteArr: boolean[] = rows.map((row, rowIndex) => {
// //       const cells = row.querySelectorAll('td');

// //       // Pass/Fail
// //       const pfName = `pf-result-${title}-${rowIndex}`;
// //       const pf =
// //         formState?.radio?.[pfName] ||
// //         row.querySelector<HTMLInputElement>(`input[type="radio"][name="${pfName}"]:checked`)?.value;

// //       // Actual Result
// //       const arName = `actual-${title}-${rowIndex}`;
// //       const arYesNo =
// //         formState?.radio?.[arName] ||
// //         row.querySelector<HTMLInputElement>(`input[type="radio"][name="${arName}"]:checked`)?.value;

// //       // Initial/Date present?
// //       const initComplete = !!cells[initialDateIndex]?.textContent?.trim();

// //       // Attachment present?
// //       const attachName = `attach-${title}-${rowIndex}`;
// //       const attachOk =
// //         !!(formState?.evidenceFiles?.[attachName] ||
// //           row.querySelector<HTMLInputElement>(`input[name="${attachName}"]`)?.files?.length);

// //       return !!pf && !!arYesNo && initComplete && attachOk;
// //     });

// //     // Row assignment check (still useful for later restrictions)
// //     rows.forEach((row, i) => {
// //       const assignedVal =
// //         (rows[i].querySelector('select') as HTMLSelectElement | null)?.value ?? null;
// //       const isAssignedToCurrentUser = assignedVal === String(currentUserId);
// //       const prevComplete = i === 0 ? true : isRowCompleteArr[i - 1];

// //       // For now, just keeping the calculation — no enable/disable applied
// //       if (isAssignedToCurrentUser && prevComplete && !isRowCompleteArr[i]) {
// //         // placeholder logic (no UI changes yet)
// //       }
// //     });
// //   });

// //   return doc.body.innerHTML;
// // };

// type Role = "Executor" | "Author" | "Reviewer";

// function getRoleFromLocalStorage(): Role {
//   try {
//     const raw = localStorage.getItem("currentUser");
//     const role = raw ? JSON.parse(raw)?.role : null;
//     if (role === "Executor" || role === "Author" || role === "Reviewer") return role;
//   } catch {}
//   return "Reviewer"; // safe default
// }

// function norm(text?: string | null) {
//   // lower, replace nbsp, collapse all whitespace/newlines to single space
//   return (text ?? "")
//     .toLowerCase()
//     .replace(/\u00a0/g, " ")
//     .replace(/\s+/g, " ")
//     .trim();
// }

// export const htmlWithPermissions = (
//   htmlString: string,
//   currentUserId: string,
//   formState?: {
//     radio: Record<string, string>,
//     select: Record<string, string>,
//     checkbox: Record<string, string>,
//     reasons: Record<string, string>,
//     evidenceFiles?: Record<string, any>,
//     initialFiles?: Record<string, any>
//   }
// ) => {
//   const role = getRoleFromLocalStorage();

//   const parser = new DOMParser();
//   const doc = parser.parseFromString(htmlString, "text/html");
//   const tables = doc.querySelectorAll("table");
//   if (!tables.length) return htmlString;

//   tables.forEach((table) => {
//     // If you only want to affect test tables, uncomment next line:
//     // if (!table.hasAttribute("data-title")) return;

//     const rows = Array.from(table.querySelectorAll("tbody tr"));
//     if (!rows.length) return;

//     const headerCells = Array.from(table.querySelectorAll("thead th"));
//     if (!headerCells.length) return;

//     // Build normalized header text list
//     const h = headerCells.map((th) => norm(th.textContent));

//     // Find target columns robustly
//     const pfIndex          = h.findIndex(t => t.includes("pass/fail"));
//     const actualResultIdx  = h.findIndex(t => t.includes("actual result"));
//     const attachmentIdx    = h.findIndex(t => t.includes("attachment"));
//     const initialDateIdx   = h.findIndex(t => t.includes("initial/date"));

//     // If none of the columns exist, skip this table
//     const targetIdxs = [pfIndex, actualResultIdx, attachmentIdx, initialDateIdx].filter(i => i >= 0);
//     if (!targetIdxs.length) return;

//     rows.forEach((row) => {
//       const cells = row.querySelectorAll("td");

//       // 1) Disable EVERYTHING in the row
//       row.querySelectorAll<HTMLElement>("input, select, textarea, button").forEach(el => {
//         el.disabled = true;
//       });
//       cells.forEach(td => {
//         td.classList.add("disabled-td");
//         td.setAttribute("contenteditable", "false");
//       });

//       // 2) Role-specific re-enabling
//       if (role === "Executor") {
//         // Enable ONLY: Actual Result, Attachment, Pass/Fail, Initial/Date
//         targetIdxs.forEach(i => {
//           const td = cells[i];
//           if (!td) return;
//           td.classList.remove("disabled-td");
//           td.setAttribute("contenteditable", "true");
//           td.querySelectorAll<HTMLElement>("input, select, textarea, button").forEach(el => {
//             el.disabled = false;
//           });
//         });
//       } else if (role === "Author") {
//         // Enable everything first…
//         row.querySelectorAll<HTMLElement>("input, select, textarea, button").forEach(el => {
//           el.disabled = false;
//         });
//         cells.forEach(td => {
//           td.classList.remove("disabled-td");
//           td.setAttribute("contenteditable", "true");
//         });

//         // …then disable ONLY the 4 target columns
//         targetIdxs.forEach(i => {
//           const td = cells[i];
//           if (!td) return;
//           td.classList.add("disabled-td");
//           td.setAttribute("contenteditable", "false");
//           td.querySelectorAll<HTMLElement>("input, select, textarea, button").forEach(el => {
//             el.disabled = true;
//           });
//         });
//       } else if (role === "Reviewer") {
//         // Reviewer: keep everything disabled (already done)
//         targetIdxs.forEach(i => {
//           const td = cells[i];
//           if (!td) return;
//           td.classList.remove("disabled-td");
//           td.setAttribute("contenteditable", "true");
//           td.querySelectorAll<HTMLElement>(" button").forEach(el => {
//             el.disabled = false;
//           });
//         });
//       }
//     });
//   });

//   return doc.body.innerHTML;
// };


type Role = 'Executor' | 'Author' | 'Reviewer';

interface FormState {
  radio: Record<string, string>;
  select: Record<string, string>;
  checkbox: Record<string, string>;
  reasons: Record<string, string>;
  evidenceFiles?: Record<string, string>;
  initials?: Record<string, string>;
}

const getRoleFromLocalStorage = (): Role => {
  try {
    // const raw = localStorage.getItem('currentUser');
    // const role = raw ? JSON.parse(raw)?.role : null;
    // if (role === 'Executor' || role === 'Author' || role === 'Reviewer') {
    //   return role;
    // }
    const userrole = Number(localStorage.getItem('ROLE_ID'));
    return userrole == 6? "Author" : userrole == 7? "Reviewer" : userrole == 8? "Executor" : "Reviewer";
  } catch {
    // Handle parsing errors
  }
  return 'Reviewer'; // Default to least permissive role
};

const normalizeText = (text?: string | null): string =>
  (text ?? '').toLowerCase().replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();

export const htmlWithPermissions = (
  htmlString: string,
  currentUserId: string,
  formState?: FormState,
): string => {
  const role = getRoleFromLocalStorage();
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, 'text/html');
  const tables = doc.querySelectorAll('table');

  if (!tables.length) {
    return htmlString;
  }
  const container = document.createElement("div");
  container.innerHTML = htmlString;
  // restore dropdowns
  container.querySelectorAll<HTMLSelectElement>("select[data-selected-user]").forEach(select => {
    const selected = select.getAttribute("data-selected-user");
    if (selected) {
      select.value = selected;
    }
  });

  tables.forEach((table) => {
    const title = table.getAttribute('data-title') || '';
    if (!title) return;

    const rows = Array.from(table.querySelectorAll('tbody tr'));
    if (!rows.length) return;

    const headerCells = Array.from(table.querySelectorAll('thead th'));
    if (!headerCells.length) return;

    const headers = headerCells.map((th) => normalizeText(th.textContent));
    const indices = {
      passFail: headers.findIndex((t) => t.includes('pass/fail')),
      actualResult: headers.findIndex((t) => t.includes('actual result')),
      evidence: headers.findIndex((t) => t.includes('evidence') || t.includes('attachment')),
      initialDate: headers.findIndex((t) => t.includes('initial/date') || t.includes('signature & date')),
      testUser: headers.findIndex((t) => t.includes('test user')),
    };

    const targetIndices = [indices.passFail, indices.actualResult, indices.evidence, indices.initialDate].filter(
      (i) => i >= 0,
    );

    if (!targetIndices.length) return;

    // Determine row completion status
    const isRowComplete = rows.map((row, rowIndex) => {
      const cells = row.querySelectorAll('td');
      const pfName = `pf-result-${title}-${rowIndex}`;
      const arName = `ar-yesno-${title}-${rowIndex}`;
      const evidenceKey = `evidence-${title}-${rowIndex}`;
      const initialKey = `initial-${title}-${rowIndex}`;
      const reasonKey = `reason-${title}-${rowIndex}`;

      const pfValue =
        formState?.radio[pfName] || (row.querySelector(`input[name="${pfName}"]:checked`) as HTMLInputElement)?.value;
      const arValue =
        formState?.radio[arName] || (row.querySelector(`input[name="${arName}"]:checked`) as HTMLInputElement)?.value;
      const evidenceValue =
        formState?.evidenceFiles?.[evidenceKey] || !!cells[indices.evidence]?.querySelector('.uploaded-file');
      const initialValue =
        formState?.initials?.[initialKey] || !!cells[indices.initialDate]?.textContent?.trim();
      const reasonValue =
        arValue === 'no'
          ? formState?.reasons?.[reasonKey] ||
          !!cells[indices.actualResult]?.querySelector(`div[data-reason-name="${reasonKey}"]`)?.textContent?.trim()
          : true;

      return !!pfValue && !!arValue && !!evidenceValue && !!initialValue && !!reasonValue;
    });

    rows.forEach((row, rowIndex) => {
      const cells = row.querySelectorAll('td');

      if (indices.testUser !== -1) {
        const td = cells[indices.testUser];
        let selectEl = td.querySelector(`select[name="user-${title}-${rowIndex}"]`) as HTMLSelectElement | null;

        if (!selectEl) {
          // Build fresh <select> if missing
          const assignedUserId = formState?.select[`user-${title}-${rowIndex}`] || "";
          const options = [
            { id: "", name: "-- Select User --" },
            { id: "2", name: "Phani G" },
            { id: "3", name: "Mounika M" },
            { id: "4", name: "Madhav D" },
            { id: "5", name: "Rakesh Potru" },
            { id: "6", name: "Muni P" },
            { id: "7", name: "Sushma A" },
            { id: "8", name: "Sanath Kumar" },
            { id: "9", name: "Bhavana A" },
            { id: "10", name: "Sowjanya N" },
            { id: "11", name: "Prabhu K" },
            { id: "12", name: "Vasanthi VK" },
          ];

          const select = document.createElement("select");
          select.name = `user-${title}-${rowIndex}`;
          select.disabled = true; // keep default disabled, permissions will re-enable
          select.setAttribute("data-selected-user", assignedUserId);

          options.forEach(opt => {
            const option = document.createElement("option");
            option.value = opt.id;
            option.textContent = opt.name;
            if (opt.id === assignedUserId) {
              option.selected = true;
            }
            select.appendChild(option);
          });

          td.innerHTML = ""; // clear old span
          td.appendChild(select);
        }
      }


      // Restore uploaded files and initials
      if (indices.evidence !== -1 && formState?.evidenceFiles?.[`evidence-${title}-${rowIndex}`]) {
        const fileName = formState.evidenceFiles[`evidence-${title}-${rowIndex}`];
        cells[indices.evidence].innerHTML += `
            <div class="uploaded-file"><a href="/Uploads/${fileName}" target="_blank">${fileName}</a></div>
          `;
      }

      if (indices.initialDate !== -1 && formState?.initials?.[`initial-${title}-${rowIndex}`]) {
        cells[indices.initialDate].innerHTML = `<span>${formState.initials[`initial-${title}-${rowIndex}`]}</span>`;
      }

      const selectName = `user-${title}-${rowIndex}`;
      const assignedUserId =
        formState?.select[selectName] ||
        (row.querySelector(`select[name="${selectName}"]`) as HTMLSelectElement)?.value;

      const selectEl = row.querySelector(`select[name="${selectName}"]`) as HTMLSelectElement | null;

      if (selectEl) {
        // keep data-selected-user in sync
        selectEl.setAttribute("data-selected-user", assignedUserId || "");

        // fix options selection
        selectEl.querySelectorAll("option").forEach(opt => {
          if (opt.value === assignedUserId) {
            opt.setAttribute("selected", "selected");
          } else {
            opt.removeAttribute("selected");
          }
        });
      }
      const isAssignedToCurrentUser = assignedUserId === String(currentUserId);
      // Disable all elements by default
      cells.forEach((td) => {
        td.setAttribute('contenteditable', 'false');
        td.classList.add('disabled-td');
      });
      row.querySelectorAll<HTMLElement>('input, select, textarea, button').forEach((el) => {
        el.disabled = true;
      });

      // Apply role-based permissions

      // --- AUTHOR ---
      if (role === "Author") {
        cells.forEach((td, index) => {
          if (!targetIndices.includes(index)) {
            td.classList.remove("disabled-td");
            td.setAttribute("contenteditable", "true");
            td.querySelectorAll<HTMLElement>("input, select, textarea").forEach(el => {
              el.disabled = false;
            });
          }
        });

        // ✅ enable Sign Off if assigned
        if (indices.initialDate !== -1) {
          const td = cells[indices.initialDate];
          const btn = td.querySelector("button.signoff-btn") as HTMLButtonElement | null;
          if (btn && isAssignedToCurrentUser) {
            td.classList.remove("disabled-td");
            btn.disabled = false;
            btn.style.pointerEvents = "auto";
            btn.style.opacity = "1";
          }
        }
      }

      // // --- EXECUTOR ---
      // else if (role === "Executor" && isAssignedToCurrentUser) {
      //   const isPrevComplete = rowIndex === 0 || isRowComplete[rowIndex - 1];
      //   // const isCurrentComplete = isRowComplete[rowIndex];

      //   // // 🔒 If this row is already complete → lock it
      //   // if (isCurrentComplete) {
      //   //   row.querySelectorAll<HTMLElement>('input, select, textarea, button').forEach(el => {
      //   //     el.disabled = true;
      //   //   });
      //   // }

      //   // // 🔓 If previous row is complete and this one is not → enable it
      //   // if (isPrevComplete && !isCurrentComplete) {
      //   //   targetIndices.forEach(index => {
      //   //     const td = cells[index];
      //   //     td.classList.remove("disabled-td");
      //   //     td.setAttribute("contenteditable", "true");
      //   //     td.querySelectorAll<HTMLElement>("input, button").forEach(el => {
      //   //       el.disabled = false;
      //   //     });
      //   //   });

      //   //   // ✅ also enable Sign Off
      //   //   if (indices.initialDate !== -1) {
      //   //     const td = cells[indices.initialDate];
      //   //     const btn = td.querySelector("button.signoff-btn") as HTMLButtonElement | null;
      //   //     if (btn) {
      //   //       td.classList.remove("disabled-td");
      //   //       btn.disabled = false;
      //   //       btn.style.pointerEvents = "auto";
      //   //       btn.style.opacity = "1";
      //   //     }
      //   //   }
      //   // }

      //   // 🔒 If current row is signed → lock it
      //   if (row.getAttribute("data-signed") === "true") {
      //     row.querySelectorAll<HTMLElement>("input, select, textarea, button").forEach(el => {
      //       el.disabled = true;
      //     });
      //     return; // skip to next row
      //   }

      //   // 🔓 Enable if prev row is signed and assigned to current user
      //   const prevRow = row.previousElementSibling as HTMLTableRowElement | null;
      //   const prevSigned = !prevRow || prevRow.getAttribute("data-signed") === "true";
      //   const isAssignedToCurrentUser = String(assignedUserId) === String(currentUserId);


      //   if (isAssignedToCurrentUser && prevSigned) {
      //     targetIndices.forEach(index => {
      //       const td = cells[index];
      //       td.classList.remove("disabled-td");
      //       td.setAttribute("contenteditable", "true");
      //       td.querySelectorAll<HTMLElement>("input, button").forEach(el => {
      //         el.disabled = false;
      //       });
      //     });

      //     // ✅ enable Sign Off button
      //     if (indices.initialDate !== -1) {
      //       const td = cells[indices.initialDate];
      //       const btn = td.querySelector("button.signoff-btn") as HTMLButtonElement | null;
      //       if (btn) {
      //         td.classList.remove("disabled-td");
      //         btn.disabled = false;
      //         btn.style.pointerEvents = "auto";
      //         btn.style.opacity = "1";
      //       }
      //     }
      //   }
      // }

      else if (role === "Executor" && isAssignedToCurrentUser) {
        if (row.getAttribute("data-signed") === "true") {
          row.querySelectorAll<HTMLElement>("input, select, textarea").forEach(el => {
            el.disabled = true;
          });
          return; // skip to next row
        }

        // 🔓 Enable if first row OR prev row signed
        const isFirstRow = rowIndex === 0;
        const prevRow = row.previousElementSibling as HTMLTableRowElement | null;
        const prevSigned = isFirstRow || (prevRow && prevRow.getAttribute("data-signed") === "true");

        if (isAssignedToCurrentUser && prevSigned) {
          // enable editable cells
          targetIndices.forEach(index => {
            const td = cells[index];
            td.classList.remove("disabled-td");
            td.setAttribute("contenteditable", "true");
            td.querySelectorAll<HTMLElement>("input, button, select, textarea").forEach(el => {
              el.disabled = false;
            });
          });

          // ✅ Always enable Sign Off button if found
          const signOffBtn = row.querySelector("button.signoff-btn, button") as HTMLButtonElement | null;
          if (signOffBtn) {
            signOffBtn.disabled = false;
            signOffBtn.style.pointerEvents = "auto";
            signOffBtn.style.opacity = "1";
            signOffBtn.classList.remove("disabled-td");
          }
        }
      }
      // --- REVIEWER ---
      else if (role === "Reviewer") {
        if (isAssignedToCurrentUser && indices.initialDate !== -1) {
          const td = cells[indices.initialDate];
          const btn = td.querySelector("button.signoff-btn") as HTMLButtonElement | null;
          if (btn) {
            td.classList.remove("disabled-td");
            btn.disabled = false;
            btn.style.pointerEvents = "auto";
            btn.style.opacity = "1";
          }
        }
      }
    });
  });
  
  return doc.body.innerHTML;
};