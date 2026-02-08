import { __ } from './utils';
import { createPopper } from '@popperjs/core';
import { useState, useEffect, useRef } from 'react';
import { Bold, Italic, List, Heading1, Heading2, Heading3, Heading4, Heading5, Heading6, ListOrdered as NumberedList, Heading, Type } from 'lucide-react';

const InlineEditor = ({ content: [content, setContent] }) => {
    const [toolbarVisible, setToolbarVisible] = useState(false);
    const [selectedTags, setSelectedTags] = useState([]);
    const editorRef = useRef(null);
    const toolbarRef = useRef(null);

    const markHighlight = (range) => {
        const selectedText = range.toString();
        const parent = range.commonAncestorContainer.nodeType === Node.TEXT_NODE ? range.commonAncestorContainer.parentNode : range.commonAncestorContainer;
        if (parent.classList.contains('highlight')) return; // Avoid highlighting if already highlighted

        const highlightSpan = document.createElement('span');
        highlightSpan.classList.add('bg-primary', 'text-white');
        highlightSpan.textContent = selectedText;

        range.deleteContents();
        range.insertNode(highlightSpan);
        return highlightSpan;
    };

    const closestElems = () => {
        if (!typeof window?.getSelection) { return; }
        const _selected = window.getSelection();
        const range = _selected.rangeCount > 0 ? _selected.getRangeAt(0) : null;
        const treeElements = [];

        // Check if we have a valid range
        if (range) {
            let parent = range.startContainer;
            let count = 0; // Counter for valid parent elements

            // Add the initial node if it's one of the specified types
            if (parent?.tagName && ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'b', 'i', 'ul', 'ol'].includes(parent.tagName?.toLowerCase())) {
                treeElements.push(parent.tagName.toLowerCase());
                count++;
            }

            // Traverse up the DOM tree, but only up to 5 valid parent elements
            while (parent && count < 5) {
                parent = parent.parentNode;

                // Check node type and update the elements array
                if (parent?.tagName && ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'b', 'i', 'ul', 'ol'].includes(parent.tagName?.toLowerCase())) {
                    treeElements.push(parent.tagName.toLowerCase());
                    count++;
                }
            }
        }

        return treeElements;
    };

    const handleMouseUp = () => {
        if (!typeof window?.getSelection) { return; }
        const _selected = window.getSelection();
        if (_selected.rangeCount > 0 && _selected.toString().length > 0) {
            const range = _selected.getRangeAt(0);
            const { top, left, height } = range.getBoundingClientRect();
            toolbarRef.current.style.top = `${top + window.scrollY + height + 5}px`;
            toolbarRef.current.style.left = `${left + window.scrollX}px`;
            setToolbarVisible(true);
            // if (!toolbarVisible) {setToolbarVisible(true);}
            // setSelectedTags(closestElems());
            toolbarRef.current.querySelectorAll('button.toolactive').forEach(elem => elem.classList.remove('toolactive'));
            closestElems().forEach(elem =>
                toolbarRef.current.querySelectorAll('button[data-element]').forEach(btn => btn && btn.dataset.element == elem && btn.classList.add('toolactive'))
            );
        } else {
            setToolbarVisible(false);
            // if (toolbarVisible) {setToolbarVisible(false);}
        }
    };

    useEffect(() => {
        const container = editorRef.current;
        container.addEventListener('mouseup', handleMouseUp);
        return () => container.removeEventListener('mouseup', handleMouseUp);
    }, []);

    const executeCommand = (command) => {
        if (!typeof window?.getSelection) { return; }
        const _selected = window.getSelection();
        if (_selected.rangeCount > 0 && _selected.toString().length > 0) {
            const range = _selected.getRangeAt(0);
            document.execCommand(command);

            if (command === 'bold' || command === 'italic') {
                markHighlight(range);
            }

            const updatedTextNodes = getTextNodesUnderNode(range.startContainer.parentNode);
            for (const node of updatedTextNodes) {
                if (node.nodeType === Node.TEXT_NODE) {
                    const index = node.textContent.indexOf(range.toString());
                    if (index !== -1) {
                        const newRange = document.createRange();
                        newRange.setStart(node, index);
                        newRange.setEnd(node, index + range.toString().length);
                        _selected.removeAllRanges();
                        _selected.addRange(newRange);
                        break;
                    }
                }
            }
        }
    };

    const getTextNodesUnderNode = (node) => {
        const textNodes = [];
        const getTextNodes = (node) => {
            if (node.nodeType === Node.TEXT_NODE) {
                textNodes.push(node);
            } else {
                node.childNodes.forEach(getTextNodes);
            }
        };
        getTextNodes(node);
        return textNodes;
    };

    const Headings = () => {
        const [isOpen, setIsOpen] = useState(false);
        const buttonRef = useRef(null);
        const dropdownRef = useRef(null);
        const headingMap = {
            h1: <Heading1 size={20} />,
            h2: <Heading2 size={20} />,
            h3: <Heading3 size={20} />,
            h4: <Heading4 size={20} />,
            h5: <Heading5 size={20} />,
            h6: <Heading6 size={20} />,
            p: <Type size={20} />
        };
        const headingMapLabels = {
            h1: __('Heading 1'),
            h2: __('Heading 2'),
            h3: __('Heading 3'),
            h4: __('Heading 4'),
            h5: __('Heading 5'),
            h6: __('Heading 6'),
            p: __('Text')
        };

        const SelectedHeading = ({ tags }) => {
            const tag = tags.find(t => headingMapLabels[t]);
            return headingMap[tag] || headingMap.p;
        };

        useEffect(() => {
            let popperInstance = null;
            if (isOpen && buttonRef.current && dropdownRef.current) {
                popperInstance = createPopper(buttonRef.current, dropdownRef.current, {
                    placement: 'bottom-start',
                    modifiers: [{
                        name: 'offset',
                        options: { offset: [0, 8] }
                    }]
                });
            }
            return () => popperInstance?.destroy();
        }, [isOpen]);

        return (
            <div ref={buttonRef} className="flex gap-1">
                <button type="button" onClick={(e) => setIsOpen(prev => !prev)} className="mx-1 flex gap-2 items-center">
                    <div className="flex gap-1 items-center">
                        <SelectedHeading tags={selectedTags} />
                        <span className="leading-[0]">{headingMapLabels[selectedTags] || headingMapLabels.p}</span>
                    </div>
                    <svg className={`w-2.5 h-2.5 ${isOpen ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4" />
                    </svg>
                </button>
                <div ref={dropdownRef} className={`absolute z-10 bg-white divide-y divide-gray-100 rounded-lg shadow-sm dark:bg-gray-700 ${!isOpen ? 'hidden' : 'block'}`}>
                    <div className="p-2 text-sm text-gray-700 dark:text-gray-200 flex flex-col gap-2 min-w-28">
                        {['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'].map((tag, i) => (
                            <button key={i} data-element={tag} className="flex gap-2 items-center" onClick={(e) => {
                                e.preventDefault();
                                executeCommand('formatBlock', tag);
                                setSelectedTags(prev => !prev.includes(tag) ? [...prev, tag] : prev);
                            }}>
                                <SelectedHeading tags={[tag]} />
                                <span className="leading-[0]">{headingMapLabels[tag] || headingMapLabels.p}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="relative">
            <div
                ref={editorRef}
                contentEditable
                onInput={(e) => setContent(e.target.innerHTML)}
                dangerouslySetInnerHTML={{ __html: content }}
                className="border border-gray-300 min-h-[200px] p-2"
            />
            <div
                ref={toolbarRef}
                onClick={(e) => e.stopPropagation()}
                onMouseUp={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                className={`floating-toolbar fixed bg-white border border-gray-300 rounded p-2 z-[999] flex flex-nowrap gap-2 ${toolbarVisible ? '' : 'hidden'}`}
            >
                <button data-element={'b'} onClick={(e) => {
                    e.preventDefault();
                    executeCommand('bold');
                    setSelectedTags(prev => !prev.includes('b') ? [...prev, 'b'] : prev);
                }} className={`mx-1`}>
                    <Bold size={20} />
                </button>
                <button data-element={'i'} onClick={(e) => {
                    e.preventDefault();
                    executeCommand('italic');
                    setSelectedTags(prev => !prev.includes('i') ? [...prev, 'i'] : prev);
                }} className={`mx-1`}>
                    <Italic size={20} />
                </button>
                <button data-element={'ol'} onClick={(e) => {
                    e.preventDefault();
                    executeCommand('insertOrderedList');
                    setSelectedTags(prev => !prev.includes('ol') ? [...prev, 'ol'] : prev);
                }} className={`mx-1`}>
                    <NumberedList size={20} />
                </button>
                <button data-element={'ul'} onClick={(e) => {
                    e.preventDefault();
                    executeCommand('insertUnorderedList');
                    setSelectedTags(prev => !prev.includes('ul') ? [...prev, 'ul'] : prev);
                }} className={`mx-1`}>
                    <List size={20} />
                </button>
                <Headings />
            </div>
        </div>
    );
};

export default InlineEditor;