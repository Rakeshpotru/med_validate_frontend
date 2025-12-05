export const jsonToHtml = (data: any): string => {
  const capitalize = (str: string) =>
    str.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  let html = '';

  for (const key in data) {
    const value = data[key];

    if (key === 'document_title') {
      html += `<h1 style="text-align:center;">${value}</h1>`;
      continue;
    }

    html += `<h2>${capitalize(key)}</h2>`;

    if (typeof value === 'string' || typeof value === 'number') {
      html += `<p>${value}</p>`;
    } else if (Array.isArray(value)) {
      if (value.length > 0 && typeof value[0] === 'object') {
        html += 
          `<table border="1" cellpadding="6" cellspacing="0" width="100%">
            <thead>
              <tr>
                ${Object.keys(value[0])
                  .map((col) => `<th>${capitalize(col)}</th>`)
                  .join('')}
              </tr>
            </thead>
            <tbody>
              ${value
                .map(
                  (row: any) => 
                `<tr>
                  ${Object.values(row)
                    .map((cell) =>
                      typeof cell === 'boolean'
                        ? `<td>
                            <select data-type="boolean">
                              <option value="true" ${cell ? 'selected' : ''}>Yes</option>
                              <option value="false" ${!cell ? 'selected' : ''}>No</option>
                            </select>
                          </td>`
                        : `<td>${cell ?? ''}</td>`
                    )
                    .join('')}
                </tr>`
                )
                .join('')}
            </tbody>
          </table>`;
      }
    } else if (typeof value === 'object' && value !== null) {
      const entries = Object.entries(value);

      // When values are objects, assume table format
      if (entries.length > 0 && typeof entries[0][1] === 'object') {
        const firstRow = entries[0][1] as any;
        html += 
          `<table border="1" cellpadding="6" cellspacing="0" width="100%">
            <thead>
              <tr>
                ${Object.keys(firstRow)
                  .map((col) => `<th>${capitalize(col)}</th>`)
                  .join('')}
              </tr>
            </thead>
            <tbody>
              ${entries
                .map(([_, obj]: any) => 
                  `<tr>
                    ${Object.values(obj)
                      .map((val: any) =>
                        typeof val === 'boolean'
                          ? `<td>
                              <select data-type="boolean">
                                <option value="true" ${val ? 'selected' : ''}>Yes</option>
                                <option value="false" ${!val ? 'selected' : ''}>No</option>
                              </select>
                            </td>`
                          : `<td>${val ?? ''}</td>`
                      )
                      .join('')}
                  </tr>`
                )
                .join('')}
            </tbody>
          </table>`;
      } else {
        // For simple key/value objects, check for booleans as well.
        html += 
          `<ul>
            ${entries
              .map(([k, v]) => {
                if (typeof v === 'boolean') {
                  return `<li><strong>${capitalize(k)}:</strong>
                    <select data-type="boolean">
                      <option value="true" ${v ? 'selected' : ''}>Yes</option>
                      <option value="false" ${!v ? 'selected' : ''}>No</option>
                    </select>
                  </li>`;
                } else {
                  return `<li><strong>${capitalize(k)}:</strong> ${v}</li>`;
                }
              })
              .join('')}
          </ul>`;
      }
    }
  }

  return html;
};