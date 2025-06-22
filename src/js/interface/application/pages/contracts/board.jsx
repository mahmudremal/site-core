import React, { use, useEffect, useRef, useState } from "react";
import { home_url, rest_url, notify, strtotime } from "@functions";
import request from "@common/request";
import { Link } from '@common/link';
import { usePopup } from '@context/PopupProvider';
import { useTranslation } from '@context/LanguageProvider';
import { useSession } from '@context/SessionProvider';
import { useParams } from "react-router-dom";
import { AlignLeft, CalendarDays, CirclePlus, Copy, EllipsisVertical, ListTodo, MessagesSquare, Paperclip, Send, SquareCheckBig, SquarePen, Tag, Trash2, User, UserMinus, UserPlus } from "lucide-react";
import { createPopper } from '@popperjs/core';
import { EditorProvider, DefaultEditor as Editor } from 'react-simple-wysiwyg';

export default function Contract_Board() {
    const { __ } = useTranslation();
    const { setPopup } = usePopup();
    const { contract_id } = useParams();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [project, setProject] = useState({columns: []});

    const onUpdateColumn = (data) => {
        setProject(prev => ({...prev, columns: prev.columns.map(col => col.id === data.id ? data : col)}));
        return Promise.resolve(true);
    };
    const onDeleteColumn = (data) => {
        setProject(prev => ({...prev, columns: prev.columns.filter(col => col.id !== data.id)}));
        return Promise.resolve(true);
    };
    const onAddColumn = (data) => {
        setProject(prev => ({...prev, columns: [...prev.columns, data]}));
        return Promise.resolve(true);
    };
    
    
    const fetchContract = () => {
        // Simulate an API call to fetch contracts
        request(rest_url(`/sitecore/v1/contracts/${contract_id}`), {headers: {'Cache-Control': 'no-cache'}})
        .then(data => {
            const { contract, columns } = data;
            if (!contract) {return notify.error(__('No contract found!'))}
            setProject({...contract, columns: columns});
            // request(rest_url(`/sitecore/v1/contracts/${contract_id}/columns`), {headers: {'Cache-Control': 'no-cache'}})
            // .then(columns => {
            //     const { columns: contract_columns } = columns;
            //     if (!contract_columns) {return notify.error(__('No contract columns found!'))}
            //     setProject(prev => ({...prev, columns: contract_columns}));
            //     request(rest_url(`/sitecore/v1/contracts/${contract_id}/cards`), {headers: {'Cache-Control': 'no-cache'}})
            //     .then(cards => {
            //         const { cards: contract_cards } = cards;
            //         if (!contract_cards) {return notify.error(__('No contract cards found!'))}
            //         setProject(prev => ({...prev, cards: contract_cards}));
            //     });
            // });
        })
        .catch(err => notify.error(err?.response?.message??err?.message??__('Something went wrong!')))
        .finally(() => setLoading(false));
        request(rest_url(`/sitecore/v1/contracts/${contract_id}/members`), {method: 'GET', headers: {'Cache-Control': 'no-cache'}}).then(res => setUsers(res.map(u => ({...u, id: parseInt(u.id)})))).catch(e => request.error_notify(e, __));
    }

    const whether_empty = (text, empty) => {
        return text === '' || !text ? empty : text;
    }

    const get_users = (user_id = false) => {
        if (user_id) {
            return users.find(user => user.id === user_id);
        }
        return users;
    }

    useEffect(() => {
        fetchContract();
    }, []);
    
    return (
        <div className="w-full">
            <div className="p-4">
                {/* here you'll implement trello like Kanban board. */}
                <div className="overflow-x-auto scroll-sm xpo_pb-8">
                    <div className="kanban-wrapper">
                        <div className="xpo_flex align-items-start xpo_gap-24" id="sortable-wrapper">
                            {project?.columns?.map((column, columnIndex) => (
                                <SingleColumn
                                    key={columnIndex}
                                    data={column}
                                    __={__}
                                    setPopup={setPopup}
                                    empty={whether_empty}
                                    setProject={setProject}
                                    hooks={{
                                        onUpdateColumn,
                                        onDeleteColumn,
                                        onAddColumn,
                                        get_users
                                    }}
                                />
                            ))}
                            <div className="w-25 kanban-item radius-12 overflow-hidden">
                                <div className="card xpo_p-0 radius-12 overflow-hidden shadow-none">
                                    <div className="card-body xpo_p-24">
                                        <button
                                            type="button"
                                            className="add-kanban flex xpo_items-center xpo_gap-2 fw-medium xpo_w-100 xpo_text-primary-600 xpo_justify-content-center xpo_text-hover-primary-800 line-height-1"
                                            onClick={() => setProject(prev => ({...prev, columns: [...prev.columns, {id: null, contract_id: contract_id, title: '', sort_order: prev.columns.length, cards: []}]}))}
                                        >
                                            <CirclePlus className="icon xpo_text-xl flex" /> 
                                            {__('Add Column')}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/*  */}
            </div>
        </div>
    )
}


const EditCard = ({data, onUpdateCard, __, setPopup}) => {
    const [loading, setLoading] = useState(null);
    const [card, setCard] = useState(data);
    
    return (
        <div>
            <h6 className="modal-title xpo_text-xl xpo_mb-0">{__('Add New Task')}</h6>
            <div>
                <form id="taskForm">
                    <input type="hidden" id="editTaskId" value="" />
                    <div className="mb-3">
                        <label htmlFor="taskTitle" className="form-label fw-semibold xpo_text-primary-light xpo_text-sm xpo_mb-8">{__('Title')}</label>
                        <input type="text" className="form-control" placeholder="Enter card Title " id="taskTitle" required />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="taskTag" className="form-label fw-semibold xpo_text-primary-light xpo_text-sm xpo_mb-8">{__('Tag')}</label>
                        <input type="text" className="form-control" placeholder="Enter tag" id="taskTag" required />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="startDate" className="form-label fw-semibold xpo_text-primary-light xpo_text-sm xpo_mb-8">{__('Start Date')}</label>
                        <input type="date" className="form-control" id="startDate" required />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="taskDescription" className="form-label fw-semibold xpo_text-primary-light xpo_text-sm xpo_mb-8">{__('Description')}</label>
                        <textarea className="form-control" id="taskDescription" rows="3" placeholder="Write some text" required></textarea>
                    </div>
                    <div className="mb-3">
                        <label htmlFor="taskImage" className="form-label fw-semibold xpo_text-primary-light xpo_text-sm xpo_mb-8">{__('Attachments')} <span className="text-sm">(Jpg, Png format)</span></label>
                        <input type="file" className="form-control" id="taskImage" />
                        <img id="taskImagePreview" src="assets/images/carousel/carousel-img1.png" alt={__('Image Preview')} />
                    </div>
                    <div className="xpo_flex xpo_flex-nowrap xpo_gap-5xpo_items-center xpo_justify-end">
                        <button type="button" className="border border-danger-600 bg-hover-danger-200 xpo_text-danger-600 xpo_text-md px-50 py-11 radius-8" onClick={() => setPopup(null)}>{__('Cancel')}</button>
                        <button type="button" className="btn btn-primary border border-primary-600 xpo_text-md px-28 py-12 radius-8">{__('Save Changes')}</button>
                    </div>
                </form>
            </div>
        </div>
    )
}


const SingleColumn = ({ data, __, setPopup, empty, setProject, hooks={} }) => {
    const { onUpdateColumn, onDeleteColumn, onAddColumn } = hooks;
    const { contract_id } = useParams();
    const buttonRef = useRef(null);
    const dropdownRef = useRef(null);
    const [column, setColumn] = useState(null);
    const [menuOpened, setMenuOpened] = useState(false);
    
    useEffect(() => {
        setColumn(data);
        if (column === null && data && data.id !== null) {return;}
        const isCreating = data.id === null;data.id = data.id === null ? 0 : data.id;
        request(rest_url(`/sitecore/v1/columns/${data.id}`), {method: 'POST', headers: {"Content-Type": "application/json", 'Cache-Control': 'no-cache'}, body: JSON.stringify({...data, cards: null})})
        .then(res => onUpdateColumn(res))
        .then(() => notify.success(isCreating ? __('Column created successfully!') : __('Column updated successfully!')))
        .catch(err => notify.error(err?.response?.message??err?.message??__('Something went wrong!')))
        // .finally(() => setPopup(null));
    }, [data]);

    useEffect(() => {
        if (menuOpened && buttonRef.current && dropdownRef.current) {
            createPopper(buttonRef.current, dropdownRef.current, {
                placement: 'bottom-end',
                modifiers: [
                    {
                        name: 'offset', options: {offset: [0, 10]}
                    },
                ],
            });
        }
    }, [menuOpened]);

    const onAddCard = (data) => {
        column.cards = [...column.cards, data];
        setProject(prev => ({...prev, columns: prev.columns.map(col => col.id === column.id ? column : col)}));
        return Promise.resolve(true);
    }

    const onUpdateCard = (data) => {
        column.cards = column.cards.map(c => c.id == data.id ? data : c);
        setProject(prev => ({...prev, columns: prev.columns.map(col => col.id === column.id ? column : col)}));
        return Promise.resolve(true);
    }

    const onDeleteCard = (data) => {
        column.cards = column.cards.filter(c => c.id !== data.id);
        setProject(prev => ({...prev, columns: prev.columns.map(col => col.id === column.id ? column : col)}));
        return Promise.resolve(true);
    }
    
    return (
        <div className="w-25 xpo_w-80 kanban-item radius-12 pending-card min-w-60 md:min-w-80">
            <div className="card xpo_p-0 radius-12 overflow-unset shadow-none">
                <div className="card-body xpo_p-0 xpo_pb-24">
                    <div className="xpo_flex xpo_items-center xpo_gap-2 xpo_justify-between ps-24 xpo_pt-24 pe-24">
                        <h6 className="text-lg fw-semibold xpo_mb-0">
                            <input
                                type="text"
                                className="form-control bg-transparent xpo_text-lg fw-semibold border-none focus:border-solid focus:border-primary-600"
                                value={empty(column?.title, __('Untitled Column'))}
                                onChange={(e) => setColumn(prev => ({...prev, title: e.target.value}))}
                                onBlur={(e) => {
                                    e.preventDefault();
                                    request(rest_url(`/sitecore/v1/columns/${column.id}`), {method: 'POST', headers: {"Content-Type": "application/json", 'Cache-Control': 'no-cache'}, body: JSON.stringify({...column, title: e.target.value})})
                                    // .then(res => onUpdateColumn(res))
                                    .catch(err => notify.error(err?.response?.message??err?.message??__('Something went wrong!')))
                                }}
                            />
                        </h6>
                        <div className="xpo_flex xpo_items-center xpo_gap-3 xpo_justify-between xpo_mb-0">
                            <button type="button" className="text-2xl hover-text-primary add-task-button" onClick={() => onAddCard({id: null, column_id: column.id, title: '', description: '', tags: [], created_at: Date.now(), updated_at: Date.now()})}>
                                <CirclePlus className="icon" />
                            </button>
                            <div className="dropdown">
                                <button type="button" onClick={() => setMenuOpened(true)} ref={buttonRef}>
                                    <EllipsisVertical className="text-xl" />
                                </button>
                                {menuOpened && <div className="fixed top-0 left-0 xpo_w-full xpo_h-full z-10" onClick={(e) => setMenuOpened(false)}></div>}
                                <ul className={ `dropdown-menu xpo_p-12 border bg-base shadow ${menuOpened ? 'show' : null}` } ref={dropdownRef}>
                                    <li>
                                        <button
                                            onClick={() => onAddColumn({...column, id: null}).then(() => setMenuOpened(false))}
                                            className="duplicate-button dropdown-item px-16 py-8 rounded xpo_text-secondary-light bg-hover-neutral-200 xpo_text-hover-neutral-900 flex xpo_items-center xpo_gap-2"
                                        >
                                            <Copy className="text-xl" />
                                            {__('Duplicate')}
                                        </button>
                                    </li>
                                    <li>
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setMenuOpened(false);
                                                setPopup(
                                                    <div className="relative xpo_max-w-sm flex xpo_flex-col xpo_gap-5">
                                                        <h6 className="text-primary-500 xpo_text-lg fw-semibold">{__('Are you sure you want to delete this Column? This can\'t be undone!')}</h6>
                                                        <div className="xpo_flex xpo_flex-nowrap xpo_gap-5xpo_items-center xpo_justify-end">
                                                            <button className="btn btn-light-100 xpo_text-dark radius-8 px-15 py-6" onClick={() => setPopup(null)}>{__('No, cancel')}</button>
                                                            <button className="btn btn-danger-600 radius-8 px-15 py-6" onClick={(e) => {
                                                                e.preventDefault();
                                                                request(rest_url(`/sitecore/v1/columns/${column.id}`), {method: 'DELETE', headers: {"Content-Type": "application/json", 'Cache-Control': 'no-cache'}})
                                                                .then(data => notify.success(__('Column deleted successfully!')))
                                                                .then(() => onDeleteColumn(column))
                                                                .catch(err => notify.error(err?.response?.message??err?.message??__('Something went wrong!')))
                                                                .finally(() => setPopup(null));
                                                            }}>{__('Yes, I\'m sure')}</button>
                                                        </div>
                                                    </div>
                                                );
                                            }}
                                            className="delete-button dropdown-item px-16 py-8 rounded xpo_text-secondary-light bg-hover-neutral-200 xpo_text-hover-neutral-900 flex xpo_items-center xpo_gap-2"
                                        >
                                            <Trash2 className="text-xl" />
                                            {__('Delete')}
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
        
                    <div className="connectedSortable ps-24 xpo_pt-24 pe-24" id="sortable2">
                        {(column?.cards??[]).map((card, cardIndex) => (
                            <SingleCard
                                key={cardIndex}
                                data={card}
                                __={__}
                                setPopup={setPopup}
                                empty={empty}
                                setProject={setProject}
                                hooks={{
                                    ...hooks,
                                    onUpdateCard,
                                    onDeleteCard,
                                    onAddCard
                                }}
                            />
                        ))}
                    </div>
                    
                    <button type="button" className="xpo_flex xpo_items-center xpo_gap-2 fw-medium xpo_w-100 xpo_text-primary-600 xpo_justify-content-center xpo_text-hover-primary-800 add-task-button" onClick={() => onAddCard({id: null, column_id: column.id, title: '', description: '', sort_order: column.cards?.length??0, tags: [], created_at: Date.now(), updated_at: Date.now()})}>
                        <CirclePlus className="icon xpo_text-xl" />
                        {__('Add Card')}
                    </button>
                </div>
            </div>
        </div>
    )
}

const SingleCard = ({ data, __, setPopup, empty, setProject, hooks={} }) => {
    const { onUpdateCard, onDeleteCard, onAddCard } = hooks;
    const { contract_id } = useParams();
    const [card, setCard] = useState(null);
    const [inited, setInited] = useState(false);

    useEffect(() => {
        setCard(data);
        if (card === null && data && data.id !== null) {return;}
        const isCreating = data.id === null;data.id = data.id === null ? 0 : data.id;
        if (!isCreating) {return;}
        request(rest_url(`/sitecore/v1/cards/${data.id}`), {method: 'POST', headers: {"Content-Type": "application/json", 'Cache-Control': 'no-cache'}, body: JSON.stringify({...data})})
        .then(res => onUpdateCard(res))
        .then(() => notify.success(isCreating ? __('Card created successfully!') : __('Card updated successfully!')))
        .catch(err => notify.error(err?.response?.message??err?.message??__('Something went wrong!')))
        // .finally(() => setPopup(null));
    }, [data]);
    
    return (
        <div
            onClick={(e) => setPopup(
                <CardViewer
                    data={card}
                    __={__}
                    setPopup={setPopup}
                    empty={empty}
                    setProject={setProject}
                    hooks={{
                        ...hooks
                    }}
                />
            )}
            className={ `kanban-card bg-neutral-50 xpo_p-16 radius-8 xpo_mb-24 cursor-pointer` }
        >
            <h6 className="kanban-title xpo_text-lg fw-semibold xpo_mb-8">{empty(card?.title, __('Untitled card'))}</h6>
            <p className="kanban-desc xpo_text-secondary-light xpo_text-ellipsis line-clamp-3 leading-normal">{card?.description}</p>
            {(card?.tags??[]).map((tag, tagIndex) => (
                <button key={tagIndex} type="button" className="btn xpo_text-primary-600 border rounded border-primary-600 bg-hover-primary-600 xpo_text-hover-white flex xpo_items-center xpo_gap-2">
                    <Tag className="icon" /><span className="kanban-tag fw-semibold">{tag}</span>
                </button>
            ))}
            <div className="mt-12 flex xpo_items-center xpo_justify-between xpo_gap-10">
                <div className="xpo_flex xpo_items-center xpo_justify-between xpo_gap-10">
                    <CalendarDays className="text-primary-light" />
                    <span className="start-date xpo_text-secondary-light">{strtotime(card?.updated_at??0).format('DD MMM YYYY')}</span>
                </div>
                <div className="xpo_flex xpo_items-center xpo_justify-between xpo_gap-10 relative">
                    <button
                        type="button"
                        className="card-edit-button xpo_text-success-600"
                        onClick={(e) => setPopup(<EditCard data={card} onUpdateCard={(data) => {
                            column.cards = column.cards.map(c => c.id === card.id ? data : c);
                            setProject(prev => ({...prev, columns: prev.columns.map(col => col.id === column.id ? column : col)}));
                        }} __={__} setPopup={setPopup} />)}
                    >
                        <SquarePen className="icon xpo_text-lg line-height-1" />
                    </button>
                    <button
                        type="button"
                        className="card-delete-button xpo_text-danger-600"
                        onClick={(e) => {
                            e.preventDefault();
                            setPopup(
                                <div className="relative xpo_max-w-sm flex xpo_flex-col xpo_gap-5">
                                    <h6 className="text-primary-500 xpo_text-lg fw-semibold">{__('Are you sure you want to delete this card? This can\'t be undone!')}</h6>
                                    <div className="xpo_flex xpo_flex-nowrap xpo_gap-5xpo_items-center xpo_justify-end">
                                        <button className="btn btn-light-100 xpo_text-dark radius-8 px-15 py-6" onClick={() => setPopup(null)}>{__('No, cancel')}</button>
                                        <button className="btn btn-danger-600 radius-8 px-15 py-6" onClick={(e) => {
                                            e.preventDefault();
                                            // contracts/${contract_id}/
                                            request(rest_url(`/sitecore/v1/cards/${card.id}`), {method: 'DELETE', headers: {"Content-Type": "application/json", 'Cache-Control': 'no-cache'}})
                                            .then(data => notify.success(__('Card deleted successfully!')))
                                            .then(() => onDeleteCard(card))
                                            .catch(err => notify.error(err?.response?.message??err?.message??__('Something went wrong!')))
                                            .finally(() => setPopup(null));
                                        }}>{__('Yes, I\'m sure')}</button>
                                    </div>
                                </div>
                            );
                        }}
                    >
                        <Trash2 className="icon xpo_text-lg line-height-1" />
                    </button>
                    <div className="absolute top-0 left-0 xpo_h-full xpo_w-full"></div>
                </div>
            </div>
        </div>
    );
}
const CardViewer = ({ data, __, setPopup, empty, setProject, hooks={} }) => {
    const { onUpdateCard, onDeleteCard, onAddCard, get_users } = hooks;
    const { session: { user_id } } = useSession();
    const { contract_id } = useParams();
    const [card, setCard] = useState({...data});
    const [inited, setInited] = useState(false);
    const [labels, setLabels] = useState([]);
    const [comments, setComments] = useState([]);
    const [checklists, setChecklists] = useState([]);
    const [attachments, setAttachments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [myUserID, setMyUserID] = useState(user_id);
    const [members, setMembers] = useState([]);
    const [ShowPops, setShowPops] = useState(null);
    const [firstTime, setFirstTime] = useState(true);
    const [editingComment, setEditingComment] = useState({id: null, comment: 'my <b>HTML</b>'});

    const buttonRef = useRef(null);
    const dropdownRef = useRef(null);

    const error_handler = (err) => {
        // request.error_notify(err, __);
    };

    const fetch_all = async () => {
        await request(rest_url(`/sitecore/v1/cards/${card.id}/members`), {method: 'GET', headers: {'Cache-Control': 'no-cache'}})
        .then(res => (res.members_id ? res.members_id : '').split(',').map(id => parseInt(id)))
        .then(user_ids => get_users().map(u => ({...u, assigned: user_ids.includes(u.id)})))
        .then(res => setMembers(res))
        .catch(error_handler);
        await request(rest_url(`/sitecore/v1/cards/${card.id}/comments`), {method: 'GET', headers: {'Cache-Control': 'no-cache'}}).then(res => setComments(res)).catch(error_handler);
        await request(rest_url(`/sitecore/v1/cards/${card.id}/checklists`), {method: 'GET', headers: {'Cache-Control': 'no-cache'}}).then(res => setChecklists(
            res.map(i => ({...i, is_completed: parseInt(i.is_completed) === 1}))
        )).catch(error_handler);
        await request(rest_url(`/sitecore/v1/cards/${card.id}/attachments`), {method: 'GET', headers: {'Cache-Control': 'no-cache'}}).then(res => setAttachments(res)).catch(error_handler);
    }
    useEffect(() => {
        try {
            fetch_all();
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            if (card === null || !data || !data?.id) {return;}
            onUpdateCard({...card, checklists: [], attachments: [], comments: [], tags: [], updated_at: Date.now()});
            // console.log({...card, checklists: [], attachments: [], comments: [], tags: [], updated_at: Date.now()});
        }, 2000); // 2000ms = 2 second delay

        return () => clearTimeout(delayDebounce);
    }, [card]);

    useEffect(() => {
        if (ShowPops && buttonRef.current && dropdownRef.current) {
            createPopper(buttonRef.current, dropdownRef.current, {
                placement: 'bottom-end',
                modifiers: [
                    {
                        name: 'offset', options: {offset: [0, 10]}
                    },
                ],
            });
        }
    }, [ShowPops]);

    const update_checklist = (cItem) => {
        const update = (cItem, isCreating, resolve) => {
            cItem.id = isCreating ? Date.now() : cItem.id;
            request(rest_url(`/sitecore/v1/cards/${card.id}/checklist`), {method: 'POST', headers: {"Content-Type": "application/json", headers: {'Cache-Control': 'no-cache'}}, body: JSON.stringify({...cItem, id: isCreating ? 0 : cItem.id})})
            .then(res => isCreating && setChecklists(prev => isCreating ? [...prev, res] : prev.map(i => i.id === cItem.id ? cItem : i)))
            .catch(err => request.error_notify(err, __))
            .finally(() => resolve(true))
        }
        const isCreating = cItem.id === null;
        if (isCreating) {
            return new Promise((resolve, reject) => update(cItem, isCreating, resolve));
        } else {
            update(cItem, isCreating);
            setChecklists(prev => prev.map(i => i.id === cItem.id ? cItem : i));
            return true;
        }
    }


    useEffect(() => {
        if (firstTime) {setFirstTime(false);return;}
        request(rest_url(`/sitecore/v1/cards/${card.id}/members`), {method: 'POST', headers: {"Content-Type": "application/json", 'Cache-Control': 'no-cache'}, body: JSON.stringify({members: members.filter(m => m.assigned).map(m => m.id).join(',')})}).catch(error_handler);
        // console.log('members', members);
    }, [members]);

    return (
        <div className="w-[1000px] xpo_max-w-full">
            <div className="xpo_flex xpo_flex-col xpo_w-full xpo_gap-3">
                <div className="block relative">
                    <div className="xpo_grid grid-cols-1 md:xpo_grid-cols-[3fr_1fr] xpo_gap-5 overflow-hidden overflow-y-auto xpo_max-h-[60vh]">
                        <div className="xpo_flex xpo_flex-col xpo_gap-3 xpo_p-3">
                            <div className="xpo_grid grid-cols-[0px_1fr] hover:xpo_grid-cols-[40px_1fr] xpo_gap-2 transition-all delay-75xpo_items-center">
                                <div className="overflow-hidden">
                                    <div className="form-switch switch-primary flex xpo_justify-center">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            role="switch"
                                            checked={card?.is_completed??false}
                                            onChange={(e) => {
                                                setCard(prev => ({...prev, is_completed: e.target.checked}));
                                                request(rest_url(`/sitecore/v1/cards/${card.id}`), {method: 'POST', headers: {"Content-Type": "application/json", 'Cache-Control': 'no-cache'}, body: JSON.stringify({...card, is_completed: e.target.checked})})
                                                // .then(res => onUpdateCard(res))
                                                .catch(err => request.error_notify(err, __))
                                            }}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <input
                                        type="text"
                                        onBlur={(e) => {
                                            e.preventDefault();
                                            request(rest_url(`/sitecore/v1/cards/${card.id}`), {method: 'POST', headers: {"Content-Type": "application/json", 'Cache-Control': 'no-cache'}, body: JSON.stringify({...card, title: e.target.value})})
                                            // .then(res => onUpdateCard(res))
                                            .catch(err => request.error_notify(err, __))
                                        }}
                                        value={empty(card?.title, __('Untitled card'))}
                                        onChange={(e) => setCard(prev => ({...prev, title: e.target.value}))}
                                        className="w-full form-control border-none focus:border-solid font-bold py-2 px-3 xpo_text-2xl"
                                    />
                                </div>
                            </div>
                            <div className="xpo_grid grid-cols-[30px_1fr] xpo_gap-2 items-start">
                                <div>
                                    <AlignLeft className="block xpo_mt-1" />
                                </div>
                                <textarea
                                spellCheck={false}
                                value={card?.description}
                                rows={card?.description?.length >= 200 ? 8 : 3}
                                onChange={(e) => setCard(prev => ({...prev, description: e.target.value}))}
                                onBlur={(e) => {
                                    e.preventDefault();
                                    request(rest_url(`/sitecore/v1/cards/${card.id}`), {method: 'POST', headers: {"Content-Type": "application/json", 'Cache-Control': 'no-cache'}, body: JSON.stringify({...card, description: e.target.value})})
                                    // .then(res => onUpdateCard(res))
                                    .catch(err => request.error_notify(err, __))
                                }}
                                className="w-full form-control border-none focus:border-solid py-2 px-3 xpo_text-lg overflow-hidden focus:overflow-auto"
                                ></textarea>
                            </div>
                            {attachments?.length ? (
                                <div className="xpo_grid grid-cols-[30px_1fr] xpo_gap-2 items-start">
                                    <div>
                                        <Paperclip className="block xpo_mt-1" />
                                    </div>
                                    <div className="xpo_flex xpo_flex-col xpo_gap-2">
                                        <div className="font-semibold xpo_text-primary-light xpo_text-sm xpo_mb-8">{__('Attachments')}</div>
                                        <div className="xpo_flex xpo_flex-col xpo_gap-2">
                                            {attachments.map((attachment, attachmentIndex) => (
                                                <div key={attachmentIndex} className="xpo_flex xpo_flex-nowrapxpo_items-center xpo_gap-2">
                                                    <img src={attachment?.url} alt={attachment?.name} className="w-10 xpo_h-10 object-cover border-radius-8" />
                                                    <div className="xpo_flex xpo_flex-col xpo_gap-1">
                                                        <span className="text-sm font-semibold">{attachment?.name}</span>
                                                        <span className="text-xs xpo_text-secondary-light">{attachment?.size}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : null}

                            {checklists?.length ? (
                                <div className="xpo_grid grid-cols-[30px_1fr] xpo_gap-2 items-start">
                                    <div>
                                        <ListTodo className="block xpo_mt-1" />
                                    </div>
                                    <div className="xpo_flex xpo_flex-col xpo_gap-2">
                                        <h6 className="font-semibold xpo_text-primary-light xpo_text-md">{__('Checklist')}</h6>
                                        <div className="xpo_flex xpo_flex-col xpo_gap-0">
                                            {checklists.map((item, itemIndex) => (
                                                <div key={itemIndex} className="xpo_flex xpo_flex-nowrapxpo_items-center xpo_gap-2">
                                                    <input type="checkbox" className="form-check-input" checked={item?.is_completed} onChange={(e) => update_checklist({...item, is_completed: e.target.checked})} />
                                                    <input
                                                        type="text"
                                                        className="w-full form-control border-none focus:border-solid py-1 px-2 xpo_h-4"
                                                        value={item?.title} onChange={(e) => setChecklists(prev => prev.map(i => i.id === item.id ? {...i, title: e.target.value} : i))}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') {
                                                                e.preventDefault();
                                                                e.target.blur();
                                                            }
                                                        }}
                                                        onBlur={(e) => update_checklist({...item, title: e.target.value})} />
                                                        <Trash2 className="hover:text-danger-500 cursor-pointer xpo_h-4" onClick={(e) => {
                                                            const sure = confirm(__('Are you sure you want to delete this checklist item? This can\'t be undone!'));
                                                            if (!sure) {return;}
                                                            request(rest_url(`/sitecore/v1/checklists/${item.id}`), {method: 'DELETE', headers: {"Content-Type": "application/json", 'Cache-Control': 'no-cache'}})
                                                            .then(() => setChecklists(prev => prev.filter(i => i.id !== item.id)))
                                                            .catch(err => request.error_notify(err, __))
                                                        }} />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : null}

                            <div className="xpo_grid grid-cols-[30px_1fr] xpo_gap-2 items-start">
                                <div>
                                    <MessagesSquare className="block xpo_mt-1" />
                                </div>
                                <div className="xpo_flex xpo_flex-col xpo_gap-2">
                                    <h6 className="font-semibold xpo_text-primary-light xpo_text-md">{__('Comments')}</h6>
                                    <div className="xpo_flex xpo_flex-col xpo_gap-2 xpo_max-w-[650px]">
                                        <EditorProvider>
                                            <Editor value={editingComment.comment} onChange={(e) => setEditingComment(prev => ({...prev, comment: e.target.value}))}></Editor>
                                            <button type="button" className="btn btn-primary xpo_mt-2 flex xpo_items-center xpo_justify-center xpo_w-fit xpo_gap-3 px-6 py-2 disabled:bg-slate-300 disabled:border-slate-300" disabled={editingComment.comment.trim() === '<br>' || editingComment.comment.trim() === ''} onClick={(e) => 
                                                request(rest_url(`/sitecore/v1/cards/${card.id}/comment`), {method: 'POST', body: JSON.stringify({...editingComment, id: editingComment.id??null}), headers: {"Content-Type": "application/json", 'Cache-Control': 'no-cache'}})
                                                .then(res => 
                                                    setComments(prev => editingComment.id === null ? [...prev, editingComment] : prev.map(i => i.id === editingComment.id ? {...i, comment: editingComment.comment} : i))
                                                )
                                                .catch(request.error_notify)
                                                .finally(() => setEditingComment({id: null, comment: ''}))
                                            }>
                                                <Send className="icon" />
                                                <span>{__('Send')}</span>
                                            </button>
                                        </EditorProvider>
                                    </div>
                                    {comments?.length ? (
                                        <div className="xpo_flex xpo_flex-col xpo_gap-2 xpo_mt-2">
                                            {comments.map((item, itemIndex) => (
                                                <div key={itemIndex} className="xpo_flex xpo_flex-col xpo_items-center xpo_gap-2">
                                                    {/* <input type="text" className="w-full form-control border-none focus:border-solid py-2 px-3" value={item?.comment} onChange={(e) => setComments(prev => prev.map(i => i.id === item.id ? {...i, comment: e.target.checked} : i))} /> */}
                                                    <p className="block xpo_w-full whitespace-normal comments-list-item" dangerouslySetInnerHTML={{__html: item.comment}}></p>
                                                    <div className="xpo_flex self-endxpo_items-center xpo_gap-2 xpo_flex-nowrap">
                                                        <SquarePen className="text-danger-500 cursor-pointer xpo_h-4" onClick={e => setEditingComment(item)} />
                                                        <Trash2 className="text-danger-500 cursor-pointer xpo_h-4" onClick={(e) => {
                                                            const sure = confirm(__('Are you sure you want to delete this comment? This can\'t be undone!'));
                                                            if (!sure) {return;}
                                                            request(rest_url(`/sitecore/v1/comments/${item.id}`), {method: 'DELETE', headers: {"Content-Type": "application/json", 'Cache-Control': 'no-cache'}})
                                                            .then(() => setComments(prev => prev.filter(i => i.id !== item.id)))
                                                            .catch(err => request.error_notify(err, __))
                                                        }} />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : null}
                                </div>
                            </div>
                            
                        </div>
                        <div className="xpo_flex xpo_flex-col xpo_gap-3 sticky top-4 self-start">
                            <div className="xpo_grid grid-cols-[1fr_1fr] xpo_gap-2">
                                <div className="xpo_flex xpo_flex-col xpo_gap-3">
                                    <label htmlFor="taskTag" className="form-label fw-semibold xpo_text-primary-light xpo_text-sm xpo_mb-8">{__('Tag')}</label>
                                    <input type="text" className="form-control" placeholder="Enter tag" id="taskTag" value={card?.tags??[]} onChange={(e) => setCard(prev => ({...prev, tags: e.target.value.split(',')}))} />
                                </div>
                                <div className="xpo_flex xpo_flex-col xpo_gap-3">
                                    <label htmlFor="startDate" className="form-label fw-semibold xpo_text-primary-light xpo_text-sm xpo_mb-8">{__('Start Date')}</label>
                                    <input type="date" className="form-control" id="startDate" value={strtotime(card?.updated_at??0).format('YYYY-MM-DD')} onChange={(e) => setCard(prev => ({...prev, updated_at: strtotime(e.target.value).format('YYYY-MM-DD HH:mm:ss')}))} />
                                </div>
                            </div>
                            <div className="xpo_flex xpo_flex-col xpo_gap-2 px-3 py-4">
                                {members?.length ? (
                                    <button
                                        type="button"
                                        className="btn btn-light-100 xpo_text-dark radius-8 px-14 py-6 xpo_text-sm flex xpo_justify-startxpo_items-center xpo_gap-2"
                                        onClick={(e) => setMembers(prev => prev.map(m => m.id == myUserID ? {...m, assigned: !m.assigned} : m))}
                                    >
                                        {members.some(m => m.assigned && m.id == myUserID) ? <UserMinus /> : <UserPlus />}
                                        <span>{members.some(m => m.assigned && m.id == myUserID) ? __('Leave') : __('Join')}</span>
                                    </button>
                                ) : null}
                                {members?.length ? (
                                    <button
                                        type="button"
                                        className="btn btn-light-100 xpo_text-dark radius-8 px-14 py-6 xpo_text-sm flex xpo_justify-startxpo_items-center xpo_gap-2"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setShowPops(() => () => {
                                                const [people, setPeople] = useState([]);
                                                const [first, setFirst] = useState(true);

                                                useEffect(() => {
                                                    if (people.length) {return;}
                                                    setPeople(members);
                                                }, [members]);

                                                useEffect(() => {
                                                    if (!people.length) {return;}
                                                    if (first) {setFirst(p => false);return;}
                                                    setMembers(people);
                                                }, [people]);

                                                return (
                                                    <div className="xpo_flex xpo_flex-col xpo_gap-2">
                                                        <h6 className="text-primary-500 xpo_text-lg fw-semibold">{__('Members')}</h6>
                                                        {people.length ? (
                                                            <div>
                                                                <p className="block">{__('Members')}</p>
                                                                <div className="xpo_flex xpo_flex-col xpo_gap-2">
                                                                    {people.sort((a, b) => (b?.assigned - a?.assigned)).map((member, memberIndex) => (
                                                                        <div
                                                                            key={memberIndex}
                                                                            onClick={(e) => setPeople(prev => prev.map(m => m.id == member.id ? {...m, assigned: !m.assigned} : m))}
                                                                            className="xpo_flex xpo_flex-nowrapxpo_items-center xpo_gap-2 cursor-pointer hover:bg-gray-100 transition-all duration-75 px-2 py-2 rounded-md"
                                                                        >
                                                                            <img src={member?.avater} alt={__('Avater')} className="w-10 xpo_h-10 object-cover xpo_p-2 rounded-full" />
                                                                            <span className="text-sm font-semibold">{[member?.first_name, member?.last_name].join(' ').trim()}</span>
                                                                            {member?.assigned ? <UserMinus className="text-primary-500 xpo_ml-auto" /> : <UserPlus className="text-primary-500 xpo_ml-auto" />}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        ) : null}
                                                    </div>
                                                );
                                            });
                                        }}
                                    >
                                        <User />
                                        <span>{__('Members')}</span>
                                    </button>
                                ) : null}
                                {labels?.length ? (
                                    <button
                                        type="button"
                                        className="btn btn-light-100 xpo_text-dark radius-8 px-14 py-6 xpo_text-sm flex xpo_justify-startxpo_items-center xpo_gap-2"
                                    >
                                        <Tag />
                                        <span>{__('Labels')}</span>
                                    </button>
                                ) : null}
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setShowPops(() => () => {
                                            const defaultObj = {id: null, card_id: card.id, title: __('Checklist'), is_completed: false};
                                            const [check, setCheck] = useState({...defaultObj, sort_order: checklists.length});
                                            return (
                                                <div className="xpo_flex xpo_flex-col xpo_gap-3">
                                                    <h6 className="text-primary-500 xpo_text-lg fw-semibold">
                                                        <input
                                                            type="text"
                                                            value={check?.title}
                                                            className="w-full form-control border-none focus:border-solid py-2 px-3"
                                                            onChange={(e) => setCheck(prev => ({...prev, title: e.target.value}))}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') {
                                                                    e.preventDefault();
                                                                    update_checklist(check).then(() => setCheck({...defaultObj, sort_order: checklists.length}));
                                                                }
                                                            }}
                                                            onBlur={(e) => setShowPops(null)}
                                                        />
                                                    </h6>
                                                </div>
                                            )
                                        });
                                    }}
                                    className="btn btn-light-100 xpo_text-dark radius-8 px-14 py-6 xpo_text-sm flex xpo_justify-startxpo_items-center xpo_gap-2"
                                >
                                    <SquareCheckBig />
                                    <span>{__('Checklist')}</span>
                                </button>

                                {ShowPops && <div className="absolute top-0 left-0 xpo_w-full xpo_h-full card opacity-25" onClick={(e) => setShowPops(null)}></div>}
                                <div
                                    className={ `card xpo_p-3 py-5 xpo_w-80 xpo_max-w-full shadow-lg border-radius-8 z-10 ${!ShowPops ? 'hidden' : null}` }
                                    style={{top: '50%', left: '0', width: '100%', height: 'auto', position: 'absolute', transform: 'translate(-50%, -50%)'}}
                                >
                                    {ShowPops && <ShowPops />}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}