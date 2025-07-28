import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';

import { __, home_route } from '@js/utils';

import Application from './App';

const SearchHome = lazy(() => import('./search/home'));
const SearchResults = lazy(() => import('./search/result'));
const Search404 = lazy(() => import('./search/error404'));

const MeetsHome = lazy(() => import('./meets/home'));
const MeetsRoom = lazy(() => import('./meets/room'));
const Meets404 = lazy(() => import('./search/error404'));

const HealthsHome = lazy(() => import('./healths/home'));
const HealthsRoom = lazy(() => import('./healths/room'));
const Healths404 = lazy(() => import('./search/error404'));

const N8NHome = lazy(() => import('./n8n/home'));
const N8NCanvas = lazy(() => import('./n8n/canvas'));
const N8N404 = lazy(() => import('./search/error404'));

const MCPHome = lazy(() => import('./mcp/home'));
const MCPAddon = lazy(() => import('./mcp/addon'));
const MCPChat = lazy(() => import('./mcp/chat'));
const MCPClient = lazy(() => import('./mcp/client'));
const MCP404 = lazy(() => import('./search/error404'));

const BStream = lazy(() => import('./bstream'));
// const BStreamError = lazy(() => import('./bstream/error'));

const AgentikHome = lazy(() => import('./agentik/workspaces'));
const AgentikWorkspace = lazy(() => import('./agentik/workspace'));
const AgentikRoom = lazy(() => import('./agentik/room'));
const AgentikChat = lazy(() => import('./agentik/chat'));
const AgentikError = lazy(() => import('./search/error404'));

const Error404 = lazy(() => import('./search/error404'));

export default function Banglee() {
    return (
        <Application>
            <Suspense fallback={<div className="xpo_text-center xpo_p-4">{__('Loading...')}</div>}>
                <Routes>
                    <Route path={home_route('/')} element={<SearchHome />} />
                    <Route path={home_route('/search')} element={<SearchHome />} />
                    <Route path={home_route('/search/:s')} element={<SearchResults />} />
                    <Route path={home_route('/search/*')} element={<Search404 />} />

                    <Route path={home_route('/meets')} element={<MeetsHome />} />
                    <Route path={home_route('/meets/:room_id')} element={<MeetsRoom />} />
                    <Route path={home_route('/meets/*')} element={<Meets404 />} />

                    <Route path={home_route('/healths')} element={<HealthsHome />} />
                    {/* <Route path={home_route('/healths/:room_id')} element={<HealthsRoom />} /> */}
                    <Route path={home_route('/healths/*')} element={<Healths404 />} />

                    <Route path={home_route('/tasks')} element={<N8NHome />} />
                    <Route path={home_route('/tasks/:workflow_id/view')} element={<N8NCanvas />} />
                    <Route path={home_route('/tasks/*')} element={<N8N404 />} />

                    <Route path={home_route('/mcp')} element={<MCPHome />} />
                    <Route path={home_route('/mcp/addons/:addon')} element={<MCPAddon />} />
                    <Route path={home_route('/mcp/client')} element={<MCPClient />} />
                    <Route path={home_route('/mcp/chat')} element={<MCPChat />} />
                    <Route path={home_route('/mcp/*')} element={<MCP404 />} />

                    <Route path={home_route('/bstream/*')} element={<BStream />} />
                    {/* <Route path={home_route('/bstream/*')} element={<BStreamError />} /> */}

                    <Route path={home_route('/agentika')} element={<AgentikHome />} />
                    <Route path={home_route('/agentika/:workspace_id')} element={<AgentikWorkspace />} />
                    <Route path={home_route('/agentika/:workspace_id/rooms/:room_id')} element={<AgentikRoom />} />
                    <Route path={home_route('/agentika/:workspace_id/rooms/:room_id/conversations')} element={<AgentikChat />} />
                    <Route path={home_route('/agentika/*')} element={<AgentikError />} />
                    
                    <Route path={home_route('/*')} element={<Error404 />} />

                </Routes>
            </Suspense>
        </Application>
    )
}