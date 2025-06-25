// import createCsvWriter from 'csv-writer';
import Papa from 'papaparse';

export const download = (format, data = [], dl_name = false) => {
  let content, type, fileExt;

  if (! dl_name) {dl_name = 'export';}

  // Collect all unique columns from the data
  const columns = data.reduce((acc, row) => {
    Object.keys(row).forEach(key => {
      if (!acc.includes(key)) acc.push(key);
    });
    return acc;
  }, []);

  console.log('columns', columns);

  switch (format) {
    case 'csv':
      const csvData = Papa.unparse(data, {
        quotes: false,
        quoteChar: '"',
        escapeChar: '"',
        delimiter: ",",
        header: true,
        newline: "\r\n",
        skipEmptyLines: false,
        columns: columns
      });
      content = csvData;
      type = 'text/csv';
      fileExt = 'csv';
      break;
  
    case 'xml':
      // Create XML content
      content = `<?xml version="1.0" encoding="UTF-8"?>\n<data>\n${
        data.map(row => {
          const escapedName = row.name.replace(/&/g, '&amp;');
          return `<item>\n${
            columns.map(col => {
              if (! col || col == '') {col = 'unknown';}
              return `<${col}>${escapedName || ''}</${col}>`;
            }).join('\n')}\n</item>`;
        }).join('\n')
      }\n</data>`;
      type = 'application/xml';
      fileExt = 'xml';
      break;

    case 'json':
      // Create JSON content
      content = JSON.stringify(data, null, 2);
      type = 'application/json';
      fileExt = 'json';
      break;

    default:
      console.error('Unsupported format');
      return;
  }

  // Create the download link
  if (content && type && fileExt) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.target = '_self';
    link.download = `${dl_name}.${fileExt}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } else {
    alert('Failed to export data');
  }
}
