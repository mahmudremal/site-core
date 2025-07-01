import React, { useState, useEffect } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import 'pdfjs-dist/legacy/build/pdf.worker.mjs';
import { Trash2 } from 'lucide-react';
import { __ } from '@js/utils';
import { sprintf } from 'sprintf-js';
import { Popup } from '@js/utils';
import { sleep } from '@functions';
import api from './API';

const PDFTableExtractor = () => {
  const [loading, setLoading] = useState(false);
  const [tables, setTables] = useState([]);
  const [popup, setPopup] = useState(null);

  const mostCommonLength = (data) => {
    const lengthCount = data.reduce((countMap, item) => {
      const len = item.length;
      countMap[len] = (countMap[len] || 0) + 1;
      return countMap;
    }, {});

    return Object.keys(lengthCount).reduce((a, b) => {
      return lengthCount[a] > lengthCount[b] ? a : b;
    });
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);

    const reader = new FileReader();

    reader.onload = async (e) => {
      const typedArray = new Uint8Array(e.target.result);
      const pdf = await pdfjsLib.getDocument({ data: typedArray }).promise;
      const allTables = [];

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const content = await page.getTextContent();
        const items = content.items.map(item => ({
          text: item.str.trim(),
          x: item.transform[4],
          y: item.transform[5],
        })).filter(i => i.text.length > 0);

        // Group items by rows (Y axis)
        const rowMap = new Map();
        const rowTolerance = 3;

        items.forEach(({ x, y, text }) => {
          const yKey = [...rowMap.keys()].find(k => Math.abs(k - y) < rowTolerance);
          const finalY = yKey !== undefined ? yKey : y;
          if (!rowMap.has(finalY)) rowMap.set(finalY, []);
          rowMap.get(finalY).push({ x, text });
        });

        const sortedRows = [...rowMap.entries()]
          .sort((a, b) => b[0] - a[0]) // top-down
          .map(([_, row]) => row.sort((a, b) => a.x - b.x));

        // Group text by column clusters using X thresholds
        const colTolerance = 10;
        const table = sortedRows.map(row => {
          const columns = [];
          row.forEach(({ x, text }) => {
            const lastCol = columns[columns.length - 1];
            if (lastCol && Math.abs(lastCol.x - x) < colTolerance) {
              lastCol.text += ' ' + text;
            } else {
              columns.push({ x, text });
            }
          });
          return columns.map(c => c.text.trim());
        });

        if (table.length > 0) allTables.push(table);
      }

      setTables(
        allTables.map(table => 
          table.filter(item => item.length === Number(mostCommonLength(table)))
        )
      );
      setLoading(false);
    };

    reader.readAsArrayBuffer(file);
  };

  const handleDeleteRow = (tableIndex, rowIndex) => {
    const updatedTables = [...tables];
    updatedTables[tableIndex].splice(rowIndex, 1);
    setTables(updatedTables);
  };

  const ProcessImport = ({ table: initialTable }) => {
    const [error, setError] = useState(null);
    const [progress, setProgress] = useState(0);
    const [table, setTable] = useState(initialTable.slice(1));
    const [processing, setProcessing] = useState(true);
    const [columnNames, setColumnNames] = useState(
      (initialTable?.[0]??[]).map(column => ({label: column, table_column: column.toString().toLowerCase().replaceAll(' ', '_')}))
    );

    useEffect(() => {
      // Simulate loading by increasing the progress percentage
      const progressInterval = setInterval(() => {
        setProgress((oldProgress) => {
          if (oldProgress === 100) {
            clearInterval(progressInterval);
            setProcessing(false);
            return oldProgress;
          }
          return Math.min(oldProgress + 20, 100);
        });
      }, 1000); // Update progress every second

      return () => clearInterval(progressInterval);
    }, []);

    const handleColumnNameEdit = (index, newLabel) => {
      setColumnNames((oldNames) => {
        const newNames = [...oldNames];
        newNames[index].table_column = newLabel;
        return newNames;
      });
    };


    if (processing) {
      return (
        <div className="xpo_flex xpo_items-center xpo_justify-center">
          <div className="xpo_w-1/2 xpo_max-w-md xpo_bg-white xpo_p-6 xpo_rounded-lg">
            <div className="xpo_relative xpo_h-2.5 xpo_bg-gray-200 xpo_round-md">
              <div
                className="xpo_absolute xpo_h-full xpo_bg-blue-500 xpo_round-md"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="xpo_text-center xpo_mt-2 xpo_text-gray-700">
              {__('Preparing the import table for database readiness...')}
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="xpo_p-6 xpo_bg-white xpo_rounded-lg xpo_max-h-[90vh] xpo_overflow-auto">
        <h2 className="xpo_text-lg xpo_font-bold xpo_mb-4">{__('Column Mapping')}</h2>
        <div className="xpo_grid xpo_grid-cols-2 xpo_gap-4 xpo_mb-6">
          {columnNames.map((column, index) => (
            <div key={index} className="xpo_flex xpo_items-center">
              <span className="xpo_w-1/2">{column.label}</span>
              <span
                className="xpo_w-1/2 xpo_border-b xpo_border-gray-300 xpo_cursor-pointer"
                onDoubleClick={() => {
                  const newLabel = prompt(__('Edit column label:'), column.table_column);
                  if (newLabel) {handleColumnNameEdit(index, newLabel);}
                }}
              >{column.table_column}</span>
            </div>
          ))}
        </div>
        
        {error ? (
          <div className="xpo_flex xpo_items-center xpo_p-4 xpo_mb-4 xpo_text-red-800 xpo_rounded-lg xpo_bg-red-50 dark:xpo_bg-gray-800 dark:xpo_text-red-400" role="alert">
            <svg className="xpo_shrink-0 xpo_w-4 xpo_h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20"><path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z"/></svg>
            <span className="xpo_sr-only">{__('Error')}</span>
            <div className="xpo_ms-3 xpo_text-sm xpo_font-medium">{error}</div>
            <button
              type="button"
              aria-label={__('Close')}
              onClick={(e) => setError(null)}
              className="xpo_ms-auto xpo_-mx-1.5 xpo_-my-1.5 xpo_bg-red-50 xpo_text-red-500 xpo_rounded-lg focus:xpo_ring-2 focus:xpo_ring-red-400 xpo_p-1.5 hover:xpo_bg-red-200 xpo_inline-flex xpo_items-center xpo_justify-center xpo_h-8 xpo_w-8 dark:xpo_bg-gray-800 dark:xpo_text-red-400 dark:hover:xpo_bg-gray-700"
            >
              <span className="xpo_sr-only">{__('Close')}</span>
              <svg className="xpo_w-3 xpo_h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/></svg>
            </button>
          </div>
        ) : null}

        <div className="xpo_flex xpo_space-x-4 xpo_my-6 xpo_justify-end">
          <button className="xpo_bg-red-500 xpo_text-white xpo_px-4 xpo_py-2 xpo_rounded hover:xpo_bg-red-600" onClick={(e) => confirm('Sure to cancelled operation?') && sleep(100).then(res => e.target.innerHTML = __('Cancelling...')).then(async res => await sleep(3000)).then(res => setPopup(null))}>{__('Cancel Operation')}</button>
          <button
            onClick={(e) => confirm(__('Data import operation has been triggered! Are you sure to proceed now?')) && sleep(100).then(res => setError(null)).then(res => {e.target.innerHTML = __('Processing. Please wait...');e.target.disabled = true;}).then(async res => await api.post('hunts/bulk_import', {csv_data: JSON.stringify([columnNames.map(r => r.label), ...table])}).then(res => res.data).then(async res => await sleep(3000))).catch(err => sleep(2000).then(res => setError(err?.response?.data?.message??err?.data?.data?.message??err?.data?.message??err?.data??err?.message??__('Something went wrong!')))).finally(() => {e.target.innerHTML = __('Operation Finished');e.target.disabled = false;})}
            className="xpo_bg-blue-500 xpo_text-white xpo_px-4 xpo_py-2 xpo_rounded hover:xpo_bg-blue-600"
          >{__('Run Operation')}</button>
        </div>

        <h2 className="xpo_text-lg xpo_font-bold xpo_mb-4">{__('Data Table')}</h2>
        <table className="xpo_min-w-full xpo_divide-y xpo_divide-gray-200">
          <thead>
            <tr>
              {columnNames.map(({ label }, index) => <th key={index} className="xpo_px-4 xpo_py-2 xpo_text-gray-700 xpo_bg-gray-100 xpo_text-start">{label}</th>)}
            </tr>
          </thead>
          <tbody>
            {table.map((row, rowIndex) => (
              <tr key={rowIndex} className="xpo_even:bg-gray-50">
                {Object.values(row).map((value, colIndex) => (
                  <td key={colIndex} className="xpo_px-4 xpo_py-2 xpo_border-b xpo_border-gray-200 xpo_text-start">{value}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

      </div>
    );
  };

  
  return (
    <div className="xpo_container xpo_mx-auto xpo_p-4 xpo_max-w-full xpo_bg-white xpo_rounded-lg xpo_shadow-lg xpo_overflow-x-auto">
      <h1 className="xpo_text-2xl xpo_font-bold xpo_mb-4">{__('Smart PDF Table Extractor')}</h1>
      <input type="file" accept="application/pdf" onChange={handleFileChange} className="xpo_block xpo_border xpo_border-gray-300 xpo_rounded-md xpo_shadow-sm xpo_py-2 xpo_px-4 xpo_mb-4" />

      {loading && (
        <div className="xpo_flex xpo_items-center xpo_justify-center xpo_p-4">
          <div className="xpo_loader xpo_animate-spin xpo_border-4 xpo_border-blue-500 xpo_border-t-transparent xpo_rounded-full xpo_w-5 xpo_h-5"></div>
          <span className="xpo_ml-2 xpo_text-gray-700">{__('Loading PDF, please wait...')}</span>
        </div>
      )}

      {tables.length > 0 && (
        <div className="xpo_overflow-x-auto xpo_flex xpo_flex-col xpo_gap-8">
          <h2 className="xpo_text-xl xpo_font-semibold xpo_mt-4">{__('Extracted Tables')}</h2>
          {tables.map((table, tableIndex) => (
            <div key={tableIndex} className="xpo_flex xpo_flex-col xpo_gap-3">
              <div className="xpo_flex xpo_flex-wrap xpo_gap-3 xpo_justify-between xpo_items-center">
                <h3 className="xpo_text-lg font-semibold">{sprintf(__('Table #%d'), (tableIndex + 1))}</h3>
                <div className="xpo_flex xpo_gap-2 xpo_items-center">
                  <button
                    type="button"
                    onClick={(e) => setPopup(<ProcessImport table={table} />)}
                    className="xpo_border xpo_border-2 xpo_flex xpo_items-center xpo_justify-center xpo_px-3 xpo_py-2 xpo_rounded xpo_shadow-md"
                  >{__('Proceed')}</button>
                </div>
              </div>
              <table className="xpo_min-w-full xpo_border-collapse xpo_border xpo_border-gray-300 xpo_text-sm">
                <tbody>
                  {table.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {row.map((cell, cellIndex) => (
                        <td
                          key={cellIndex}
                          className="xpo_border xpo_border-gray-300 xpo_py-1 xpo_px-2 xpo_whitespace-nowrap"
                          onDoubleClick={(e) => {
                            e.preventDefault();
                            const newValue = prompt(__('Edit Cell:'), cell);
                            if (newValue !== null) {
                              const updatedTables = [...tables];
                              updatedTables[tableIndex][rowIndex][cellIndex] = newValue;
                              setTables(updatedTables);
                            }
                          }}
                        >
                          {cell}
                        </td>
                      ))}
                      <td className="xpo_p-2">
                        <Trash2
                          size={16}
                          type="button"
                          title={__('Remove row')}
                          className="xpo_text-red-500 xpo_cursor-pointer"
                          onClick={() => confirm(__('Are you sure about deleting the row?')) && handleDeleteRow(tableIndex, rowIndex)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
      {popup ? (
        <div className="xpo_absolute xpo_top-0 xpo_left-0 xpo_h-full xpo_w-full xpo_bg-dark/200 xpo_z-[9999]">
          <Popup onClose={() => setPopup(null)}>{popup}</Popup>
        </div>
      ) : null}
    </div>
  );
};


export default PDFTableExtractor;